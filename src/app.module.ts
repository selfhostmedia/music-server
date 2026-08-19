import { ApiModule } from './api/api.module';
import { AppLoggerMiddleware } from './middleware/logger';
import { AuthenticationModule } from './authentication/authentication.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { CookiesModule } from './middleware/cookies';
import { DatabaseModule } from './database/database.module';
import { IndexerModule } from './indexer/indexer.module';
import { Inject, Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { Sequelize } from 'sequelize-typescript';
import { join } from 'node:path';
import Umzug from 'umzug';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    CookiesModule,
    DatabaseModule,
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      global: true,
      useFactory: async () => ({
        global: true,
        secret: process.env.JWT_SECRET,
      }),
    }),
    {
      module: AuthenticationModule,
      global: true,
    },
    ApiModule,
    {
      module: IndexerModule,
      global: true,
    },
  ],
})
export class AppModule implements NestModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(Sequelize) private readonly sequelize: Sequelize,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }

  async onModuleInit() {
    // use write-ahead log for better concurrency and performance
    await this.sequelize.query('PRAGMA journal_mode=WAL;');
    // if using a :memory: sqlite database for tests then make sure the database
    // migrations and seeders are run
    if (this.configService.isTesting()) {
      await this.runMigrationsAndSeeders();
    }
  }

  private async runMigrationsAndSeeders() {
    const migrations = new Umzug({
      migrations: {
        path: join(__dirname, 'database', 'migrations'),
        params: [this.sequelize.getQueryInterface(), Sequelize],
      },
      storage: 'sequelize',
      storageOptions: {
        sequelize: this.sequelize,
      },
    });
    const pendingMigrations = await migrations.pending();
    if (pendingMigrations.length > 0) {
      this.logger.log('Running database migrations...');
      await migrations.up();
      const [rootPaths] = await this.sequelize.query('SELECT COUNT(*) AS count FROM root_paths;');
      if ((rootPaths[0] as { count: number }).count === 0) {
        this.logger.log('Running database seeders...');
        const seeders = new Umzug({
          migrations: {
            path: join(__dirname, 'database', 'seeders'),
            params: [this.sequelize.getQueryInterface(), Sequelize],
          },
          storage: 'sequelize',
          storageOptions: {
            sequelize: this.sequelize,
          },
        });
        await seeders.up();
      }
    }
  }
}
