
'use client';

import { useState, useEffect } from 'react';
import MainLayout from "@/components/main-layout";
import { notFound, useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, PlusCircle, Check } from "lucide-react";
import type { Quiz, Question, Option } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { db } from '@/lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditQuizPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.id as string;
    const { toast } = useToast();
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!quizId) return;
        const fetchQuiz = async () => {
            const quizRef = ref(db, `quizzes/${quizId}`);
            const snapshot = await get(quizRef);
            if (snapshot.exists()) {
                const quizData = snapshot.val();
                setQuiz({ 
                    id: quizId, 
                    ...quizData,
                    questions: quizData.questions || [] // Ensure questions is always an array
                });
            } else {
                notFound();
            }
            setLoading(false);
        };
        fetchQuiz();
    }, [quizId]);

    if (loading) {
        return (
            <MainLayout userType="teacher">
                 <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                           <Skeleton className="h-8 w-1/3" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-40 w-full" />
                        </CardContent>
                    </Card>
                 </div>
            </MainLayout>
        )
    }

    if (!quiz) {
        return notFound();
    }
    
    const handleAddQuestion = () => {
        if (!quiz) return;
        const newQuestionId = `q${Date.now()}`;
        const newQuestion: Question = {
            id: newQuestionId,
            text: '',
            options: [
                { id: `o1-${Date.now()}`, text: '' },
                { id: `o2-${Date.now()}`, text: '' },
                { id: `o3-${Date.now()}`, text: '' },
                { id: `o4-${Date.now()}`, text: '' },
            ],
            correctAnswerId: '',
        };
        setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
    };

    const handleRemoveQuestion = (questionId: string) => {
        if (!quiz) return;
        setQuiz({
            ...quiz,
            questions: quiz.questions.filter((q) => q.id !== questionId),
        });
    };
    
    const handleSaveChanges = async () => {
        if (!quiz) return;
        try {
            const quizToSave = { ...quiz };
            delete (quizToSave as Partial<Quiz>).id; // Don't save the ID inside the object
            await set(ref(db, `quizzes/${quiz.id}`), quizToSave);
            toast({
                title: 'Success!',
                description: 'Your quiz has been saved.',
            });
            router.push('/teacher/dashboard');
        } catch(error) {
             toast({
                variant: 'destructive',
                title: 'Error saving quiz',
                description: 'There was a problem saving your quiz. Please try again.',
            });
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Quiz) => {
        if (!quiz) return;
        setQuiz({ ...quiz, [field]: e.target.value });
    };

    const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
        if (!quiz) return;
        const updatedQuestions = quiz.questions.map(q => 
            q.id === questionId ? { ...q, text: e.target.value } : q
        );
        setQuiz({ ...quiz, questions: updatedQuestions });
    };

    const handleOptionTextChange = (e: React.ChangeEvent<HTMLInputElement>, questionId: string, optionId: string) => {
        if (!quiz) return;
        const updatedQuestions = quiz.questions.map(q => {
            if (q.id === questionId) {
                const updatedOptions = q.options.map(o => 
                    o.id === optionId ? { ...o, text: e.target.value } : o
                );
                return { ...q, options: updatedOptions };
            }
            return q;
        });
        setQuiz({ ...quiz, questions: updatedQuestions });
    };

    const handleCorrectAnswerChange = (questionId: string, optionId: string) => {
        if (!quiz) return;
        const updatedQuestions = quiz.questions.map(q => 
            q.id === questionId ? { ...q, correctAnswerId: optionId } : q
        );
        setQuiz({ ...quiz, questions: updatedQuestions });
    };


    return (
        <MainLayout userType="teacher">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Quiz</CardTitle>
                        <CardDescription>Update the details of your quiz.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Quiz Title</Label>
                            <Input id="title" value={quiz.title} onChange={(e) => handleInputChange(e, 'title')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={quiz.description} onChange={(e) => handleInputChange(e, 'description')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input id="duration" type="number" value={quiz.duration} onChange={(e) => setQuiz({ ...quiz!, duration: parseInt(e.target.value) || 0 })}/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Questions</CardTitle>
                        <CardDescription>Click on an option's radio button to mark it as correct.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {quiz.questions.map((question, index) => (
                            <div key={question.id} className="p-4 border rounded-lg space-y-4 relative">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Question {index + 1}</h4>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(question.id)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`q-text-${question.id}`}>Question Text</Label>
                                    <Input id={`q-text-${question.id}`} value={question.text} placeholder="Type your question here..." onChange={e => handleQuestionTextChange(e, question.id)} />
                                 </div>
                                <div className="space-y-2">
                                    <Label>Options</Label>
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
                                                        onChange={e => handleOptionTextChange(e, question.id, opt.id)}
                                                        className={cn(question.correctAnswerId === opt.id && "border-green-500 ring-2 ring-green-200 dark:ring-green-800")}
                                                    />
                                                </Label>
                                                {question.correctAnswerId === opt.id && <Check className="h-5 w-5 text-green-500" />}
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>
                        ))}
                         <Button variant="outline" onClick={handleAddQuestion}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Question
                         </Button>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </CardFooter>
                </Card>
            </div>
        </MainLayout>
    );
}
