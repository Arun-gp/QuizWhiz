
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Welcome to QuizWhiz</h1>
            <p className="text-balance text-muted-foreground">
              Your journey to knowledge starts here.
            </p>
          </div>
          <div className="grid gap-4">
            <Button asChild>
                <Link href="/student/login">Student Login</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/teacher/login">Teacher Login</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/admin/login">Admin Login</Link>
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
