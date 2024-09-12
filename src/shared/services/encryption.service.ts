import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private publicKey: string;
  private privateKey: string;

  constructor() {
    // Load RSA keys from environment variables
    this.publicKey = process.env.PUBLIC_RSA_KEY || "";
    this.privateKey = process.env.PRIVATE_RSA_KEY || "";

    if (!this.publicKey || !this.privateKey) {
      throw new Error('RSA keys are not set in the environment variables');
    }
  }

  public encryptApiKey(apiKey: string): string {
    const buffer = Buffer.from(apiKey, 'utf-8');
    const encrypted = crypto.publicEncrypt(
      {
        key: this.publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    return encrypted.toString('base64');
  }

  public decryptApiKey(encryptedApiKey: string): string {
    const buffer = Buffer.from(encryptedApiKey, 'base64');
    console.log('Private key', this.privateKey);
    const decrypted = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );

    const decryptedKey = decrypted.toString('utf-8');
    console.log('decryptedKey', decryptedKey)
    return decryptedKey;
  }
}