import { Global, Module, type Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { HttpModuleOverride } from '../modules/http/http.module.override';
import { ApiConfigService } from './services/api-config.service';
import { AwsS3Service } from './services/aws-s3.service';
import { GeneratorService } from './services/generator.service';
import { ValidatorService } from './services/validator.service';
import { EncryptionService } from './services/encryption.service';

const providers: Provider[] = [
  ApiConfigService,
  ValidatorService,
  AwsS3Service,
  GeneratorService,
  EncryptionService
];

@Global()
@Module({
  providers,
  imports: [CqrsModule, HttpModuleOverride],
  exports: [...providers, CqrsModule],
})
export class SharedModule {}
