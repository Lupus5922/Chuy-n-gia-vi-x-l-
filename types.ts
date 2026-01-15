
export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string;
  timestamp: Date;
}

export interface Topic {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface QuizResult {
  question: string;
  explanation: string;
  correctAnswer: string;
  assemblyCode?: string;
}
