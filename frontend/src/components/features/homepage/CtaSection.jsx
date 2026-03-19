import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const CtaSection = () => {
    // We get the login status from our global store
    const { isAuthenticated } = useAuthStore();

    return (
        <section className="py-24 bg-secondary">
            <div className="container text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* --- THIS IS THE FIX --- */}
                    {/* We now check 'isAuthenticated' to show the correct content */}
                    {isAuthenticated ? (
                        <>
                            <h2 className="text-3xl md:text-4xl font-bold font-heading">Continue Your Journey</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                                Your personalized dashboard is ready. Explore new activities, track progress, and find helpful resources.
                            </p>
                            <Button asChild size="lg" className="mt-8">
                                <Link to="/dashboard">
                                    Go to Your Dashboard <LayoutDashboard className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl md:text-4xl font-bold font-heading">Ready to Start Your Journey?</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                                Create an account to access your personalized dashboard, track progress, and connect with our supportive community.
                            </p>
                            <Button asChild size="lg" className="mt-8">
                                <Link to="/signup">
                                    Sign Up for Free <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default CtaSection;