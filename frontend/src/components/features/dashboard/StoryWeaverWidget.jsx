import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import StoryDisplay from "./StoryDisplay";
import apiClient from '@/lib/api';
import { BookHeart, Loader2 } from "lucide-react";

const StoryWeaverWidget = () => {
    const [story, setStory] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [situation, setSituation] = useState("");
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!situation) return;

        setIsGenerating(true);
        setError(null);

        try {
            // This now calls the live backend endpoint
            const response = await apiClient.post('/dashboard/story-weaver', { situation });
            setStory(response.data);
        } catch (err) {
            setError('Failed to generate story. Please try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={!!story} onOpenChange={(isOpen) => !isOpen && setStory(null)}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookHeart className="h-5 w-5 text-primary" />
                        Story Weaver (Live AI)
                    </CardTitle>
                    <CardDescription>
                        Create simple social stories to prepare for new situations.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleGenerate}>
                    <CardContent>
                        <Input
                            name="situation"
                            value={situation}
                            onChange={(e) => setSituation(e.target.value)}
                            placeholder="E.g., Going to a birthday party, getting a haircut..."
                        />
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isGenerating}>
                            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isGenerating ? "Generating..." : "Generate Story"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <DialogContent className="max-w-2xl">
                {story && <StoryDisplay story={story} />}
            </DialogContent>
        </Dialog>
    );
};

export default StoryWeaverWidget;