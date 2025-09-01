
"use client";

import { useState, useEffect, useCallback } from "react";
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
import { getAIFeedback, saveQuizResult } from "@/app/quiz/actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auth } from "@/lib/firebase";

interface ResultDetails {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export default function QuizView({ quiz }: { quiz: Quiz }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [aiFeedback, setAIFeedback] = useState("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [resultDetails, setResultDetails] = useState<ResultDetails[]>([]);
  const { toast } = useToast();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleFinish = useCallback(async () => {
    if (isFinished) return;

    setIsFinished(true);
    let correctAnswersCount = 0;
    const correctQuestions: string[] = [];
    const incorrectQuestions: string[] = [];
    const details: ResultDetails[] = [];

    quiz.questions.forEach((q) => {
      const selectedOptionId = answers[q.id];
      const correctOption = q.options.find(opt => opt.id === q.correctAnswerId);
      const selectedOption = q.options.find(opt => opt.id === selectedOptionId);

      const isCorrect = selectedOptionId === q.correctAnswerId;
      if (isCorrect) {
        correctAnswersCount++;
        correctQuestions.push(q.text);
      } else {
        incorrectQuestions.push(q.text);
      }
      
      details.push({
        question: q.text,
        selectedAnswer: selectedOption?.text || "Not Answered",
        correctAnswer: correctOption?.text || "N/A",
        isCorrect: isCorrect,
      });
    });

    setResultDetails(details);

    const calculatedScore = Math.round(
      (correctAnswersCount / quiz.questions.length) * 100
    );
    setScore(calculatedScore);

    const user = auth.currentUser;
    if (user) {
        await saveQuizResult(user.uid, quiz.id, calculatedScore);
    }

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
              className="space-y-2"
            >
              {currentQuestion.options.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className="flex items-center space-x-3 p-3 rounded-md border border-input cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-primary has-[[data-state=checked]]:text-primary-foreground has-[[data-state=checked]]:border-primary"
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <span className="text-base font-normal">
                    {option.text}
                  </span>
                </Label>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quiz Results: {score}%</DialogTitle>
            <DialogDescription>
              Here's how you did on the "{quiz.title}" quiz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <ScrollArea className="h-60 w-full pr-4">
               <div className="space-y-4">
                {resultDetails.map((result, index) => (
                  <div key={index} className="p-3 rounded-md border" >
                      <p className="font-semibold mb-2">{result.question}</p>
                      <div className={cn(
                          "flex items-center gap-2 p-2 rounded-md text-sm",
                          result.isCorrect ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                      )}>
                          {result.isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          <span>Your answer: {result.selectedAnswer}</span>
                      </div>
                      {!result.isCorrect && (
                          <div className="flex items-center gap-2 p-2 mt-1 rounded-md text-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                             <CheckCircle className="h-4 w-4 text-green-600" />
                             <span>Correct answer: {result.correctAnswer}</span>
                          </div>
                      )}
                  </div>
                ))}
               </div>
            </ScrollArea>
             <div className="p-3 border rounded-lg space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
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
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: aiFeedback.replace(/\n/g, '<br />') }}
                />
                )}
            </div>
          </div>
          <DialogFooter>
            <Button asChild className="w-full">
              <Link href="/student/dashboard">Back to Dashboard</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
