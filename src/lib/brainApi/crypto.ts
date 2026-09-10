import { ProviderType } from '../../types';

// Simple fallback encryption using Web Crypto API for non-Electron or browser environments
const FALLBACK_KEY_SALT = 'JARVIS_BRAIN_KEY_VAULT_2026_SECURE';

async function deriveFallbackKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(FALLBACK_KEY_SALT),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('jarvis_salt_99812'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptApiKey(plainKey: string): Promise<string> {
  if (!plainKey || !plainKey.trim()) return '';

  // 1. Try Electron safeStorage if available in Electron app
  if (typeof window !== 'undefined' && window.electronAPI?.safeStorageEncrypt) {
    try {
      const res = await window.electronAPI.safeStorageEncrypt(plainKey.trim());
      if (res && res.success && res.cipherText) {
        return `safe:${res.cipherText}`;
      }
    } catch (err) {
      console.warn('safeStorage encryption failed, falling back to WebCrypto:', err);
    }
  }

  // 2. WebCrypto AES-GCM encryption fallback
  try {
    const key = await deriveFallbackKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainKey.trim());
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    // Base64 encode
    let binary = '';
    combined.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return `wc:${btoa(binary)}`;
  } catch (err) {
    console.error('WebCrypto encryption failed, using obfuscated storage:', err);
    // Simple fallback obfuscation
    return `obf:${btoa(encodeURIComponent(plainKey.trim()))}`;
  }
}

export async function decryptApiKey(encryptedKey: string): Promise<string> {
  if (!encryptedKey || !encryptedKey.trim()) return '';

  const clean = encryptedKey.trim();

  // Handle Electron safeStorage prefix
  if (clean.startsWith('safe:')) {
    const payload = clean.substring(5);
    if (typeof window !== 'undefined' && window.electronAPI?.safeStorageDecrypt) {
      try {
        const res = await window.electronAPI.safeStorageDecrypt(payload);
        if (res && res.success && res.plainText !== undefined) {
          return res.plainText;
        }
      } catch (err) {
        console.warn('safeStorage decryption error:', err);
      }
    }
    return '';
  }

  // Handle WebCrypto prefix
  if (clean.startsWith('wc:')) {
    try {
      const raw = atob(clean.substring(3));
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i);
      }
      const iv = bytes.slice(0, 12);
      const data = bytes.slice(12);
      const key = await deriveFallbackKey();
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      return new TextDecoder().decode(decrypted);
    } catch (err) {
      console.warn('WebCrypto decryption failed:', err);
      return '';
    }
  }

  // Handle Obfuscation prefix
  if (clean.startsWith('obf:')) {
    try {
      return decodeURIComponent(atob(clean.substring(4)));
    } catch {
      return '';
    }
  }

  // Plaintext legacy compatibility
  return clean;
}

/**
 * Mask API key so that only the last 4 characters are visible
 * Never log or display full API keys in the UI
 */
export function maskApiKey(plainKey: string): string {
  if (!plainKey || plainKey.trim().length === 0) return '';
  const trimmed = plainKey.trim();
  if (trimmed.length <= 4) {
    return '••••••••••••' + trimmed;
  }
  const last4 = trimmed.slice(-4);
  const bulletCount = Math.min(24, Math.max(12, trimmed.length - 4));
  return '•'.repeat(bulletCount) + last4;
}

/**
 * Validates whether an API key has the typical syntax of a provider
 */
export function validateKeyFormat(type: ProviderType, key: string): { valid: boolean; message?: string } {
  if (!key || !key.trim()) {
    return { valid: false, message: 'API key is required' };
  }
  const k = key.trim();

  switch (type) {
    case 'gemini':
      if (k.length < 15) {
        return { valid: false, message: 'Google Gemini API key typically starts with AIzaSy... and is at least 30 chars' };
      }
      break;
    case 'openai':
      if (!k.startsWith('sk-') && k.length < 20) {
        return { valid: false, message: 'OpenAI API key typically starts with sk-...' };
      }
      break;
    case 'anthropic':
      if (!k.startsWith('sk-ant-') && k.length < 20) {
        return { valid: false, message: 'Anthropic API key typically starts with sk-ant-...' };
      }
      break;
    case 'groq':
      if (!k.startsWith('gsk_') && k.length < 15) {
        return { valid: false, message: 'Groq API key typically starts with gsk_...' };
      }
      break;
    case 'custom':
      if (k.length < 4) {
        return { valid: false, message: 'API key is too short' };
      }
      break;
  }

  return { valid: true };
}
