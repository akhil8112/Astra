import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import ScreenerQuestion from '@/components/features/screener/ScreenerQuestion';
// ✅ Import the new video test component
import ScreenerVideoTest from '@/components/features/screener/ScreenerVideoTest';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const screenerQuestions = [
    { id: 'q1', text: 'Does your child look at you when you call their name?', options: ['Yes', 'No'], riskOnNo: true },
    { id: 'q2', text: 'Is it easy for you to get eye contact with your child?', options: ['Yes', 'No'], riskOnNo: true },
    { id: 'q3', text: 'Does your child point to things to show you something interesting?', options: ['Yes', 'No'], riskOnNo: true },
    { id: 'q4', text: 'Does your child point to things they want?', options: ['Yes', 'No'], riskOnNo: true },
    { id: 'q5', text: 'Does your child engage with you in pretend play (e.g., feeding a doll)?', options: ['Yes', 'No'], riskOnNo: true },
    { id: 'q6', text: 'Does your child follow where you\'re looking?', options: ['Yes', 'No'], riskOnNo: true },
    { id: 'q7', text: 'If you or someone else is upset, does your child show signs of being concerned?', options: ['Yes', 'No'], riskOnNo: true },
    { id: 'q8', text: 'Does your child engage in repetitive movements (e.g., hand-flapping, rocking)?', options: ['Yes', 'No'], riskOnNo: false },
    { id: 'q9', text: 'Are your child\'s interests very narrow or intense?', options: ['Yes', 'No'], riskOnNo: false },
    { id: 'q10', text: 'Does your child seem overly sensitive to noise, textures, or lights?', options: ['Yes', 'No'], riskOnNo: false },
];

