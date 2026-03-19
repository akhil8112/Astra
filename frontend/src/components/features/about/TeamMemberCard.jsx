import { Card, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";

const TeamMemberCard = ({ name, role, contributions }) => {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className="h-full overflow-hidden">
                <div className="p-6 bg-secondary">
                    <h3 className="text-xl font-bold font-heading">{name}</h3>
                    <p className="text-primary font-medium">{role}</p>
                </div>
                <CardContent className="p-6">
                    <p className="text-sm font-semibold mb-2 text-muted-foreground">Key Contributions:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {contributions.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TeamMemberCard;