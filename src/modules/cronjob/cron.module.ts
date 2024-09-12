import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
    ]),
  ],
  providers: [
    CronService,
  ],
})
export class CronModule {}
