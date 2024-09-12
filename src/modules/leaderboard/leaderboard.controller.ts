import { BadRequestException, Body, Controller, Get, Headers, Logger, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { APIResponseType, IPostScoreResp, IQueryScoresResp } from '@myria/leaderboard-ts-sdk';
import { PostScoreParamsDto } from './dtos/PostScore.dto';
import { CustomRequest } from '../../common/custom-request';
import { DeveloperApiKeyGuard } from '../../guards/auth-developer-api-key.guard';
import { PaginationParamDto, QueryScoreByUserIdParamsDto, QueryScoreParamsDto } from './dtos/QueryScoreByLeaderboardId.dto';
import { CommonPaginateDataTypes } from 'myria-core-sdk';


@Controller('leaderboard')
@ApiTags('leaderboard')
export class LeaderboardController {
  private readonly logger = new Logger(LeaderboardController.name);

  constructor(private leaderboardService: LeaderboardService) { }

  @Post('generate-keys')
  @ApiOperation({ summary: 'Generate RSA public and private keys' })  // Describes the operation
  @ApiResponse({
    status: 201,
    description: 'The RSA keys have been generated successfully.',
    schema: {
      example: {
        publicKey: '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCq7h...',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEA...'
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public generateRSAKeys() {
    this.logger.log('Generating RSA keys');

    // Generate RSA Key Pair
    const { publicKey, privateKey } = this.leaderboardService.generateKeyPairs();
    return {
      publicKey,
      privateKey,
    };
  }

  @Post(':id/scores')
  @ApiOperation({ summary: 'Post a new score to the leaderboard' })
  @ApiResponse({
    status: 201,
    description: 'Score posted successfully',
    schema: {
      example: {
        message: 'Scores posted successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @UseGuards(DeveloperApiKeyGuard)
  postScore(
    @Param('id') leaderboardId: string,
    @Body() postNewScoreParams: PostScoreParamsDto,
    @Headers('x-hmac') hmac: string,
    @Headers('encrypted-api-key') encryptedApiKey: string,
    @Req() request: CustomRequest
  ): Promise<APIResponseType<IPostScoreResp[]>> {
    const decryptedApiKey = request.decryptedApiKey;
    
    this.logger.log(`Decrypted api key: ${decryptedApiKey}`);
    this.logger.log(`Posting scores for leaderboardId: ${leaderboardId}`);

    // 1. Pre-validate post score
    this.leaderboardService.preValidatePostScoreWithApiKey(decryptedApiKey, hmac, postNewScoreParams);
    
    // 2. Use decrypted api key for post score
    const postScoreResponse = this.leaderboardService.postScore(postNewScoreParams, decryptedApiKey, leaderboardId);

    return postScoreResponse;
  }

  @Get(':id/scores')
  @ApiOperation({ summary: 'Get scores by leaderboard ID' })
  @ApiResponse({
    status: 200,
    description: 'Scores fetched successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid leaderboard ID' })
  @UseGuards(DeveloperApiKeyGuard)
  getScoresByLeaderboardId(
    @Param('id') leaderboardId: string,
    @Headers('encrypted-api-key') encryptedApiKey: string,
    @Req() request: CustomRequest,
    @Query() queryParams: QueryScoreParamsDto,
  ): Promise<APIResponseType<CommonPaginateDataTypes<IQueryScoresResp> | null>> {

    if (!leaderboardId || Number.isNaN(leaderboardId)) {
      throw new BadRequestException("Leaderboard ID is required with valid number format");
    }
    const decryptedApiKey = request.decryptedApiKey;
    
    this.logger.log(`Decrypted api key: ${decryptedApiKey}`);
    this.logger.log(`Get scores for leaderboardId: ${leaderboardId}`);
    

    // 2. Use decrypted api key for post score
    const postScoreResponse = this.leaderboardService.getScoreByLeaderboardId(decryptedApiKey, Number(leaderboardId), queryParams);

    return postScoreResponse;
  }

  @Get(':leaderboardId/scores/by-user-id/:userId')
  @ApiOperation({ summary: 'Get scores by leaderboard ID' })
  @ApiResponse({
    status: 200,
    description: 'Scores fetched successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid leaderboard ID' })
  @UseGuards(DeveloperApiKeyGuard)
  getScoresByLeaderboardIdAndUserId(
    @Param('leaderboardId') leaderboardId: string,
    @Param('userId') userId: string,
    @Headers('encrypted-api-key') encryptedApiKey: string,
    @Req() request: CustomRequest,
    @Query() queryParams: QueryScoreByUserIdParamsDto,
  ): Promise<APIResponseType<CommonPaginateDataTypes<IQueryScoresResp> | null>> {

    if (!leaderboardId || Number.isNaN(leaderboardId)) {
      throw new BadRequestException("Leaderboard ID is required with valid number format");
    }
    const decryptedApiKey = request.decryptedApiKey;
    
    this.logger.log(`Decrypted api key: ${decryptedApiKey}`);
    this.logger.log(`Get scores for userId: ${userId}`);
    
    // 2. Use decrypted api key for post score
    const postScoreResponse = this.leaderboardService.getScoreByLeaderboardIdAndUserId(decryptedApiKey, Number(leaderboardId), userId , queryParams.period);

    return postScoreResponse;
  }

  @Get('')
  @ApiOperation({ summary: 'Get list leaderboard' })
  @ApiResponse({
    status: 200,
    description: 'Scores fetched successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid leaderboard ID' })
  @UseGuards(DeveloperApiKeyGuard)
  getListLeaderboard(
    @Headers('encrypted-api-key') encryptedApiKey: string,
    @Req() request: CustomRequest,
    @Query() queryParams: PaginationParamDto,
  ): Promise<APIResponseType<CommonPaginateDataTypes<IQueryScoresResp> | null>> {
    let page = 1;
    let limit = 10;
    if(queryParams.page) page = queryParams.page;
    if(queryParams.limit) limit = queryParams.limit;

    const decryptedApiKey = request.decryptedApiKey;
    
    this.logger.log(`Decrypted api key: ${decryptedApiKey}`);
    
    // 2. Use decrypted api key for post score
    const listLeaderboardResponse = this.leaderboardService.getListLeaderboard(decryptedApiKey, page, limit);

    return listLeaderboardResponse;
  }

  @Post(':id/post-scores')
  @ApiOperation({ summary: 'Post a new score to the leaderboard' })
  @ApiResponse({
    status: 201,
    description: 'Score posted successfully',
    schema: {
      example: {
        message: 'Scores posted successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  postScoreTest(
    @Param('id') leaderboardId: string,
    @Body() postNewScoreParams: PostScoreParamsDto,
  @Headers('x-hmac') hmac: string,
  @Headers('encrypted-api-key') encryptedApiKey: string): Promise<APIResponseType<IPostScoreResp[]>> {
    this.logger.log(`Posting scores for leaderboardId: ${leaderboardId}`);

    // 1. Pre-validate post score
    const data = this.leaderboardService.preValidatePostScoreWithEncryptedApiKey(encryptedApiKey, hmac, postNewScoreParams);
    

    // 2. Use decrypted api key for post score
    const postScoreResponse = this.leaderboardService.postScore(postNewScoreParams, data.decryptedApiKey, leaderboardId);

    return postScoreResponse;
  }

  @Post('generate-post-score-hmac/:id')
  @ApiOperation({ summary: 'Post a new score to the leaderboard' })
  @ApiResponse({
    status: 201,
    description: 'Score posted successfully',
    schema: {
      example: {
        message: 'Generate post score hmac successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  generatePostScoreHmac(
    @Param('id') leaderboardId: string,
    @Body() postNewScoreParams: PostScoreParamsDto, @Headers('developerApiKey') developerApiKey: string) {
    this.logger.log(`Posting scores for leaderboardId: ${leaderboardId}`);

    const { encryptedApiKey, hmac, postScorePayload } = this.leaderboardService.generateHmacAndEncryptApiKey(developerApiKey, postNewScoreParams);

    return {
      hmac,
      encryptedApiKey,
      postScorePayload,
    };

  }
}
