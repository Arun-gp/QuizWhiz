export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswerId: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
  authorId: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar: string;
}

export interface ProgressData {
  quiz: string;
  score: number;
}
