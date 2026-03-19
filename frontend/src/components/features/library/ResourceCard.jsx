import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Link } from "react-router-dom";
import { BookOpen, Video, FileText } from "lucide-react";

const icons = {
    Article: <BookOpen className="h-5 w-5" />,
    Video: <Video className="h-5 w-5" />,
    Guide: <FileText className="h-5 w-5" />,
};

const ResourceCard = ({ resource }) => {
    return (
        <Link to="#">
            <Card className="h-full hover:border-primary transition-colors">
                <CardHeader>
                    <div className="flex items-center gap-3 text-primary">
                        {icons[resource.type]}
                        <CardTitle className="text-xl">{resource.title}</CardTitle>
                    </div>
                    <CardDescription className="pt-2">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {(resource.tags || []).map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default ResourceCard;
