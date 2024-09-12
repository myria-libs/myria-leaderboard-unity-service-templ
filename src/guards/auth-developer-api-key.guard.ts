import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { EncryptionService } from "../../src/shared/services/encryption.service";

@Injectable()
export class DeveloperApiKeyGuard implements CanActivate {
  constructor(private readonly decryptService: EncryptionService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const encryptedApiKey = request.headers['encrypted-api-key'];

    console.log('Encrypted api key => ', encryptedApiKey);
    if (!encryptedApiKey) {
      throw new UnauthorizedException('Missing encrypted API key');
    }

    const developerApiKey = process.env.DEVELOPER_API_KEY || "";

    try {
      const decryptedApiKey = this.decryptService.decryptApiKey(encryptedApiKey);

      if (decryptedApiKey !== developerApiKey) {
        throw new UnauthorizedException("Developer API Key is invalided")
      }
      // Attach decryptedApiKey to the request for further use in the controller/services
      request.decryptedApiKey = decryptedApiKey;

      return true;
    } catch (err) {
        console.log('err', err);
      throw new UnauthorizedException('Invalid API key or decryption failure');
    }
  }

}