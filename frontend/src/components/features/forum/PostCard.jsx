import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

const PostCard = ({ post }) => {
    return (
        // FIX #1: The <Link> component is now wrapping the entire card.
        <Link to={`/forum/${post.id}`} className="block">
            <Card className="hover:border-primary transition-colors h-full">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                {/* FIX #2: The Link around the title is removed. */}
                                <CardTitle className="text-xl group-hover:underline">
                                    {post.title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Posted by {post.author.username} • {new Date(post.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.replies}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardDescription className="px-6 pb-4">
                    {post.excerpt}
                </CardDescription>
                <CardFooter>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
};

export default PostCard;