const ScreenerPage = () => {
    const [step, setStep] = useState('demographics');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [formData, setFormData] = useState({ name: '', age: '', sex: '', ethnicity: '', jaundice: '', family_asd: '' });
    const [answers, setAnswers] = useState({});
    // ✅ Add state to hold the results from the video test
    const [videoResults, setVideoResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Trigger the final analysis when the video test completes
    useEffect(() => {
        if (step === 'analysis' && videoResults) {
            handleSubmitScreener();
        }
    }, [step, videoResults]);

    const totalQuestions = screenerQuestions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    const currentQuestion = screenerQuestions[currentQuestionIndex];

    const handleAnswerSelect = (option) => {
        setAnswers({ ...answers, [currentQuestion.id]: option });
        setTimeout(() => {
            if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
        }, 300);
    };
    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };
    const handleDemographicsSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.age && formData.sex && formData.ethnicity && formData.jaundice !== '' && formData.family_asd !== '') {
            setStep('questionnaire');
        }
    };

    // ✅ The risk calculation now includes video test results
    const calculateCombinedRisk = (questionnaireAnswers, videoData) => {
        // 1. Calculate score from questionnaire
        let score = questionnaireAnswers.reduce((sum, current) => sum + current, 0);

        // 2. Adjust score based on video results
        if (videoData) {
            // Low focus time is a risk factor
            if (videoData.focusScore < 10) {
                score += 2;
            }
            // High repetitive count is a risk factor
            if (videoData.repetitiveCount > 8) {
                score += 3;
            }
        }

        let riskLevel = 'Low Risk';
        if (score > 6) {
            riskLevel = 'High Risk';
        } else if (score > 3) {
            riskLevel = 'Medium Risk';
        }

        return {
            riskLevel: riskLevel,
            analysisSummary: `Based on the questionnaire and video analysis, the calculated score is ${score}, indicating a ${riskLevel}.`,
            confidenceScore: null,
        };
    };

    const handleSubmitScreener = () => {
        setIsLoading(true);
        const mappedAnswers = screenerQuestions.map(q => {
            const answer = answers[q.id];
            if (q.riskOnNo) { return answer === 'No' ? 1 : 0; }
            else { return answer === 'Yes' ? 1 : 0; }
        });

        const analysisResult = calculateCombinedRisk(mappedAnswers, videoResults);

        setTimeout(() => {
            setIsLoading(false);
            navigate('/screener/results', { state: { results: analysisResult } });
        }, 1500);
    };

    // ✅ This new function handles the completion of the video test
    const handleVideoTestComplete = (results) => {
        setVideoResults(results);
        setStep('analysis');
    };

    return (
        <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12">
            <Card className="w-full max-w-3xl">
                <AnimatePresence mode="wait">
                    {/* Demographics and Questionnaire steps are mostly unchanged */}
                    {step === 'demographics' && (
                        <motion.div key="demographics">
                            <CardHeader>
                                <CardTitle>Child's Information</CardTitle>
                                <CardDescription>This information helps us provide a more accurate screening.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleDemographicsSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Child's Name</Label>
                                            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label htmlFor="age">Age (in years)</Label>
                                            <Input id="age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label htmlFor="sex">Sex</Label><Select onValueChange={(value) => setFormData({ ...formData, sex: value })}><SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                                        <div><Label htmlFor="ethnicity">Ethnicity</Label><Select onValueChange={(value) => setFormData({ ...formData, ethnicity: value })}><SelectTrigger><SelectValue placeholder="Select ethnicity" /></SelectTrigger><SelectContent><SelectItem value="Asian">Asian</SelectItem><SelectItem value="Black">Black</SelectItem><SelectItem value="Hispanic">Hispanic</SelectItem><SelectItem value="White">White</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label>Born with jaundice?</Label><Select onValueChange={(value) => setFormData({ ...formData, jaundice: value })}><SelectTrigger><SelectValue placeholder="Select an answer" /></SelectTrigger><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select></div>
                                        <div><Label>Family history of ASD?</Label><Select onValueChange={(value) => setFormData({ ...formData, family_asd: value })}><SelectTrigger><SelectValue placeholder="Select an answer" /></SelectTrigger><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select></div>
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" onClick={handleDemographicsSubmit} className="w-full">Start Questionnaire</Button>
                            </CardFooter>
                        </motion.div>
                    )}
                    {step === 'questionnaire' && (
                        <motion.div key="questionnaire">
                            <div className="p-6">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Question {currentQuestionIndex + 1} of {totalQuestions}
                                </p>
                                <Progress value={progress} className="mt-2" />
                            </div>
                            <div className="px-6 min-h-[280px]">
                                <AnimatePresence mode="wait">
                                    <ScreenerQuestion
                                        key={currentQuestion.id}
                                        question={currentQuestion}
                                        currentAnswer={answers[currentQuestion.id]}
                                        onAnswerSelect={handleAnswerSelect}
                                    />
                                </AnimatePresence>
                            </div>
                            <CardFooter className="flex justify-between items-center">
                                <Button variant="outline" onClick={handleBack} disabled={currentQuestionIndex === 0}>
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                {currentQuestionIndex < totalQuestions - 1 ? (
                                    <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} disabled={!answers[currentQuestion.id]}>
                                        Next <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button onClick={() => setStep('video')} disabled={Object.keys(answers).length < totalQuestions}>
                                        Proceed to Video Test
                                    </Button>
                                )}
                            </CardFooter>
                        </motion.div>
                    )}

                    {/* ✅ STEP 3: The new, integrated video test */}
                    {step === 'video' && (
                        <motion.div key="video">
                            <CardHeader>
                                <CardTitle>Part 2: Video Analysis</CardTitle>
                                <CardDescription>Please keep your hand visible to the camera for the duration of the test.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScreenerVideoTest onTestComplete={handleVideoTestComplete} />
                            </CardContent>
                        </motion.div>
                    )}

                    {/* STEP 4: ANALYSIS & SUBMISSION */}
                    {step === 'analysis' && (
                        <motion.div key="analysis" className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                            {isLoading && (
                                <>
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-2xl font-heading mt-4">Combining results...</p>
                                    <p className="text-muted-foreground mt-2">This will just take a moment.</p>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
};

export default ScreenerPage;