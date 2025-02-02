import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../src/auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        name: 'test',
        host: configService.get('TEST_DB_HOST'),
        port: configService.get('TEST_DB_PORT'),
        username: configService.get('TEST_DB_USERNAME'),
        password: configService.get('TEST_DB_PASSWORD'),
        database: configService.get('TEST_DB_DATABASE'),
        entities: [User],
        synchronize: true,
      }),
    }),
  ],
})
export class TestDatabaseModule {}
