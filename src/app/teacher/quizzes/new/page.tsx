
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Quiz, Question, Option } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';
import { generateQuestions, GenerateQuestionsOutput } from '@/ai/flows/generate-questions-flow';
import { Loader2, Sparkles, X, PlusCircle, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';


export default function NewQuizPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [quiz, setQuiz] = useState<Partial<Quiz>>({
        title: '',
        description: '',
        duration: 10,
        questions: [],
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateQuestions = async () => {
        if (!quiz.title) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter a quiz title first.",
            });
            return;
        }
        setIsGenerating(true);
        try {
            const result: GenerateQuestionsOutput = await generateQuestions({ topic: quiz.title });
            
            const newQuestions: Question[] = result.questions.map((q, index) => {
                const questionId = `q${Date.now() + index}`;
                const options: Option[] = q.options.map((optText, optIndex) => ({
                    id: `o${questionId}-${optIndex}`,
                    text: optText,
                }));
                const correctOption = options.find(opt => opt.text === q.answer);
                return {
                    id: questionId,
                    text: q.question,
                    options: options,
                    correctAnswerId: correctOption ? correctOption.id : '',
                };
            });
            
            setQuiz(prev => ({...prev, questions: [...(prev.questions || []), ...newQuestions]}));

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'AI Generation Failed',
                description: 'Could not generate questions. Please try again.',
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleCreateQuiz = async () => {
        if (!quiz.title || !quiz.description || !quiz.duration) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill out all quiz details.",
            });
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to create a quiz." });
            return;
        }

        const newQuizRef = push(ref(db, 'quizzes'));
        const quizToSave: Omit<Quiz, 'id'> = {
            title: quiz.title,
            description: quiz.description,
            duration: quiz.duration,
            questions: quiz.questions || [],
            authorId: currentUser.uid
        };

        try {
            await set(newQuizRef, quizToSave);
            toast({
                title: "Quiz Created!",
                description: "Your new quiz has been saved successfully.",
            });
            router.push(`/teacher/quizzes`);
        } catch(error) {
            toast({
                variant: "destructive",
                title: "Error creating quiz",
                description: "There was an issue saving your quiz. Please try again.",
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Quiz) => {
        setQuiz(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleQuestionChange = (questionId: string, newText: string) => {
        setQuiz(prev => ({
            ...prev,
            questions: prev.questions?.map(q => q.id === questionId ? { ...q, text: newText } : q)
        }));
    };

    const handleOptionChange = (questionId: string, optionId: string, newText: string) => {
        setQuiz(prev => ({
            ...prev,
            questions: prev.questions?.map(q => {
                if (q.id === questionId) {
                    return {
                        ...q,
                        options: q.options.map(opt => opt.id === optionId ? { ...opt, text: newText } : opt)
                    };
                }
                return q;
            })
        }));
    };
    
    const handleCorrectAnswerChange = (questionId: string, optionId: string) => {
        setQuiz(prev => ({
            ...prev,
            questions: prev.questions?.map(q => q.id === questionId ? { ...q, correctAnswerId: optionId } : q)
        }));
    };

    const handleRemoveQuestion = (questionId: string) => {
        setQuiz(prev => ({
            ...prev,
            questions: prev.questions?.filter(q => q.id !== questionId)
        }));
    };

    return (
        <MainLayout userType="teacher">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create a New Quiz</CardTitle>
                        <CardDescription>Fill in the details below. You can add questions manually or generate them with AI.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Quiz Title</Label>
                            <Input 
                                id="title" 
                                placeholder="e.g., Introduction to Java" 
                                value={quiz.title}
                                onChange={(e) => handleInputChange(e, 'title')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                                id="description" 
                                placeholder="A quiz covering the basics of Java programming." 
                                value={quiz.description}
                                onChange={(e) => handleInputChange(e, 'description')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input 
                                id="duration" 
                                type="number" 
                                placeholder="10" 
                                value={quiz.duration}
                                onChange={(e) => setQuiz(prev => ({...prev, duration: parseInt(e.target.value) || 0}))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle>Questions</CardTitle>
                                <CardDescription>Add or generate questions for your quiz.</CardDescription>
                            </div>
                            <Button onClick={handleGenerateQuestions} disabled={isGenerating || !quiz.title}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                {isGenerating ? "Generating..." : "Generate Questions with AI"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         {quiz.questions && quiz.questions.map((question, index) => (
                            <div key={question.id} className="p-4 border rounded-lg space-y-4 relative">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Question {index + 1}</h4>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(question.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`q-text-${question.id}`}>Question Text</Label>
                                    <Input id={`q-text-${question.id}`} value={question.text} onChange={e => handleQuestionChange(question.id, e.target.value)} />
                                 </div>
                                <div className="space-y-2">
                                    <Label>Options (Click radio button to mark as correct)</Label>
                                    <RadioGroup 
                                        value={question.correctAnswerId} 
                                        onValueChange={(optionId) => handleCorrectAnswerChange(question.id, optionId)}
                                        className="space-y-2"
                                    >
                                        {question.options.map((opt, optIndex) => (
                                            <div key={opt.id} className="flex items-center gap-2">
                                                <RadioGroupItem value={opt.id} id={`${question.id}-${opt.id}`} />
                                                <Label htmlFor={`${question.id}-${opt.id}`} className="flex-1">
                                                     <Input 
                                                        value={opt.text} 
                                                        placeholder={`Option ${optIndex + 1}`}
                                                        onChange={e => handleOptionChange(question.id, opt.id, e.target.value)}
                                                        className={cn(question.correctAnswerId === opt.id && "border-green-500")}
                                                    />
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="flex items-center justify-center text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <p>Generating questions...</p>
                            </div>
                        )}
                        {quiz.questions?.length === 0 && !isGenerating && (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No questions yet.</p>
                                <p>Click "Generate Questions with AI" to start.</p>
                            </div>
                        )}
                    </CardContent>
                     <CardFooter className="flex justify-end">
                        <Button onClick={handleCreateQuiz} disabled={isGenerating}>
                            Create Quiz
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </MainLayout>
    );
}
