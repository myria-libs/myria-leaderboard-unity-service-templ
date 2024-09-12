import { APIResponseType, InitLeaderboardParams, IPostScoreParams, IPostScoreResp, IQueryLeaderboardsParams, IQueryScoreByLeaderboardAndUserIdParams, IQueryScoreParams, IQueryScoresResp, LeaderboardManager } from '@myria/leaderboard-ts-sdk';
import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { EnvTypes } from 'myria-core-sdk';
import { PostScoreParamsDto } from './dtos/PostScore.dto';
import { QueryScoreByUserIdParamsDto, QueryScoreParamsDto } from './dtos/QueryScoreByLeaderboardId.dto';

const PUBLIC_KEY = process.env.PUBLIC_RSA_KEY || "";
const PRIVATE_KEY = process.env.PUBLIC_RSA_KEY || "";

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  public async getAllScoreByLeaderboard() { }

  public async getScoreByPlayer() { }

  public generateKeyPairs(): { publicKey, privateKey } {
    // Generate RSA Key Pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // key length in bits
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });

    // Log and return the keys
    this.logger.log('RSA keys generated successfully');
    return {
      publicKey,
      privateKey,
    };
  }

  private convertToIQueryScoreParams(leaderboardId: number, dto: QueryScoreParamsDto): IQueryScoreParams {
    this.logger.log('QueryScoreParams => ', JSON.stringify(dto));
    return {
      leaderboardId: leaderboardId,
      limit: dto.limit,
      page: dto.page,
      sortingField: dto.sortingField,
      orderBy: dto.orderBy,
      filters: {
        userId: dto.userId,
        period: dto.period
      },
    };
  }
    private convertToIQueryScoreByUserIdParams(leaderboardId: number, userId: string, dto: QueryScoreByUserIdParamsDto): IQueryScoreByLeaderboardAndUserIdParams {
      this.logger.log('QueryScoreParams => ', JSON.stringify(dto));
      return {
        leaderboardId: leaderboardId,
        userId,
        period: dto.period
      };
  }

  public async getScoreByLeaderboardId(developerApiKey: string, leaderboardId: number, queryScoreParamsRequest: QueryScoreParamsDto): Promise<any> {
    const leaderboardParams: InitLeaderboardParams = {
      env: EnvTypes.STAGING,
      apiKey: developerApiKey,
    };

    const leaderboardManager = new LeaderboardManager(leaderboardParams);

    const queryScoreParams = this.convertToIQueryScoreParams(leaderboardId, queryScoreParamsRequest);
    this.logger.log('Query scores params', queryScoreParams);
    const scores = await leaderboardManager.queryScoresByLeaderboardId(queryScoreParams);

    return scores
  }

  public async getScoreByLeaderboardIdAndUserId(developerApiKey: string, leaderboardId: number, userId: string ,period?: number): Promise<any> {
    const leaderboardParams: InitLeaderboardParams = {
      env: EnvTypes.STAGING,
      apiKey: developerApiKey,
    };

    const leaderboardManager = new LeaderboardManager(leaderboardParams);

    const queryScoreParams: IQueryScoreByLeaderboardAndUserIdParams = this.convertToIQueryScoreByUserIdParams(leaderboardId, userId , {
      period
    })
    this.logger.log('Query scores params', queryScoreParams);
    const score = await leaderboardManager.getScoresByLeaderboardIdAndUserId(queryScoreParams);
    return score
  }

  public async getListLeaderboard(developerApiKey: string, page: number, limit: number): Promise<any> {
    const leaderboardParams: InitLeaderboardParams = {
      env: EnvTypes.STAGING,
      apiKey: developerApiKey,
    };

    const leaderboardManager = new LeaderboardManager(leaderboardParams);

    const queryListLeaderboardParams: IQueryLeaderboardsParams = {
      page,
      limit
    }
    this.logger.log('Query List Leaderboard params', queryListLeaderboardParams);
    const listLeaderboard = await leaderboardManager.getLeaderboards(queryListLeaderboardParams);
    return listLeaderboard
  }

  public async postScore(postNewScoreParamsDto: PostScoreParamsDto, developerApiKey: string, leaderboardId: string): Promise<APIResponseType<IPostScoreResp[]>> {
    const leaderboardParams: InitLeaderboardParams = {
      env: EnvTypes.STAGING,
      apiKey: developerApiKey,
    };

    const leaderboardManager = new LeaderboardManager(leaderboardParams);

    // Map PostScoreParamsDto to IPostScoreParams
    const postNewScoreParams: IPostScoreParams = {
      leaderboardId: +leaderboardId,
      items: postNewScoreParamsDto.items.map(item => ({
        score: item.score,
        displayName: item.displayName || '',
        userId: item.userId || '',
        username: item.username || '',
      })),
    };

    let postScoreResponse: APIResponseType<IPostScoreResp[]>;
    try {
      postScoreResponse = await leaderboardManager.postScoreByLeaderboardId(postNewScoreParams);
    } catch (ex) {
      throw new InternalServerErrorException("Failed to post score to leaderboard, check details error: ", JSON.stringify(ex));
    }


    return postScoreResponse;
  }

  // Encrypt the API key using the public key
  private encryptApiKey(apiKey: string, publicKey: string): string {
    const buffer = Buffer.from(apiKey, "utf-8");
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
    }, buffer);
    return encrypted.toString("base64");
  }

  // Decrypt the API key using the private key
  private decryptApiKey(encryptedApiKey: string, privateKey: string): string {
    const buffer = Buffer.from(encryptedApiKey, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
      },
      buffer
    );
    return decrypted.toString("utf-8");
  }

  // Utility function to generate HMAC using the decrypted API key
  private generateHmac(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  public preValidatePostScoreWithEncryptedApiKey(encryptedApiKey: string, hmacPayload: string, postScoreParams: PostScoreParamsDto): { decryptedApiKey: string } {
    // 1. Decrypt the API key using the private key
    const apiKey = this.decryptApiKey(encryptedApiKey, PRIVATE_KEY);
    this.logger.log(`Decrypted API Key: ${apiKey}`);

    // 2. Generate HMAC for the payload using the decrypted API key
    const payloadString = JSON.stringify(postScoreParams);
    const generatedHmac = this.generateHmac(payloadString, apiKey);
    this.logger.log(`Generated HMAC: ${generatedHmac}`);

    // 3. Compare the generated HMAC with the one provided in the headers
    if (generatedHmac !== hmacPayload) {
      this.logger.error(`Invalid HMAC: Provided HMAC ${hmacPayload} does not match generated HMAC ${generatedHmac}`);
      throw new UnauthorizedException('Invalid HMAC');
    }

    return {
      decryptedApiKey: apiKey
    }
  }

  public preValidatePostScoreWithApiKey(apiKey: string, hmacPayload: string, postScoreParams: PostScoreParamsDto): { decryptedApiKey: string } {
    // 1. Generate HMAC for the payload using the decrypted API key
    const payloadString = JSON.stringify(postScoreParams);
    const generatedHmac = this.generateHmac(payloadString, apiKey);
    this.logger.log(`Generated HMAC: ${generatedHmac}`);

    // 2. Compare the generated HMAC with the one provided in the headers
    if (generatedHmac !== hmacPayload) {
      this.logger.error(`Invalid HMAC: Provided HMAC ${hmacPayload} does not match generated HMAC ${generatedHmac}`);
      throw new UnauthorizedException('Invalid HMAC');
    }

    return {
      decryptedApiKey: apiKey
    }
  }

  public generateHmacAndEncryptApiKey(apiKey: string, postScoreParams: PostScoreParamsDto): {
    encryptedApiKey: string,
    hmac: string,
    postScorePayload: PostScoreParamsDto
  } {

    // 1. Encrypt API key using public key
    const encryptedApiKey = this.encryptApiKey(apiKey, PUBLIC_KEY);
    this.logger.log(`Encrypted API Key: ${encryptedApiKey}`);

    // 2. Generate HMAC for the payload
    const payloadString = JSON.stringify(postScoreParams);
    const secret = apiKey;
    const hmac = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
    this.logger.log(`Generated HMAC: ${hmac}`);



    return {
      encryptedApiKey,
      hmac,
      postScorePayload: postScoreParams
    }
  }
}
