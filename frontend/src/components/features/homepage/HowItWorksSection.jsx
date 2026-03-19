import { motion } from 'framer-motion';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { ScreenShare, ToyBrick, Link as LinkIcon } from 'lucide-react';

const steps = [
    { icon: <ScreenShare className="h-10 w-10 text-primary" />, title: "1. Take the Screener", description: "Start with our responsible, AI-guided questionnaire to understand your child's developmental traits." },
    { icon: <ToyBrick className="h-10 w-10 text-primary" />, title: "2. Engage & Play", description: "Explore the Sensory Gym with fun, therapeutic activities designed to build cognitive and motor skills." },
    { icon: <LinkIcon className="h-10 w-10 text-primary" />, title: "3. Connect & Grow", description: "Use your dashboard to track progress and find verified specialists in our Resource Hub." },
];

const HowItWorksSection = () => {
    return (
        <section className="container py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <h2 className="text-3xl md:text-4xl font-bold font-heading">A Clear Path Forward</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Getting started with Astra is simple and straightforward.
                </p>
            </motion.div>
            <div className="mt-16 grid md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                    >
                        <Card className="border-none shadow-none text-center bg-transparent">
                            <div className="flex justify-center mb-6">{step.icon}</div>
                            <CardTitle>{step.title}</CardTitle>
                            <CardDescription className="mt-2 text-base">{step.description}</CardDescription>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorksSection;