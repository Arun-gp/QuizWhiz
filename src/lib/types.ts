export interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswerId: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
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
