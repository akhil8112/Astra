import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { BookOpen, MessageSquare, Video } from 'lucide-react';

const features = [
    { icon: <BookOpen className="h-8 w-8 text-primary" />, title: "Curated Resource Library", description: "Access a wealth of articles and guides written by specialists, tailored to your child's specific needs and age group." },
    { icon: <Video className="h-8 w-8 text-primary" />, title: "Expert-Led Videos", description: "Watch short, informative videos that provide practical advice and therapeutic techniques you can use at home." },
    { icon: <MessageSquare className="h-8 w-8 text-primary" />, title: "Anonymous Parent Forum", description: "Connect with a supportive community of parents. Share experiences and find solidarity in a safe, moderated space." },
];

const CommunitySection = () => {
    return (
        <section className="container py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }}
                className="text-center"
            >
                <h2 className="text-3xl md:text-4xl font-bold font-heading">More Than a Tool—A Community</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Astra's support extends beyond activities with a dedicated library and a safe space to connect.
                </p>
            </motion.div>
            <div className="mt-16 grid lg:grid-cols-3 gap-8">
                {/* Main visual card */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }}
                    className="lg:col-span-1"
                >
                    <Card className="h-full p-0 overflow-hidden">
                        {/* Replace with an actual image if you have one */}
                        <div className="h-full w-full bg-secondary flex items-center justify-center">

                        </div>
                    </Card>
                </motion.div>

                {/* Feature list */}
                <div className="lg:col-span-2 grid gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                        >
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">{feature.icon}</div>
                                <div>
                                    <h3 className="text-xl font-bold font-heading">{feature.title}</h3>
                                    <p className="mt-1 text-muted-foreground">{feature.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CommunitySection;