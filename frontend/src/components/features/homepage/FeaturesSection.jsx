import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { BrainCircuit, Puzzle, Users } from 'lucide-react';

const features = [
    {
        icon: <BrainCircuit className="h-10 w-10 text-primary mb-4" />,
        title: 'Dynamic Developmental Screener',
        description: 'Our AI-powered screener offers a responsible, non-diagnostic look at developmental traits, empowering you with information.',
    },
    {
        icon: <Puzzle className="h-10 w-10 text-primary mb-4" />,
        title: 'Neuro-Sensory Gym',
        description: 'Engage in a suite of playful, therapeutic games like Magic Canvas and Emotion Mirror, designed to build crucial cognitive skills.',
    },
    {
        icon: <Users className="h-10 w-10 text-primary mb-4" />,
        title: 'Verified Resource Hub',
        description: 'Connect with a curated network of trusted therapists, NGOs, and support communities, all searchable by location.',
    },
];

const FeaturesSection = () => {
    return (
        <section className="py-24 bg-secondary">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold font-heading">A Comprehensive Toolkit for Support</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        From preliminary assessment to skill-building and community connection, Astra provides end-to-end assistance.
                    </p>
                </motion.div>

                <div className="mt-16 grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="h-full text-center md:text-left flex flex-col items-center md:items-start p-8">
                                {feature.icon}
                                <CardHeader className="p-0">
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardDescription className="mt-2 text-base">
                                    {feature.description}
                                </CardDescription>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;