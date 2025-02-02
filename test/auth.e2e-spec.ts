import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/auth/entities/user.entity';
import { AuthModule } from '../src/auth/auth.module';
import { TestDatabaseModule } from './test-db.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

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

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
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

    describe('/auth/signup (POST)', () => {
      it('should create a new user', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(testUser)
          .expect(201);
      });

      it('should fail if email is already registered', async () => {
        // First registration
        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(testUser);

        // Second registration with same email
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(testUser)
          .expect(409);
      });

      it('should fail if password is too short', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'test@example.com',
            password: 'short',
          })
          .expect(400);
      });
    });

    describe('/auth/signin (POST)', () => {
      beforeEach(async () => {
        // Create a user before testing signin
        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(testUser);
      });

      it('should return JWT token with valid credentials', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signin')
          .send(testUser)
          .expect(201);

        expect(response.body.accessToken).toBeDefined();
      });

      it('should fail with invalid credentials', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: testUser.email,
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });

    describe('/auth/profile (GET)', () => {
      let jwtToken: string;

      beforeEach(async () => {
        // Create a user and get JWT token
        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(testUser);

        const response = await request(app.getHttpServer())
          .post('/auth/signin')
          .send(testUser);

        jwtToken = response.body.accessToken;
      });

      it('should get user profile with valid JWT', () => {
        return request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.email).toBe(testUser.email);
            expect(res.body.password).toBeUndefined();
          });
      });

      it('should fail without JWT', () => {
        return request(app.getHttpServer())
          .get('/auth/profile')
          .expect(401);
      });

      it('should fail with invalid JWT', () => {
        return request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });
  });
});
