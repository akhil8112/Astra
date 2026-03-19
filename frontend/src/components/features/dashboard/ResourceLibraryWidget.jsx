import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Link } from 'react-router-dom';
import { BookOpen } from "lucide-react";

const articles = [
    { title: "Understanding Sensory Needs", to: "#" },
    { title: "Tips for Non-Verbal Communication", to: "#" },
    { title: "Navigating School Environments", to: "#" },
];

const ResourceLibraryWidget = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Recommended Reading
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {articles.map(article => (
                        <li key={article.title}>
                            <Link to={article.to} className="font-medium hover:underline">
                                {article.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

export default ResourceLibraryWidget;