export class WorkoutDto {
  id: string;
  name: string;
  description?: string;
  plan: any;
  progress: any;
  createdAt: Date;
  updatedAt: Date;
}
