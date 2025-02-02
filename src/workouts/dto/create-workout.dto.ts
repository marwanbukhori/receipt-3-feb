import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export enum WorkoutDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class WorkoutPreferencesDto {
  @IsEnum(WorkoutDifficulty)
  difficulty: WorkoutDifficulty;

  @IsNumber()
  duration: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  focus: string[];

  @IsArray()
  @IsString({ each: true })
  equipment: string[];
}

export class CreateWorkoutDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  preferences: WorkoutPreferencesDto;
}
