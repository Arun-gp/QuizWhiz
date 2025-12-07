
'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import TypingTitle from "@/components/typing-title";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    get(usersRef).then((snapshot) => {
      if (snapshot.exists()) {
        setUserCount(snapshot.size);
      } else {
        setUserCount(0);
      }
    }).catch(() => {
      setUserCount(0);
    });
  }, []);

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-md gap-6 text-center">
          <div className="grid gap-2">
            <TypingTitle text="Welcome to QuizWhiz" />
            <p className="text-muted-foreground">
              Your journey to knowledge starts here. Engage, learn, and conquer with our interactive quizzes.
            </p>
          </div>

          <div className="grid gap-4">
             {userCount === null ? (
                <div className="flex justify-center">
                    <Skeleton className="h-10 w-40" />
                </div>
             ) : userCount === 0 ? (
                <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-400 dark:border-yellow-700 rounded-md">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">No users found in the system.</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Please set up your administrator account to get started.
                    </p>
                    <Button asChild className="w-full mt-4">
                        <Link href="/setup-admin">Go to Setup</Link>
                    </Button>
                </div>
             ) : (
                <div className="flex justify-center">
                    <Button asChild>
                      <Link href="/login">Get Started</Link>
                    </Button>
                </div>
             )}
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center p-8">
        <svg
            className="w-full h-full"
            viewBox="0 0 800 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="800"
              height="600"
              rx="20"
              className="fill-card"
            />
            <g transform="translate(50, 50)">
              {/* Screen */}
              <rect x="50" y="50" width="600" height="400" rx="15" className="stroke-primary" strokeWidth="4" fill="hsl(var(--background))" />
              <rect x="50" y="50" width="600" height="50" rx="15" className="fill-primary/10" />
              <circle cx="75" cy="75" r="8" className="fill-destructive/50" />
              <circle cx="105" cy="75" r="8" className="fill-yellow-400/50" />
              <circle cx="135" cy="75" r="8" className="fill-green-400/50" />

              {/* Quiz Content */}
              <rect x="100" y="120" width="500" height="30" rx="8" className="fill-primary/20" />

              <rect x="100" y="180" width="400" height="20" rx="5" className="fill-muted-foreground/20" />
              <rect x="100" y="210" width="350" height="20" rx="5" className="fill-muted-foreground/20" />
              
              <rect x="100" y="260" width="50" height="50" rx="8" className="fill-primary/80" />
              <rect x="160" y="275" width="300" height="20" rx="5" className="fill-muted-foreground/20" />
              
              <rect x="100" y="320" width="50" height="50" rx="8" className="fill-muted" />
              <rect x="160" y="335" width="250" height="20" rx="5" className="fill-muted-foreground/20" />
              
              <rect x="100" y="380" width="50" height="50" rx="8" className="fill-muted" />
              <rect x="160" y="395" width="280" height="20" rx="5" className="fill-muted-foreground/20" />
              
              <path d="M580 180 C 620 220, 620 280, 580 320" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeDasharray="5 5" className="opacity-50" />
              <path d="M585 315 L 580 320 L 575 315" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" />
              
              <circle cx="350" y="25" r="20" className="fill-primary">
                 <animateTransform attributeName="transform" type="translate" values="0 0; 0 -10; 0 0" dur="2s" repeatCount="indefinite"/>
              </circle>
              <text x="350" y="30" textAnchor="middle" className="fill-primary-foreground font-bold text-2xl">?</text>
            </g>
          </svg>
      </div>
    </div>
  );
}
