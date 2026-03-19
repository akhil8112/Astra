import { motion } from 'framer-motion';

const WelcomeHeader = ({ parentName = "Alex", childName = "Jamie" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-3xl font-bold font-heading">
                Welcome back, {parentName}!
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Here is the progress summary for {childName}.
            </p>
        </motion.div>
    );
};

export default WelcomeHeader;