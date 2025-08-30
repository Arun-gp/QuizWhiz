import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Welcome to QuizWhiz</h1>
        <p className="text-xl text-muted-foreground">
          Your journey to knowledge starts here.
        </p>
      </div>
      <div className="flex gap-4 mt-8">
        <Button asChild size="lg">
          <Link href="/student/login">Student Login</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/teacher/login">Teacher Login</Link>
        </Button>
      </div>
    </div>
  );
}
