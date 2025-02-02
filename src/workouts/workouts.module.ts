import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { DeepseekService } from './services/deepseek.service';
import { Workout } from './entities/workout.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Workout]), ConfigModule],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, DeepseekService],
})
export class WorkoutsModule {}
