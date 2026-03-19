import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WelcomeHeader from '@/components/features/dashboard/WelcomeHeader';
import StatCard from '@/components/features/dashboard/StatCard';
import ProgressChart from '@/components/features/dashboard/ProgressChart';
import SuggestedActivities from '@/components/features/dashboard/SuggestedActivities';
import StoryWeaverWidget from '@/components/features/dashboard/StoryWeaverWidget';
import ResourceLibraryWidget from '@/components/features/dashboard/ResourceLibraryWidget';
import { Activity, Check, Target } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, },
};
const DashboardPage = () => {
    const user = useAuthStore((state) => state.user);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch the stats from the new endpoint
                const statsResponse = await apiClient.get('/dashboard/stats');
                setStats(statsResponse.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
                // You can set an error state here to show a message to the user
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading || !user) {
        return <div className="container py-12 text-center">Loading dashboard...</div>;
    }

    return (
        <div className="container py-8 md:py-12">
            <WelcomeHeader parentName={user.username} childName="your child" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
                {/* --- DYNAMIC STAT CARDS --- */}
                <motion.div variants={itemVariants}>
                    <StatCard
                        title="Screener Result"
                        value={stats?.screenerResult?.level || 'N/A'}
                        description={`Last assessed: ${stats?.screenerResult ? new Date(stats.screenerResult.lastAssessed).toLocaleDateString() : '-'}`}
                        icon={<Target className="h-4 w-4 text-muted-foreground" />}
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <StatCard
                        title="Activities This Week"
                        value={stats?.activitiesThisWeek?.count || 0}
                        description={`${stats?.activitiesThisWeek?.change >= 0 ? '+' : ''}${stats?.activitiesThisWeek?.change} from last week`}
                        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <StatCard
                        title="Completion Rate"
                        value={`${(stats?.completionRate?.rate * 100 || 0).toFixed(0)}%`}
                        description={`Your ${stats?.completionRate?.period} average`}
                        icon={<Check className="h-4 w-4 text-muted-foreground" />}
                    />
                </motion.div>

                {/* --- OTHER WIDGETS --- */}
                <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
                    <ProgressChart />
                </motion.div>
                <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
                    <SuggestedActivities />
                </motion.div>
                <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-2">
                    <StoryWeaverWidget />
                </motion.div>
                <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1">
                    <ResourceLibraryWidget />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default DashboardPage;
