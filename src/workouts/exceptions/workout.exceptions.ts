import { HttpException, HttpStatus } from '@nestjs/common';

export class WorkoutNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Workout with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedWorkoutAccessException extends HttpException {
  constructor() {
    super(
      'You are not authorized to access this workout',
      HttpStatus.FORBIDDEN,
    );
  }
}
