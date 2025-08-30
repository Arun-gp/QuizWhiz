import { quizzes } from "@/lib/data";
import QuizView from "@/components/quiz-view";
import MainLayout from "@/components/main-layout";
import { notFound } from "next/navigation";

export default function QuizPage({ params }: { params: { id: string } }) {
  const quiz = quizzes.find((q) => q.id === params.id);

  if (!quiz) {
    notFound();
  }

  return (
    <MainLayout>
      <QuizView quiz={quiz} />
    </MainLayout>
  );
}
