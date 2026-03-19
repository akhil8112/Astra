import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';
// import SplineModel from './SplineModel';
import HeroVisual from './HeroVisual';
import { useAuthStore } from '@/store/authStore';
import { AuthModal } from '@/components/common/AuthModal';

const HeroSection = () => {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleDashboardClick = () => {
        // If the user is logged in, navigate to the dashboard
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            // If not, open the login/signup modal
            setShowAuthModal(true);
        }
    };

    return (
        <>
            <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />

            <section className="container grid lg:grid-cols-2 gap-12 items-center py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center text-center lg:items-start lg:text-left"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight tracking-tighter">
                        A Brighter Path for
                        <br />
                        <span className="text-primary">Neurodiverse Journeys</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                        Astra is a compassionate, AI-powered toolkit designed to support parents and children. From responsible early screening to playful, skill-building activities, we're here to help you navigate every step.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                        {/* This button now has a smart onClick handler */}
                        <Button size="lg" onClick={handleDashboardClick}>
                            Open Dashboard <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link to="/screener">Take the Screener</Link>
                        </Button>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative h-80 lg:h-96"
                >
                    {/* <SplineModel /> */}
                    <HeroVisual />
                </motion.div>
            </section>
        </>
    );
};

export default HeroSection;