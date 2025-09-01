
import type { Quiz, LeaderboardEntry, ProgressData, User } from './types';

// This file is now a backup and type definition provider.
// All data is fetched from and saved to Firebase Realtime Database.

export const users: User[] = [];
export const quizzes: Quiz[] = [];

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
