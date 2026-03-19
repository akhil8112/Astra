import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import apiClient from '@/lib/api';
import { Loader2 } from 'lucide-react';

const CreatePostForm = ({ onPostCreated }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        const tags = formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean);

        const postData = {
            title: formData.get('title'),
            content: formData.get('content'),
            tags: tags,
        };

        try {
            const response = await apiClient.post('/forum/posts', postData);
            const newPost = response.data;
            onPostCreated(); // Tell the parent page to refresh
            navigate(`/forum/${newPost.id}`); // Navigate to the new post
        } catch (err) {
            setError("Failed to create post. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input name="title" id="title" placeholder="A clear and descriptive title" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea name="content" id="content" placeholder="Share your experience or ask a question..." className="min-h-[120px]" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input name="tags" id="tags" placeholder="e.g., Sensory, Schooling, Advice" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="mt-2" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Post
            </Button>
        </form>
    );
};

export default CreatePostForm;