import { motion } from 'framer-motion';
import ActivityCard from '@/components/features/gym/ActivityCard';
import { Hand, Smile, Music } from 'lucide-react';

const activities = [
    { to: "/gym/magic-canvas", icon: <Hand className="h-8 w-8 text-primary" />, title: "Magic Canvas", description: "Develop fine motor skills and creativity by drawing in the air with your finger.", status: "ready" },
    { to: "/gym/emotion-mirror", icon: <Smile className="h-8 w-8 text-primary" />, title: "Emotion Mirror", description: "Practice recognizing and expressing emotions by mirroring facial expressions in real-time.", status: "ready" },
    { to: "/gym/magic-drums", icon: <Music className="h-8 w-8 text-primary" />, title: "Magic Drums", description: "Create rhythms and sounds with gestures, enhancing auditory processing and coordination.", status: "ready" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const SensoryGymPage = () => {
    return (
        <div className="container py-12 md:py-20">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-heading">The Neuro-Sensory Gym</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    A collection of playful, AI-powered activities designed to help build crucial cognitive, motor, and social skills.
                </p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {activities.map(activity => (
                    <ActivityCard key={activity.title} {...activity} />
                ))}
            </motion.div>
        </div>
    );
};

export default SensoryGymPage;