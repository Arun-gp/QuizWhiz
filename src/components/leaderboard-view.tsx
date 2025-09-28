
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  score: number;
  avatar?: string;
}

export default function LeaderboardView() {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = ref(db, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const students: User[] = Object.keys(usersData)
                    .map(key => ({ id: key, ...usersData[key] }))
                    .filter(user => user.role === 'student');

                const rankedStudents = students.map(student => {
                    const totalScore = student.marks ? Object.values(student.marks).reduce((acc: number, mark) => acc + (mark as number), 0) : 0;
                    return { ...student, score: totalScore };
                })
                .sort((a, b) => b.score - a.score)
                .map((student, index) => ({
                    rank: index + 1,
                    id: student.id,
                    name: student.name,
                    score: student.score,
                    avatar: student.avatar,
                }));

                setLeaderboardData(rankedStudents);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="text-accent" />
                        Leaderboard
                    </CardTitle>
                    <CardDescription>See who's at the top of the class!</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="text-accent" />
          Leaderboard
        </CardTitle>
        <CardDescription>See who's at the top of the class!</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Total Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium text-lg">{entry.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage data-ai-hint="profile picture" src={entry.avatar || `https://i.pravatar.cc/40?u=${entry.id}`} alt={entry.name} />
                      <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{entry.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold text-lg text-primary">
                  {entry.score}
                </TableCell>
              </TableRow>
            ))}
             {leaderboardData.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">No student data available for the leaderboard yet.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
