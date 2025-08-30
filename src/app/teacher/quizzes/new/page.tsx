
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { quizzes } from '@/lib/data';
import type { Quiz } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function NewQuizPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');

    const handleCreateQuiz = () => {
        if (!title || !description || !duration) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill out all fields.",
            });
            return;
        }

        const newQuiz: Quiz = {
            id: `quiz-${Date.now()}`,
            title,
            description,
            duration: parseInt(duration, 10),
            questions: [],
            authorId: 'teacher-1' // In a real app, this would be the logged-in teacher's ID
        };

        // This is where you would save the new quiz to your database.
        // For this example, we'll just add it to our in-memory data.
        quizzes.push(newQuiz);

        toast({
            title: "Quiz Created!",
            description: "You can now add questions to your new quiz.",
        });

        router.push(`/teacher/quizzes/${newQuiz.id}`);
    };

    return (
        <MainLayout userType="teacher">
            <Card>
                <CardHeader>
                    <CardTitle>Create a New Quiz</CardTitle>
                    <CardDescription>Fill in the details to create a new quiz.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Quiz Title</Label>
                        <Input 
                            id="title" 
                            placeholder="e.g., World Capitals" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            placeholder="A quiz about the capitals of the world." 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input 
                            id="duration" 
                            type="number" 
                            placeholder="10" 
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleCreateQuiz}>Create Quiz and Add Questions</Button>
                </CardContent>
            </Card>
        </MainLayout>
    );
}
