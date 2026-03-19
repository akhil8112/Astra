import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Image } from "lucide-react";

// Mock data structure based on your blueprint
const mockStory = {
    situation: "Going to the dentist",
    steps: [
        { text: "Today, I am going to the dentist. It will be okay.", illustration: "A happy child walking towards a friendly-looking clinic" },
        { text: "I will sit in a big, comfy chair. The cape will feel like a superhero's cape.", illustration: "Child sitting in a dentist chair with a colorful cape on" },
        { text: "The dentist will use special tools to look at my teeth. They make a small buzzing sound.", illustration: "A smiling dentist gently checking the child's teeth" },
        { text: "When it's all done, my teeth will feel clean and I will feel great!", illustration: "The child looking in a mirror, smiling at their clean teeth" },
    ]
};

const StoryDisplay = ({ story = mockStory }) => {
    return (
        <>
            <DialogHeader>
                <DialogTitle>Your Social Story</DialogTitle>
                <DialogDescription>For the situation: "{story.situation}"</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                {story.steps.map((step, index) => (
                    <div key={index} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{index + 1}</div>
                        <div className="flex-grow">
                            <p>{step.text}</p>
                            <div className="mt-2 text-sm text-muted-foreground bg-secondary p-2 rounded-md flex items-center gap-2">
                                <Image className="h-4 w-4" />
                                <span>[Illustration: {step.illustration}]</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default StoryDisplay;