import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/auth/entities/user.entity';
import { AuthModule } from '../src/auth/auth.module';
import { TestDatabaseModule } from './test-db.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TestDatabaseModule,
        TypeOrmModule.forFeature([User]),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userRepository = moduleFixture.get('UserRepository');
    await userRepository.clear(); // Clear the test database before each test

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    describe('/auth/register (POST)', () => {
      it('should create a new user', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser)
          .expect(201);
      });

      it('should fail if email is already registered', async () => {
        // First registration
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser);

        // Second registration with same email
        return request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser)
          .expect(409);
      });

      it('should fail if password is too short', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'short',
          })
          .expect(400);
      });
    });

    describe('/auth/login (POST)', () => {
      beforeEach(async () => {
        // Create a user before testing login
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser);
      });

      it('should return JWT token with valid credentials', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(testUser)
          .expect(201);

        expect(response.body.accessToken).toBeDefined();
      });

      it('should fail with invalid credentials', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });
  });
});
