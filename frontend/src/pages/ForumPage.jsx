import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import PostCard from "@/components/features/forum/PostCard";
import CreatePostForm from "@/components/features/forum/CreatePostForm";
import apiClient from '@/lib/api';
import { PlusCircle } from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { AuthModal } from '@/components/common/AuthModal';

const ForumPage = () => {
    const [createPostOpen, setCreatePostOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get('/forum/posts');
                setPosts(response.data);
            } catch (error) { console.error("Failed to fetch posts:", error); }
            finally { setLoading(false); }
        };
        fetchPosts();
    }, []);

    const onPostCreated = () => {
        setCreatePostOpen(false);
        apiClient.get('/forum/posts').then(response => setPosts(response.data));
    };

    const handleCreatePostClick = () => {
        if (isAuthenticated) {
            setCreatePostOpen(true);
        } else {
            setShowAuthModal(true);
        }
    };

    if (loading) {
        return <div className="container py-12 text-center">Loading forum posts...</div>;
    }

    return (
        <>
            {/* We now pass the specific title and description for this action */}
            <AuthModal
                open={showAuthModal}
                onOpenChange={setShowAuthModal}
                title="Create a Post"
                description="You must be logged in to create a new post in the forum."
            />

            <div className="container py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold font-heading">Parent Forum</h1>
                        <p className="mt-2 text-lg text-muted-foreground">A safe space to connect and share experiences.</p>
                    </div>
                    <Button onClick={handleCreatePostClick}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
                    </Button>
                    <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a New Post</DialogTitle>
                            </DialogHeader>
                            <CreatePostForm onPostCreated={onPostCreated} />
                        </DialogContent>
                    </Dialog>
                </div>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {posts.map(post => <PostCard key={post.id} post={post} />)}
                </motion.div>
            </div>
        </>
    );
};

export default ForumPage;