/**
 * ELITE AUTHENTICATION: FIDO2/WebAuthn
 * Hardware Key Support (YubiKey, etc.)
 * Zero-Phishing, Zero-Passwords for Admin/Staff
 */

import { create, get, parseCreationOptionsJSON, parseRequestOptionsJSON } from '@simplewebauthn/browser';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// =========================================
// TYPES
// =========================================

export interface WebAuthnCredential {
  id: string;
  userId: string;
  publicKey: string;
  credentialDeviceName: string;
  credentialPublicKey: string;
  credentialID: string;
  counter: number;
  transports?: string[];
  backedUp: boolean;
  backupEligible: boolean;
  attestationObject?: string;
  clientDataJSON?: string;
  registrationTime: string;
  lastUsed?: string;
}

export interface WebAuthnChallenge {
  id: string;
  userId: string;
  challenge: string;
  challengeType: 'registration' | 'authentication';
  expiresAt: string;
  usedAt?: string;
}

// =========================================
// WEBAUTHN SERVICE
// =========================================

export class WebAuthnService {
  private rpName = 'Tikvah Psychological Center';
  private rpID = 'tikvah.com'; // Seu domínio
  private origin = 'https://tikvah.com'; // URL completa

  /**
   * Step 1: Iniciar registro de chave de segurança
   */
  async startRegistration(userId: string) {
    try {
      // Gerar challenge no servidor
      const response = await fetch('/api/webauthn/register-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const { options } = await response.json();
      
      return {
        options,
        challenge: options.challenge
      };
    } catch (error) {
      console.error('Failed to start registration:', error);
      throw error;
    }
  }

  /**
   * Step 2: Completar registro de chave (após usuário usar a chave)
   */
  async finishRegistration(
    userId: string,
    credential: any,
    deviceName: string = 'Security Key'
  ) {
    try {
      const response = await fetch('/api/webauthn/register-finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          credential,
          deviceName,
          challenge: credential.response.clientDataJSON
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      return result;
    } catch (error) {
      console.error('Failed to finish registration:', error);
      throw error;
    }
  }

  /**
   * Step 3: Iniciar autenticação com chave de segurança
   */
  async startAuthentication(email?: string) {
    try {
      const response = await fetch('/api/webauthn/authenticate-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const { options } = await response.json();
      return options;
    } catch (error) {
      console.error('Failed to start authentication:', error);
      throw error;
    }
  }

  /**
   * Step 4: Completar autenticação com chave
   */
  async finishAuthentication(credential: any) {
    try {
      const response = await fetch('/api/webauthn/authenticate-finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      return result;
    } catch (error) {
      console.error('Failed to finish authentication:', error);
      throw error;
    }
  }

  /**
   * Registrar nova chave de segurança (Browser side)
   */
  async registerSecurityKey(userId: string, deviceName: string = 'YubiKey') {
    try {
      // 1. Solicitar opções de registro
      const { options } = await this.startRegistration(userId);

      // 2. Converter e apresentar ao navegador
      const creationOptions = parseCreationOptionsJSON(JSON.stringify(options));
      
      // 3. Usuário toca a chave
      const attResp = await create(creationOptions);

      // 4. Enviar resposta ao servidor
      await this.finishRegistration(userId, attResp, deviceName);

      return {
        success: true,
        message: 'Security key registered successfully'
      };
    } catch (error: any) {
      console.error('Security key registration failed:', error);
      throw new Error(
        error.name === 'NotAllowedError'
          ? 'Operation cancelled'
          : error.message || 'Registration failed'
      );
    }
  }

  /**
   * Autenticar com chave de segurança (Browser side)
   */
  async authenticateWithSecurityKey(email?: string) {
    try {
      // 1. Solicitar opções de autenticação
      const options = await this.startAuthentication(email);

      // 2. Converter para formato correto
      const getOptions = parseRequestOptionsJSON(JSON.stringify(options));

      // 3. Usuário toca a chave
      const assertionResp = await get(getOptions);

      // 4. Enviar resposta ao servidor
      const authResult = await this.finishAuthentication(assertionResp);

      return authResult;
    } catch (error: any) {
      console.error('Security key authentication failed:', error);
      throw new Error(
        error.name === 'NotAllowedError'
          ? 'Operation cancelled'
          : error.message || 'Authentication failed'
      );
    }
  }

  /**
   * Listar todas as chaves registradas do usuário
   */
  async listSecurityKeys(userId: string) {
    try {
      const { data, error } = await supabase
        .from('webauthn_credentials')
        .select('*')
        .eq('user_id', userId)
        .order('registration_time', { ascending: false });

      if (error) throw error;

      return data as WebAuthnCredential[];
    } catch (error) {
      console.error('Failed to list security keys:', error);
      throw error;
    }
  }

  /**
   * Remover chave de segurança
   */
  async removeSecurityKey(credentialId: string) {
    try {
      const response = await fetch('/api/webauthn/remove-key', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId })
      });

      if (!response.ok) {
        throw new Error('Failed to remove security key');
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to remove security key:', error);
      throw error;
    }
  }

  /**
   * Verificar se browser suporta WebAuthn
   */
  static isWebAuthnSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      window.PublicKeyCredential ||
      (window.navigator && window.navigator.credentials?.create)
    );
  }

  /**
   * Verificar se dispositivo suporta resident keys (passkeys)
   */
  static async isResidentKeySupported(): Promise<boolean> {
    if (!PublicKeyCredential.isUserVerificationPlatformAuthenticatorAvailable) {
      return false;
    }
    return await PublicKeyCredential.isUserVerificationPlatformAuthenticatorAvailable();
  }
}

export default WebAuthnService;
