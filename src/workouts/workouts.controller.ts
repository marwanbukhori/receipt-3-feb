import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { WorkoutDto } from './dto/workout.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Post()
  create(
    @Body() createWorkoutDto: CreateWorkoutDto,
    @Request() req,
  ): Promise<WorkoutDto> {
    return this.workoutsService.create(createWorkoutDto, req.user);
  }

  @Get()
  findAll(@Request() req): Promise<WorkoutDto[]> {
    return this.workoutsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req): Promise<WorkoutDto> {
    return this.workoutsService.findOne(id, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    console.log('hehe');
    return this.workoutsService.remove(id, req.user);
  }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Body() progress: UpdateProgressDto,
    @Request() req,
  ): Promise<WorkoutDto> {
    return this.workoutsService.updateProgress(id, req.user, progress);
  }
}
