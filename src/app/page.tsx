
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
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6 text-center">
          <div className="grid gap-2">
            <TypingTitle text="Welcome to QuizWhiz" />
            <p className="text-muted-foreground">
              Your journey to knowledge starts here. Engage, learn, and conquer with our interactive quizzes.
            </p>
          </div>

          <div className="grid gap-4">
             {userCount === null ? (
               <Skeleton className="h-10 w-full" />
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
                <Button asChild className="w-full">
                  <Link href="/login">Get Started</Link>
                </Button>
             )}
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/1920/1080"
          alt="Image"
          width="1920"
          height="1080"
          data-ai-hint="library books"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
