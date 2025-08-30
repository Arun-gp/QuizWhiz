import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Quiz } from "@/lib/types";

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between text-sm text-muted-foreground">
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {quiz.questions.length} Questions
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {quiz.duration} min
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/quiz/${quiz.id}`}>Start Quiz</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
