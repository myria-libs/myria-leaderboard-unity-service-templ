import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { isNil } from 'lodash';

import { UserSubscriber } from '../../entity-subscribers/user-subscriber';
import { SnakeNamingStrategy } from '../../snake-naming.strategy';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(`${key} environment variable is not a number`);
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(`${key} env var is not a boolean`);
    }
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replaceAll('\\n', '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get fallbackLanguage(): string {
    return this.getString('FALLBACK_LANGUAGE');
  }

  get postgresConfig(): TypeOrmModuleOptions {
    let entities = [
      `${__dirname}/../../modules/**/*.entity{.ts,.js}`,
      `${__dirname}/../../modules/**/*.view-entity{.ts,.js}`,
    ];
    let migrations = [`${__dirname}/../../database/migrations/*{.ts,.js}`];

    if (module.hot) {
      const entityContext = require.context(
        './../../modules',
        true,
        /\.entity\.ts$/,
      );
      entities = entityContext.keys().map((id) => {
        const entityModule = entityContext<Record<string, unknown>>(id);
        const [entity] = Object.values(entityModule);

        return entity as string;
      });
      const migrationContext = require.context(
        './../../database/migrations',
        false,
        /\.ts$/,
      );

      migrations = migrationContext.keys().map((id) => {
        const migrationModule = migrationContext<Record<string, unknown>>(id);
        const [migration] = Object.values(migrationModule);

        return migration as string;
      });
    }
    if (this.isTest) {
      return {
        entities,
        migrations,
        keepConnectionAlive: !this.isTest,
        dropSchema: this.isTest,
        type: 'postgres',
        name: 'default',
        host: this.getString('DB_HOST_TEST'),
        port: this.getNumber('DB_PORT_TEST'),
        username: this.getString('DB_USERNAME_TEST'),
        password: this.getString('DB_PASSWORD_TEST'),
        database: this.getString('DB_DATABASE_TEST'),
        subscribers: [UserSubscriber],
        migrationsRun: true,
        logging: this.getBoolean('ENABLE_ORM_LOGS_TEST'),
        namingStrategy: new SnakeNamingStrategy(),
      };
    }

    return {
      entities,
      migrations,
      keepConnectionAlive: !this.isTest,
      dropSchema: this.isTest,
      type: 'postgres',
      name: 'default',
      host: this.getString('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      username: this.getString('DB_USERNAME'),
      password: this.getString('DB_PASSWORD'),
      database: this.getString('DB_DATABASE'),
      subscribers: [UserSubscriber],
      migrationsRun: true,
      logging: this.getBoolean('ENABLE_ORM_LOGS'),
      namingStrategy: new SnakeNamingStrategy(),
    };
  }

  get awsS3Config() {
    return {
      bucketRegion: this.getString('AWS_S3_BUCKET_REGION'),
      bucketApiVersion: this.getString('AWS_S3_API_VERSION'),
      bucketName: this.getString('AWS_S3_BUCKET_NAME'),
    };
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION');
  }

  get natsEnabled(): boolean {
    return this.getBoolean('NATS_ENABLED');
  }

  get natsConfig() {
    return {
      host: this.getString('NATS_HOST'),
      port: this.getNumber('NATS_PORT'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
    };
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(`${key} environment variable does not set`); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }
}
