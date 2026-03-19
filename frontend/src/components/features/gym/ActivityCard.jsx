import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

const ActivityCard = ({ icon, title, description, to, status }) => {
    return (
        <motion.div variants={itemVariants} className="h-full">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-lg">{icon}</div>
                        <div>
                            <CardTitle>{title}</CardTitle>
                            {status === 'soon' && <span className="text-xs font-medium text-primary">(Coming Soon)</span>}
                        </div>
                    </div>
                    <CardDescription className="pt-4">{description}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button asChild className="w-full" disabled={status === 'soon'}>
                        <Link to={to}>Start Activity <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default ActivityCard;