import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/auth/entities/user.entity';
import { Workout } from '../src/workouts/entities/workout.entity';
import { AuthModule } from '../src/auth/auth.module';
import { WorkoutsModule } from '../src/workouts/workouts.module';
import { TestDatabaseModule } from './test-db.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

describe('WorkoutsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userRepository: Repository<User>;
  let workoutRepository: Repository<Workout>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TestDatabaseModule,
        AuthModule,
        WorkoutsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    workoutRepository = moduleFixture.get<Repository<Workout>>(
      getRepositoryToken(Workout),
    );
    dataSource = moduleFixture.get<DataSource>(DataSource);

    await app.init();
  });

  beforeEach(async () => {
    // Clear the database before each test with proper order
    await dataSource.query('TRUNCATE TABLE workouts CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');

    // Create a test user and get auth token
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(signupResponse.status).toBe(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(loginResponse.status).toBe(201);
    expect(loginResponse.body.accessToken).toBeDefined();
    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Clean up database
    await dataSource.query('TRUNCATE TABLE workouts CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    await dataSource.destroy();
    await app.close();
  });

  describe('/workouts', () => {
    describe('POST /', () => {
      it('should create a new workout', async () => {
        const response = await request(app.getHttpServer())
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'My Workout',
            description: 'Test workout',
            preferences: {
              difficulty: 'beginner',
              duration: 30,
              focus: ['strength'],
              equipment: ['dumbbells'],
            },
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('My Workout');
        expect(response.body.plan).toBeDefined();
      });

      it('should fail without authentication', async () => {
        const response = await request(app.getHttpServer())
          .post('/workouts')
          .send({
            name: 'My Workout',
            description: 'Test workout',
            preferences: {
              difficulty: 'beginner',
              duration: 30,
              focus: ['strength'],
              equipment: ['dumbbells'],
            },
          });

        expect(response.status).toBe(401);
      });
    });

    describe('GET /', () => {
      it('should get all workouts for the user', async () => {
        // First create a workout
        await request(app.getHttpServer())
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'My Workout',
            description: 'Test workout',
            preferences: {
              difficulty: 'beginner',
              duration: 30,
              focus: ['strength'],
              equipment: ['dumbbells'],
            },
          });

        const response = await request(app.getHttpServer())
          .get('/workouts')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].name).toBe('My Workout');
      });
    });

    describe('PATCH /:id/progress', () => {
      it('should update workout progress', async () => {
        // Create a workout first
        const createResponse = await request(app.getHttpServer())
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'My Workout',
            description: 'Test workout',
            preferences: {
              difficulty: 'beginner',
              duration: 30,
              focus: ['strength'],
              equipment: ['dumbbells'],
            },
          });

        const workoutId = createResponse.body.id;

        const response = await request(app.getHttpServer())
          .patch(`/workouts/${workoutId}/progress`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedExercises: ['push-ups'],
            date: new Date().toISOString(),
          });

        expect(response.status).toBe(200);
        expect(response.body.progress).toBeDefined();
        expect(response.body.progress.completedExercises).toContain('push-ups');
      });
    });

    describe('DELETE /:id', () => {
      it('should delete workout', async () => {
        // First create a workout
        const createResponse = await request(app.getHttpServer())
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Workout to Delete',
            description: 'This workout will be deleted',
            preferences: {
              difficulty: 'beginner',
              duration: 30,
              focus: ['strength'],
              equipment: ['dumbbells'],
            },
          });

        const workoutId = createResponse.body.id;

        // Then delete it
        await request(app.getHttpServer())
          .delete(`/workouts/${workoutId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Verify it's deleted
        await request(app.getHttpServer())
          .get(`/workouts/${workoutId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should fail to delete non-existent workout', async () => {
        await request(app.getHttpServer())
          .delete('/workouts/non-existent-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should fail to delete workout without authentication', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/workouts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Workout to Delete',
            description: 'This workout will be deleted',
            preferences: {
              difficulty: 'beginner',
              duration: 30,
              focus: ['strength'],
              equipment: ['dumbbells'],
            },
          });

        const workoutId = createResponse.body.id;

        await request(app.getHttpServer())
          .delete(`/workouts/${workoutId}`)
          .expect(401);
      });
    });
  });
});
