'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Quiz, Question, Option } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';
import { generateQuestions, GenerateQuestionsOutput } from '@/ai/flows/generate-questions-flow';
import { Loader2, Sparkles, FileText, Upload, Link as LinkIcon, Settings, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

export default function NewQuizPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [quizContent, setQuizContent] = useState('');
    const [questionType, setQuestionType] = useState('multiple-choice');
    const [difficulty, setDifficulty] = useState('medium');
    const [numQuestions, setNumQuestions] = useState(5);
    const [generatedQuiz, setGeneratedQuiz] = useState<Question[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateQuiz = async () => {
        if (!quizContent) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please provide some content for the quiz.",
            });
            return;
        }
        setIsGenerating(true);
        try {
            // Using the existing flow, but ideally this would be a new flow
            // that takes the full content as input. We'll simulate by using the first line as a topic.
            const topic = quizContent.split('\n')[0] || 'General Knowledge';
            const result: GenerateQuestionsOutput = await generateQuestions({ topic, count: numQuestions });
            
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
            
            setGeneratedQuiz(newQuestions);

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
    
    const handleSaveQuiz = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to create a quiz." });
            return;
        }

        if (generatedQuiz.length === 0) {
             toast({ variant: "destructive", title: "Error", description: "Please generate a quiz before saving." });
            return;
        }

        const newQuizRef = push(ref(db, 'quizzes'));
        const quizToSave: Omit<Quiz, 'id'> = {
            title: quizContent.split('\n')[0].substring(0, 30) || 'New Quiz', // Generate a title
            description: `A quiz based on the provided content.`,
            duration: 10, // Default duration
            questions: generatedQuiz,
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

    const sentenceCount = (quizContent.match(/[.!?]+/g) || []).length;
    const wordCount = (quizContent.match(/\S+/g) || []).length;

    return (
        <MainLayout userType="teacher">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-border -m-4 md:-m-6 lg:-m-8">
                {/* Left Column */}
                <div className="bg-card text-card-foreground flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">Content for your quiz</h2>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <FileText className="w-16 h-16 text-primary mb-4" strokeWidth={1} />
                        <p className="text-muted-foreground mb-4">To create a quiz type or paste your text here</p>
                        <Textarea 
                            className="w-full h-48 flex-grow"
                            placeholder="Paste your text, up to 1,000,000 characters."
                            value={quizContent}
                            onChange={(e) => setQuizContent(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground my-4">OR</p>
                        <div className="flex gap-4">
                            <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Sample content</Button>
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload file</Button>
                            <Button variant="outline"><LinkIcon className="mr-2 h-4 w-4" /> Web url</Button>
                        </div>
                    </div>
                    <div className="p-4 border-t bg-muted/50">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                             <Select value={questionType} onValueChange={setQuestionType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Question type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="multiple-choice">Multiple choice</SelectItem>
                                    <SelectItem value="true-false">True/False</SelectItem>
                                    <SelectItem value="fill-in-the-blank">Fill in the blank</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={String(numQuestions)} onValueChange={(val) => setNumQuestions(Number(val))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Number of questions" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 10, 15].map(n => (
                                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{sentenceCount} Sentences | {wordCount} Words</span>
                            <Button variant="link" className="p-0 h-auto text-xs">Quiz Settings <ChevronDown className="h-3 w-3 ml-1" /></Button>
                        </div>
                    </div>
                    <div className="p-4 border-t">
                        <Button className="w-full" onClick={handleGenerateQuiz} disabled={isGenerating}>
                             {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                             {isGenerating ? "Generating Quiz..." : "Generate Quiz"}
                        </Button>
                    </div>
                </div>

                {/* Right Column */}
                <div className="bg-card text-card-foreground flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="font-semibold">Generated quiz</h2>
                        <span className="text-sm text-muted-foreground">Questions generated: {generatedQuiz.length}</span>
                    </div>

                    {isGenerating ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground">Generating your quiz...</p>
                        </div>
                    ) : generatedQuiz.length === 0 ? (
                         <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50 mb-4">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="14" x2="15" y2="14"></line><line x1="9" y1="18" x2="12" y2="18"></line>
                                <path d="M11.5 10H12a1.5 1.5 0 0 1 0 3H10v-2a1.5 1.5 0 0 1 1.5-1.5Z"></path>
                            </svg>
                            <p className="text-muted-foreground">Your quiz questions will be shown here.</p>
                        </div>
                    ) : (
                        <ScrollArea className="flex-1">
                             <div className="p-6 space-y-6">
                                {generatedQuiz.map((question, index) => (
                                    <Card key={question.id}>
                                        <CardHeader>
                                            <CardTitle className="text-base">Question {index + 1}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="font-semibold">{question.text}</p>
                                            <RadioGroup 
                                                value={question.correctAnswerId}
                                                className="space-y-2"
                                            >
                                                {question.options.map((opt) => (
                                                    <div key={opt.id} className="flex items-center gap-2">
                                                        <RadioGroupItem value={opt.id} id={`${question.id}-${opt.id}`} />
                                                        <Label htmlFor={`${question.id}-${opt.id}`} className={cn("flex-1 p-3 rounded-md border", opt.id === question.correctAnswerId ? 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700' : 'border-input')}>
                                                            {opt.text}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    )}

                    <div className="p-4 border-t">
                        <Button className="w-full" onClick={handleSaveQuiz} disabled={generatedQuiz.length === 0}>
                            Create Quiz
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
