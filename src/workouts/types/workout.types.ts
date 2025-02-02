export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: string;
  instructions?: string;
}

export interface WorkoutPlan {
  warmup: Exercise[];
  exercises: Exercise[];
  cooldown: Exercise[];
  duration: number;
  difficulty: string;
}
