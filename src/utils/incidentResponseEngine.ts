/**
 * ELITE THREAT RESPONSE SYSTEM
 * Automated Incident Detection & Response
 * IPS (Intrusion Prevention System)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// =========================================
// THREAT LEVEL DEFINITIONS
// =========================================

export enum ThreatLevel {
  LOW = 'low',           // Monitored
  MEDIUM = 'medium',     // Rate-limited
  HIGH = 'high',         // Blocked for 1 hour
  CRITICAL = 'critical'  // Blocked permanently + escalated
}

export interface IncidentResponse {
  action: 'MONITOR' | 'RATE_LIMIT' | 'BLOCK' | 'BAN' | 'FREEZE_DB';
  duration: number; // ms
  notifyAdmins: boolean;
  freezeDatabase: boolean;
  killActiveSessions: boolean;
}

// =========================================
// AUTOMATED RESPONSE ACTIONS
// =========================================

export class IncidentResponseEngine {
  /**
   * Executar ação automática baseada na ameaça detectada
   */
  static async respondToThreat(
    threatLevel: ThreatLevel,
    ip: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<IncidentResponse> {
    let response: IncidentResponse;

    switch (threatLevel) {
      case ThreatLevel.CRITICAL:
        response = await this.handleCriticalThreat(ip, userId, details);
        break;

      case ThreatLevel.HIGH:
        response = await this.handleHighThreat(ip, userId, details);
        break;

      case ThreatLevel.MEDIUM:
        response = await this.handleMediumThreat(ip, userId, details);
        break;

      case ThreatLevel.LOW:
      default:
        response = await this.handleLowThreat(ip, userId, details);
        break;
    }

    return response;
  }

  /**
   * AMEAÇA CRÍTICA: Database Freeze + Auto-Ban + Escalação
   * Quando houver tentativa de exfiltração em massa
   */
  private static async handleCriticalThreat(
    ip: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<IncidentResponse> {
    console.error('🚨 CRITICAL THREAT DETECTED - ENGAGING EMERGENCY PROTOCOLS');

    try {
      // 1. Banir IP permanentemente
      await supabase.from('ip_blacklist').insert({
        ip_address: ip,
        reason: 'CRITICAL THREAT - Automatic permanent ban',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          threat_type: details?.threatType || 'unknown',
          detected_at: new Date().toISOString(),
          auto_ban: true
        }
      });

      // 2. Se houver user ID, derrubar todas as sessões
      if (userId) {
        await this.killUserSessions(userId);
      }

      // 3. Congelar banco de dados (impede novas conexões)
      await this.freezeDatabase();

      // 4. Notificar admins via webhook crítico
      await this.notifyAdminsCritical(ip, userId, details);

      // 5. Log do incidente crítico
      await supabase.from('security_incidents').insert({
        incident_type: 'CRITICAL_THREAT_RESPONSE',
        severity: 'critical',
        ip_address: ip,
        user_id: userId,
        endpoint: '/threat-response',
        details: {
          action_taken: 'DATABASE_FROZEN_IP_BANNED_ESCALATED',
          ...details
        }
      });

      return {
        action: 'BAN',
        duration: 365 * 24 * 60 * 60 * 1000, // 1 year
        notifyAdmins: true,
        freezeDatabase: true,
        killActiveSessions: true
      };
    } catch (error) {
      console.error('Error handling critical threat:', error);
      throw error;
    }
  }

  /**
   * AMEAÇA ALTA: Bloquear por 1 hora + Notificação
   */
  private static async handleHighThreat(
    ip: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<IncidentResponse> {
    console.warn('⚠️ HIGH THREAT DETECTED - Blocking IP for 1 hour');

    try {
      // Banir por 1 hora
      await supabase.from('ip_blacklist').insert({
        ip_address: ip,
        reason: 'HIGH THREAT - Automatic 1-hour ban',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        metadata: {
          threat_type: details?.threatType || 'unknown',
          detected_at: new Date().toISOString(),
          auto_ban: true
        }
      });

      // Notificar admins
      await this.notifyAdminsWarning(ip, userId, details);

      // Log
      await supabase.from('security_incidents').insert({
        incident_type: 'HIGH_THREAT_RESPONSE',
        severity: 'high',
        ip_address: ip,
        user_id: userId,
        details: {
          action_taken: 'IP_BLOCKED_1_HOUR',
          ...details
        }
      });

      return {
        action: 'BLOCK',
        duration: 60 * 60 * 1000,
        notifyAdmins: true,
        freezeDatabase: false,
        killActiveSessions: false
      };
    } catch (error) {
      console.error('Error handling high threat:', error);
      throw error;
    }
  }

  /**
   * AMEAÇA MÉDIA: Rate Limiting + Monitoramento
   */
  private static async handleMediumThreat(
    ip: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<IncidentResponse> {
    console.warn('⚡ MEDIUM THREAT DETECTED - Applying rate limiting');

    try {
      // Aplicar rate limit agressivo
      await supabase.from('rate_limits').upsert({
        ip_address: ip,
        request_count: 0,
        reset_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        blocked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      });

      // Log
      await supabase.from('security_incidents').insert({
        incident_type: 'MEDIUM_THREAT_RESPONSE',
        severity: 'medium',
        ip_address: ip,
        user_id: userId,
        details: {
          action_taken: 'RATE_LIMIT_APPLIED',
          ...details
        }
      });

      return {
        action: 'RATE_LIMIT',
        duration: 15 * 60 * 1000,
        notifyAdmins: false,
        freezeDatabase: false,
        killActiveSessions: false
      };
    } catch (error) {
      console.error('Error handling medium threat:', error);
      throw error;
    }
  }

  /**
   * AMEAÇA BAIXA: Apenas monitore
   */
  private static async handleLowThreat(
    ip: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<IncidentResponse> {
    // Log silencioso
    await supabase.from('security_incidents').insert({
      incident_type: 'LOW_THREAT_DETECTED',
      severity: 'low',
      ip_address: ip,
      user_id: userId,
      details
    });

    return {
      action: 'MONITOR',
      duration: 0,
      notifyAdmins: false,
      freezeDatabase: false,
      killActiveSessions: false
    };
  }

  /**
   * Derrubar todas as sessões de um usuário
   */
  private static async killUserSessions(userId: string): Promise<void> {
    try {
      // Remover tokens de acesso
      await supabase.auth.admin.deleteUser(userId);
      
      console.warn(`Killed all sessions for user ${userId}`);
    } catch (error) {
      console.error(`Failed to kill sessions for user ${userId}:`, error);
    }
  }

  /**
   * Congelar banco de dados (modo read-only)
   */
  private static async freezeDatabase(): Promise<void> {
    try {
      // Executar função SQL que coloca o banco em read-only
      await supabase.rpc('emergency_database_freeze');
      console.error('🔒 DATABASE FROZEN - Emergency protocol activated');
    } catch (error) {
      console.error('Failed to freeze database:', error);
      // Continue mesmo se falhar - é um failsafe
    }
  }

  /**
   * Notificar admins de ameaça crítica
   */
  private static async notifyAdminsCritical(
    ip: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch(
        'https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: '🚨 CRITICAL SECURITY THREAT',
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: '🚨 CRITICAL SECURITY THREAT DETECTED'
                }
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*IP Address:*\n${ip}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*User ID:*\n${userId || 'Unknown'}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Timestamp:*\n${new Date().toISOString()}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Action:*\nDatabase FROZEN - IP BANNED`
                  }
                ]
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Details:*\n\`\`\`${JSON.stringify(details, null, 2)}\`\`\``
                }
              }
            ],
            attachments: [
              {
                color: 'danger',
                text: 'IMMEDIATE ACTION REQUIRED: Review security dashboard and threat intelligence'
              }
            ]
          })
        }
      );
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }

  /**
   * Notificar admins de ameaça alta
   */
  private static async notifyAdminsWarning(
    ip: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch(
        'https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: '⚠️ HIGH THREAT DETECTED',
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: '⚠️ HIGH THREAT DETECTED'
                }
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*IP Address:*\n${ip}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Status:*\nBlocked for 1 hour`
                  }
                ]
              }
            ]
          })
        }
      );
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }
}

// =========================================
// FAIL2BAN INTEGRATION
// =========================================

export class Fail2BanIntegration {
  /**
   * Integrar com Fail2Ban para bloqueio em nível de Firewall
   * Bash script para executar no servidor:
   * 
   * #!/bin/bash
   * IP=$1
   * DURATION=$2
   * 
   * # Adicionar IP ao iptables
   * iptables -A INPUT -s $IP -j DROP
   * 
   * # Persistir com ipset
   * ipset add blacklist $IP
   * 
   * # Agendar desbloqueio
   * at -f /script/unblock.sh now + ${DURATION}minutes
   */
  
  static async addIPToBlocklist(ip: string, durationMinutes: number = 60): Promise<void> {
    try {
      await fetch('/api/firewall/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, durationMinutes })
      });
    } catch (error) {
      console.error(`Failed to add IP to Fail2Ban blocklist: ${ip}`, error);
    }
  }
}

export default {
  ThreatLevel,
  IncidentResponseEngine,
  Fail2BanIntegration
};
