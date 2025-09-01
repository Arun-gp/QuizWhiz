
'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import TypingTitle from "@/components/typing-title";

export default function Home() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[450px] gap-6 px-4 text-center">
          <div className="space-y-4">
            <TypingTitle text="Welcome to QuizWhiz" />
            <div className="flex justify-center py-2">
                <Button asChild size="lg" className="w-full max-w-xs">
                    <Link href="/login">Get Started</Link>
                </Button>
            </div>
            <p className="text-muted-foreground md:text-xl pt-2">
              Your journey to knowledge starts here. Engage, learn, and conquer with our interactive quizzes.
            </p>
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
