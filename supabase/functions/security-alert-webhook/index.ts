// =========================================
// SECURITY ALERT WEBHOOK
// Sends critical security alerts to Slack/Discord
// =========================================

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityIncident {
  id: string;
  created_at: string;
  incident_type: string;
  severity: string;
  ip_address: string;
  user_agent?: string;
  endpoint?: string;
  details?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    console.log('🚨 [SECURITY ALERT] Processing webhook trigger');

    const { incident } = await req.json() as { incident: SecurityIncident };

    if (!incident) {
      return new Response(
        JSON.stringify({ error: 'No incident provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only send alerts for high/critical incidents
    if (!['high', 'critical'].includes(incident.severity)) {
      console.log('ℹ️ [ALERT] Incident severity too low, skipping notification');
      return new Response(
        JSON.stringify({ success: true, message: 'Severity too low for alert' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const alerts: Promise<Response>[] = [];

    // =========================================
    // SLACK WEBHOOK
    // =========================================
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    if (slackWebhookUrl) {
      const slackMessage = {
        text: '🚨 ALERTA DE SEGURANÇA CRÍTICO',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 Alerta de Segurança - Tikvah Psycem',
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Tipo:*\n${incident.incident_type}`
              },
              {
                type: 'mrkdwn',
                text: `*Severidade:*\n${incident.severity === 'critical' ? '🔴 CRÍTICO' : '🟠 ALTO'}`
              },
              {
                type: 'mrkdwn',
                text: `*IP:*\n\`${incident.ip_address}\``
              },
              {
                type: 'mrkdwn',
                text: `*Data:*\n${new Date(incident.created_at).toLocaleString('pt-PT')}`
              }
            ]
          }
        ]
      };

      if (incident.endpoint) {
        slackMessage.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Endpoint:* \`${incident.endpoint}\``
          }
        });
      }

      if (incident.details) {
        slackMessage.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Detalhes:*\n\`\`\`${JSON.stringify(incident.details, null, 2)}\`\`\``
          }
        });
      }

      alerts.push(
        fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage)
        })
      );
    }

    // =========================================
    // DISCORD WEBHOOK
    // =========================================
    const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (discordWebhookUrl) {
      const severityEmoji = incident.severity === 'critical' ? '🔴' : '🟠';
      const severityColor = incident.severity === 'critical' ? 0xFF0000 : 0xFF8800;

      const discordMessage = {
        username: 'Security Alert Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/2913/2913133.png',
        embeds: [
          {
            title: `${severityEmoji} Alerta de Segurança - ${incident.severity.toUpperCase()}`,
            description: `**Tipo:** ${incident.incident_type}\n**IP:** \`${incident.ip_address}\``,
            color: severityColor,
            fields: [
              {
                name: 'Endpoint',
                value: incident.endpoint || 'N/A',
                inline: true
              },
              {
                name: 'Data/Hora',
                value: new Date(incident.created_at).toLocaleString('pt-PT'),
                inline: true
              }
            ],
            timestamp: incident.created_at,
            footer: {
              text: 'Tikvah Psycem Security System'
            }
          }
        ]
      };

      if (incident.details) {
        discordMessage.embeds[0].fields.push({
          name: 'Detalhes',
          value: `\`\`\`json\n${JSON.stringify(incident.details, null, 2).slice(0, 1000)}\n\`\`\``,
          inline: false
        });
      }

      alerts.push(
        fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordMessage)
        })
      );
    }

    if (alerts.length === 0) {
      console.log('⚠️ [ALERT] No webhook URLs configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No webhook URLs configured. Please set SLACK_WEBHOOK_URL or DISCORD_WEBHOOK_URL secrets.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send all alerts in parallel
    const results = await Promise.allSettled(alerts);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ [ALERT] Sent ${successCount} alerts, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        failed: failedCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [ALERT ERROR]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
