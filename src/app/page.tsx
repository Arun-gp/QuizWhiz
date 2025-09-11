
'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import TypingTitle from "@/components/typing-title";

export default function Home() {
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
            <Button asChild className="w-full">
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
