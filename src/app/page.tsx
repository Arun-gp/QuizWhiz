
'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import TypingTitle from "@/components/typing-title";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function Home() {
  const [usersExist, setUsersExist] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        setUsersExist(snapshot.exists());
      } catch (error) {
        console.error("Error checking for users:", error);
        // Assume users exist to be safe, so we don't show setup link erroneously
        setUsersExist(true);
      } finally {
        setLoading(false);
      }
    };
    checkUsers();
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

          {!loading && !usersExist && (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>First time setup!</AlertTitle>
              <AlertDescription>
                No users found. You need to create an admin account first.
                <Button asChild variant="link" className="p-1">
                  <Link href="/setup-admin">Go to setup</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <Button asChild className="w-full" disabled={!usersExist}>
              <Link href="/login">Get Started</Link>
            </Button>
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
