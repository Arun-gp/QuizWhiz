import MainLayout from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function NewQuizPage() {
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
                        <Input id="title" placeholder="e.g., World Capitals" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="A quiz about the capitals of the world." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input id="duration" type="number" placeholder="10" />
                    </div>
                    <Button>Create Quiz and Add Questions</Button>
                </CardContent>
            </Card>
        </MainLayout>
    );
}
