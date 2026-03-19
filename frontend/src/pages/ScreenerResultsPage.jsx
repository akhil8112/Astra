import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';

const ScreenerResultsPage = () => {
    // Get the dynamic results object passed from the ScreenerPage
    const location = useLocation();
    const results = location.state?.results;

    // Handle case where user navigates here directly without results
    if (!results) {
        return (
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold">No results found.</h1>
                <p className="text-muted-foreground">
                    Please <Link to="/screener" className="text-primary underline">complete the screener</Link> first.
                </p>
            </div>
        );
    }

    // This config object provides the correct icon, title, and color for each risk level.
    const displayConfig = {
        'Low Risk': {
            title: 'Low Probability of ASD Traits',
            icon: <CheckCircle className="h-12 w-12 text-green-500" />,
            colorClass: "text-green-500",
        },
        'Medium Risk': {
            title: 'Medium Probability of ASD Traits',
            icon: <Info className="h-12 w-12 text-yellow-500" />,
            colorClass: "text-yellow-500",
        },
        'High Risk': {
            title: 'High Probability of ASD Traits',
            icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
            colorClass: "text-red-500",
        },
    };

    // Select the correct display settings based on the dynamic riskLevel from the results
    const currentDisplay = displayConfig[results.riskLevel] || displayConfig['Low Risk'];

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
                        {currentDisplay.icon}
                        <h2 className={`text-2xl font-heading font-semibold ${currentDisplay.colorClass}`}>
                            {currentDisplay.title}
                        </h2>
                        {/* ✅ This now displays the DYNAMIC summary from the calculation */}
                        <p className="max-w-xl text-muted-foreground">
                            {results.analysisSummary}
                        </p>
                        {/* ✅ This displays the confidence score if it exists (for ML models) */}
                        {results.confidenceScore && (
                            <div className="pt-4">
                                <p className="text-lg font-semibold text-muted-foreground">Model Confidence</p>
                                <p className="text-2xl font-mono">{(results.confidenceScore * 100).toFixed(1)}%</p>
                            </div>
                        )}
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
                    </CardFooter>
                </Card>
            </motion.div>
        </div >
    );
};

export default ScreenerResultsPage;