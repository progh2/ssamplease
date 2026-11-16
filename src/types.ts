export type TaskStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'resolved_with_issue';
export type TaskKind = 'document' | 'class' | 'grading' | 'message' | 'equipment' | 'approval' | 'attendance' | 'counseling' | 'exam';

export interface TaskDefinition {
  id: string;
  day: number;
  kind: TaskKind;
  titleKey: string;
  descriptionKey: string;
  required: boolean;
  variants: string[];
  choices: { labelKey: string; outcome: 'completed' | 'resolved_with_issue'; feedbackKey: string }[];
}

export interface DayDefinition {
  day: number;
  weekday: string;
  titleKey: string;
  introKey: string;
  tasks: TaskDefinition[];
}
