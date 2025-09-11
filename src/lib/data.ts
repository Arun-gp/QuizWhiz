
import type { Quiz, LeaderboardEntry, ProgressData, User } from './types';

// This file is now a backup and type definition provider.
// All data is fetched from and saved to Firebase Realtime Database.

export const users: User[] = [];
export const quizzes: Quiz[] = [];

// leaderboardData is now fetched dynamically in the component.
export const leaderboardData: LeaderboardEntry[] = [];

export const progressData: ProgressData[] = [
    { quiz: 'GK 101', score: 75 },
    { quiz: 'History', score: 80 },
    { quiz: 'Math', score: 90 },
    { quiz: 'Science', score: 85 },
    { quiz: 'Arts', score: 95 },
    { quiz: 'Sports', score: 70 },
];
