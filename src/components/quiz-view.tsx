"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Timer, Sparkles, Loader2 } from "lucide-react";
import type { Quiz, Question } from "@/lib/types";
import { getAIFeedback } from "@/app/quiz/actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function QuizView({ quiz }: { quiz: Quiz }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [aiFeedback, setAIFeedback] = useState("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const { toast } = useToast();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleFinish = useCallback(() => {
    if (isFinished) return;

    setIsFinished(true);
    let correctAnswersCount = 0;
    const correctQuestions: string[] = [];
    const incorrectQuestions: string[] = [];

    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswerId) {
        correctAnswersCount++;
        correctQuestions.push(q.text);
      } else {
        incorrectQuestions.push(q.text);
      }
    });

    const calculatedScore = Math.round(
      (correctAnswersCount / quiz.questions.length) * 100
    );
    setScore(calculatedScore);

    setIsGeneratingFeedback(true);
    getAIFeedback({
      studentName: "Student",
      quizName: quiz.title,
      score: calculatedScore,
      correctAnswers: correctQuestions,
      incorrectAnswers: incorrectQuestions,
      feedbackRequest: "General feedback",
    })
      .then((result) => {
        if (result.success) {
          setAIFeedback(result.feedback!);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
          });
          setAIFeedback("Could not generate feedback at this time.");
        }
      })
      .finally(() => setIsGeneratingFeedback(false));
  }, [answers, quiz, isFinished, toast]);

  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, handleFinish]);

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinish();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{quiz.title}</CardTitle>
            <Badge variant="secondary" className="flex items-center gap-2 text-lg">
              <Timer className="h-5 w-5" />
              <span>{formatTime(timeLeft)}</span>
            </Badge>
          </div>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-6" />
          <div className="space-y-4">
            <p className="font-semibold text-xl">{currentQuestion.text}</p>
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) =>
                handleAnswerChange(currentQuestion.id, value)
              }
            >
              {currentQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="text-base font-normal">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="w-full"
          >
            {currentQuestionIndex < quiz.questions.length - 1
              ? "Next Question"
              : "Finish Quiz"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isFinished} onOpenChange={setIsFinished}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Quiz Results</DialogTitle>
            <DialogDescription>
              You scored {score}% on the "{quiz.title}" quiz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Personalized Feedback
            </h3>
            {isGeneratingFeedback ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating feedback...</span>
              </div>
            ) : (
              <div
                className="prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: aiFeedback.replace(/\n/g, '<br />') }}
              />
            )}
          </div>
          <DialogFooter>
            <Button asChild>
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
