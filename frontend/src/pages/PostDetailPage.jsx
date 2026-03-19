import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Loader2 } from "lucide-react";
import apiClient from "@/lib/api";

const PostDetailPage = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPostDetails = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/forum/posts/${postId}`);
                setPost(response.data);
            } catch (error) {
                console.error("Failed to fetch post details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPostDetails();
    }, [postId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const response = await apiClient.post(`/forum/posts/${postId}/comments`, { text: newComment });
            const createdComment = response.data;
            // Add the new comment to the state instantly for a great UX
            setPost(prevPost => ({
                ...prevPost,
                comments: [...prevPost.comments, createdComment]
            }));
            setNewComment(""); // Clear the textarea
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="container py-12 text-center">Loading post...</div>;
    }

    if (!post) {
        return <div className="container py-12 text-center">Post not found.</div>;
    }

    return (
        <div className="container py-12">
            <Link to="/forum" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Forum
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{post.title}</CardTitle>
                    <CardDescription>
                        Posted by {post.author.username} • {new Date(post.created_at).toLocaleString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
            </Card>

            <div className="mt-8">
                <h2 className="text-2xl font-bold font-heading mb-4">{post.comments.length} Replies</h2>
                <div className="space-y-6">
                    {post.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-4">
                            <Avatar>
                                <AvatarFallback>{comment.author.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <p className="font-semibold">{comment.author.username} <span className="text-xs text-muted-foreground ml-2">{new Date(comment.created_at).toLocaleString()}</span></p>
                                <p className="mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Add Your Reply</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddComment} className="grid gap-4">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="min-h-[100px]"
                            required
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Reply
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PostDetailPage;