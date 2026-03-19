import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';

const ResultsPage = () => {
    const location = useLocation();
    const { riskLevel = 'Low' } = location.state || {};

    const resultConfig = {
        Low: {
            title: 'Low Probability of ASD Traits',
            icon: <CheckCircle className="h-12 w-12 text-green-500" />,
            colorClass: "text-green-500",
            description: "Based on your answers, the behaviors show a low probability of being associated with Autism Spectrum Disorder. Continue to monitor your child's development and consult a pediatrician with any concerns.",
        },
        Medium: {
            title: 'Medium Probability of ASD Traits',
            icon: <Info className="h-12 w-12 text-yellow-500" />,
            colorClass: "text-yellow-500",
            description: "The behaviors reported suggest a medium probability of being associated with ASD. It is recommended to discuss these observations with a child development specialist for a more comprehensive evaluation.",
        },
        High: {
            title: 'High Probability of ASD Traits',
            icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
            colorClass: "text-red-500",
            description: "The behaviors reported show a high correlation with traits of ASD. We strongly recommend scheduling a consultation with a developmental pediatrician or a qualified specialist for a formal diagnostic evaluation.",
        },
    };

    const currentResult = resultConfig[riskLevel];

    return (
        <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-3xl"
            >
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="text-3xl">Screening Results</CardTitle>
                        <CardDescription className="max-w-xl mx-auto">
                            Please remember, this is a preliminary screening and is{' '}
                            <span className="font-semibold text-foreground">not a diagnosis</span>.
                            It is a tool to help guide your next steps.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4 border-t border-b py-8">
                        {currentResult.icon}
                        <h2 className={`text-2xl font-heading font-semibold ${currentResult.colorClass}`}>
                            {currentResult.title}
                        </h2>
                        <p className="max-w-xl text-muted-foreground">
                            {currentResult.description}
                        </p>
                    </CardContent>
                    <CardFooter className="flex-col items-start p-6 text-left">
                        <h3 className="text-xl font-heading font-semibold">Recommended Next Steps</h3>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                            <li>Share these results with your child's pediatrician.</li>
                            <li>Explore our curated articles and guides in the Resource Hub.</li>
                            <li>Connect with specialists and support groups for guidance.</li>
                        </ul>
                        <Button asChild className="mt-6 w-full sm:w-auto">
                            <Link to="/resources">
                                Explore the Resource Hub <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        {/* </Button> */}
                    </CardFooter>
                </Card>
            </motion.div>
        </div >
    );
};

export default ResultsPage;