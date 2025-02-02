import {
  IsArray,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class UpdateProgressDto {
  @IsArray()
  @IsString({ each: true })
  completedExercises: string[];

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;
}
