import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { DeveloperApiKeyGuard } from '../../guards/auth-developer-api-key.guard';
import { EncryptionService } from '../../shared/services/encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
    ]),
  ],
  providers: [
    LeaderboardService,
    DeveloperApiKeyGuard,
    EncryptionService
  ],
  controllers: [
    LeaderboardController
  ]
})
export class LeaderboardModule {}
