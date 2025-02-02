import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  plan: any; // Will store the AI-generated workout plan

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('jsonb', { default: {} })
  progress: any;

  @ManyToOne(() => User, (user) => user.workouts)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
