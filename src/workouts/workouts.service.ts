import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Workout } from './entities/workout.entity';
import { User } from '../auth/entities/user.entity';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { WorkoutDto } from './dto/workout.dto';
import { DeepseekService } from './services/deepseek.service';
import { WorkoutPlan } from './types/workout.types';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(Workout)
    private workoutsRepository: Repository<Workout>,
    private configService: ConfigService,
    private deepseekService: DeepseekService,
  ) {}

  async generateWorkoutPlan(preferences: any): Promise<WorkoutPlan> {
    return this.deepseekService.generateWorkoutPlan(preferences);
  }

  async create(
    createWorkoutDto: CreateWorkoutDto,
    user: User,
  ): Promise<WorkoutDto> {
    const workoutPlan = await this.generateWorkoutPlan(
      createWorkoutDto.preferences,
    );

    const workout = this.workoutsRepository.create({
      ...createWorkoutDto,
      plan: workoutPlan,
      user,
      progress: {},
    });

    const savedWorkout = await this.workoutsRepository.save(workout);
    return this.toDto(savedWorkout);
  }

  async findAll(user: User): Promise<WorkoutDto[]> {
    const workouts = await this.workoutsRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
    return workouts.map((workout) => this.toDto(workout));
  }

  async findOne(id: string, user: User): Promise<WorkoutDto> {
    const workout = await this.workoutsRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!workout) {
      throw new NotFoundException(`Workout with ID ${id} not found`);
    }

    return this.toDto(workout);
  }

  async updateProgress(
    id: string,
    user: User,
    progress: any,
  ): Promise<WorkoutDto> {
    const workout = await this.findOne(id, user);

    const updatedWorkout = await this.workoutsRepository.save({
      ...workout,
      progress,
    });

    return this.toDto(updatedWorkout);
  }

  async remove(id: string, user: User): Promise<void> {
    const workout = await this.workoutsRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['user'],
    });

    if (!workout) {
      throw new NotFoundException(`Workout with ID ${id} not found`);
    }

    await this.workoutsRepository.remove(workout);
  }

  private toDto(workout: Workout): WorkoutDto {
    const { id, name, description, plan, progress, createdAt, updatedAt } =
      workout;
    return { id, name, description, plan, progress, createdAt, updatedAt };
  }
}
