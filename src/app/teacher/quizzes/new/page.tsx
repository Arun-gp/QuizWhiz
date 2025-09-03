
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Quiz } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';

export default function NewQuizPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');

    const handleCreateQuiz = async () => {
        if (!title || !description || !duration) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill out all fields.",
            });
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to create a quiz." });
            return;
        }

        const newQuizRef = push(ref(db, 'quizzes'));
        const newQuestionId = `q${Date.now()}`;
        const newQuiz: Omit<Quiz, 'id'> = {
            title,
            description,
            duration: parseInt(duration, 10),
            questions: [
                {
                    id: newQuestionId,
                    text: 'Your first question',
                    options: [
                        { id: `o1-${Date.now()}`, text: '' },
                        { id: `o2-${Date.now()}`, text: '' },
                        { id: `o3-${Date.now()}`, text: '' },
                        { id: `o4-${Date.now()}`, text: '' },
                    ],
                    correctAnswerId: '',
                },
            ],
            authorId: currentUser.uid
        };

        try {
            await set(newQuizRef, newQuiz);

            toast({
                title: "Quiz Created!",
                description: "You can now add questions to your new quiz.",
            });

            router.push(`/teacher/quizzes/${newQuizRef.key}`);
        } catch(error) {
            toast({
                variant: "destructive",
                title: "Error creating quiz",
                description: "There was an issue saving your quiz. Please try again.",
            });
        }
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
