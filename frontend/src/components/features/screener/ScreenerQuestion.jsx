import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const ScreenerQuestion = ({ question, currentAnswer, onAnswerSelect }) => {
    return (
        <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            <CardHeader className="px-0">
                <CardTitle className="text-2xl md:text-3xl">{question.text}</CardTitle>
                <CardDescription>Please select the option that best describes your child's behavior.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-4">
                    {question.options.map((option) => (
                        <Button
                            key={option}
                            variant={currentAnswer === option ? 'default' : 'outline'}
                            size="lg"
                            className="w-full justify-start h-auto py-4 text-left"
                            onClick={() => onAnswerSelect(option)}
                        >
                            {option}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </motion.div>
    );
};

export default ScreenerQuestion;