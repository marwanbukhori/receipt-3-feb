import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkoutPlan } from '../types/workout.types';

@Injectable()
export class DeepseekService {
  constructor(private configService: ConfigService) {}

  async generateWorkoutPlan(preferences: any): Promise<WorkoutPlan> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.configService.get('DEEPSEEK_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content:
                'You are a professional fitness trainer. Create detailed workout plans based on user preferences.',
            },
            {
              role: 'user',
              content: this.buildPrompt(preferences),
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new HttpException(
          'Failed to generate workout plan',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      Logger.error(error, 'DeepseekService');
      throw new HttpException(
        'Failed to connect to DeepSeek API',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private buildPrompt(preferences: any): string {
    return `Create a detailed workout plan with the following requirements:
      - Difficulty Level: ${preferences.difficulty}
      - Duration: ${preferences.duration} minutes
      - Focus Areas: ${preferences.focus.join(', ')}
      - Available Equipment: ${preferences.equipment.join(', ')}

      Please provide a structured workout plan including:
      1. Warm-up exercises (5-10 minutes)
      2. Main exercises with specific sets, reps, and rest periods
      3. Cool-down exercises (5-10 minutes)
      4. Total estimated duration
      5. Safety instructions and form tips

      Format the response as a JSON object with the following structure:
      {
        "warmup": [{"name": string, "duration": string}],
        "exercises": [{"name": string, "sets": number, "reps": number, "rest": string, "instructions": string}],
        "cooldown": [{"name": string, "duration": string}],
        "duration": number,
        "difficulty": string
      }`;
  }

  private parseResponse(data: any): WorkoutPlan {
    try {
      // Extract the response content and parse it as JSON
      const content = data.choices[0].message.content;
      const parsedPlan = JSON.parse(content);

      // Validate the structure matches our WorkoutPlan type
      return {
        warmup: parsedPlan.warmup,
        exercises: parsedPlan.exercises,
        cooldown: parsedPlan.cooldown,
        duration: parsedPlan.duration,
        difficulty: parsedPlan.difficulty,
      };
    } catch (error) {
      Logger.error(error, 'DeepseekService');
      throw new HttpException(
        'Invalid response format from AI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
