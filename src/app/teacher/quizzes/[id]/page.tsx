import MainLayout from "@/components/main-layout";
import { quizzes } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";


export default function EditQuizPage({ params }: { params: { id: string } }) {
    const quiz = quizzes.find((q) => q.id === params.id);

    if (!quiz) {
        notFound();
    }

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
                            <Input id="title" defaultValue={quiz.title} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" defaultValue={quiz.description} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input id="duration" type="number" defaultValue={quiz.duration} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {quiz.questions.map((question, index) => (
                            <div key={question.id} className="p-4 border rounded-lg space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Question {index + 1}</h4>
                                    <Button variant="ghost" size="icon">
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`q-text-${question.id}`}>Question Text</Label>
                                    <Input id={`q-text-${question.id}`} defaultValue={question.text} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Options</Label>
                                    <div className="space-y-2">
                                    {question.options.map(opt => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <Input defaultValue={opt.text}/>
                                            <div className="flex items-center gap-1.5">
                                                <input type="radio" name={`correct-ans-${question.id}`} id={`${question.id}-${opt.id}`} value={opt.id} defaultChecked={question.correctAnswerId === opt.id} />
                                                <Label htmlFor={`${question.id}-${opt.id}`}>Correct</Label>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                         <Button variant="outline">Add Question</Button>
                    </CardContent>
                    <CardFooter>
                        <Button>Save Changes</Button>
                    </CardFooter>
                </Card>
            </div>
        </MainLayout>
    );
}
