import type { Quiz, LeaderboardEntry, ProgressData } from './types';

export const quizzes: Quiz[] = [
  {
    id: '1',
    title: 'General Knowledge 101',
    description: 'A fun quiz to test your general knowledge on various topics.',
    duration: 10,
    questions: [
      {
        id: 'q1',
        text: 'What is the capital of France?',
        options: [
          { id: 'o1', text: 'Berlin' },
          { id: 'o2', text: 'Madrid' },
          { id: 'o3', text: 'Paris' },
          { id: 'o4', text: 'Rome' },
        ],
        correctAnswerId: 'o3',
      },
      {
        id: 'q2',
        text: 'Which planet is known as the Red Planet?',
        options: [
          { id: 'o1', text: 'Earth' },
          { id: 'o2', text: 'Mars' },
          { id: 'o3', text: 'Jupiter' },
          { id: 'o4', text: 'Venus' },
        ],
        correctAnswerId: 'o2',
      },
      {
        id: 'q3',
        text: 'Who wrote "To Kill a Mockingbird"?',
        options: [
            { id: 'o1', text: 'Harper Lee' },
            { id: 'o2', text: 'J.K. Rowling' },
            { id: 'o3', text: 'F. Scott Fitzgerald' },
            { id: 'o4', text: 'Ernest Hemingway' },
        ],
        correctAnswerId: 'o1',
      },
    ],
  },
  {
    id: '2',
    title: 'Basic Science',
    description: 'Test your fundamental knowledge of science.',
    duration: 15,
    questions: [
      {
        id: 'q1',
        text: 'What is the chemical symbol for water?',
        options: [
          { id: 'o1', text: 'O2' },
          { id: 'o2', text: 'H2O' },
          { id: 'o3', text: 'CO2' },
          { id: 'o4', text: 'NaCl' },
        ],
        correctAnswerId: 'o2',
      },
      {
        id: 'q2',
        text: 'What force keeps us on the ground?',
        options: [
            { id: 'o1', text: 'Magnetism' },
            { id: 'o2', text: 'Friction' },
            { id: 'o3', text: 'Gravity' },
            { id: 'o4', text: 'Tension' },
        ],
        correctAnswerId: 'o3',
      }
    ],
  },
];

export const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex Ray', score: 98, avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704d' },
  { rank: 2, name: 'Jordan Lee', score: 95, avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026705d' },
  { rank: 3, name: 'Taylor Kim', score: 92, avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026706d' },
  { rank: 4, name: 'Casey Morgan', score: 88, avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026707d' },
  { rank: 5, name: 'Jamie Brook', score: 85, avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026708d' },
];

export const progressData: ProgressData[] = [
    { quiz: 'GK 101', score: 75 },
    { quiz: 'History', score: 80 },
    { quiz: 'Math', score: 90 },
    { quiz: 'Science', score: 85 },
    { quiz: 'Arts', score: 95 },
    { quiz: 'Sports', score: 70 },
];
