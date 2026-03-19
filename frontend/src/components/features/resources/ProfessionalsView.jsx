import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { User, Stethoscope } from "lucide-react";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

// --- Mock data: 30 professionals ---
const mockProfessionals = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Dr. Professional ${i + 1}`,
    type: i % 2 === 0 ? "Therapist" : "Doctor",
    location: ["Delhi", "Mumbai", "Chandigarh", "Bengaluru", "Pune"][i % 5],
    description: `Expert in ${i % 2 === 0 ? "therapy" : "pediatrics"} with ${5 + i} years of experience.`,
    specialties: i % 2 === 0 ? ["ABA Therapy", "Speech Pathology"] : ["Pediatrics", "Diagnosis"],
}));

const ProfessionalsView = ({ type }) => {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const Icon = type === "Therapist" ? User : Stethoscope;
    const { token } = useAuthStore();

    useEffect(() => {
        const fetchProfessionals = async () => {
            setLoading(true);
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await apiClient.get(`/resources/providers?type=${type}`, { headers });
                const data = Array.isArray(response.data) ? response.data : response.data.providers || [];
                setProfessionals(data.length ? data : mockProfessionals.filter(p => p.type === type)); // fallback
            } catch (error) {
                console.error(`Failed to fetch ${type}s:`, error);
                setProfessionals(mockProfessionals.filter(p => p.type === type)); // fallback
            } finally {
                setLoading(false);
            }
        };
        fetchProfessionals();
    }, [type, token]);

    if (loading) return <div className="text-center py-10">Loading professionals...</div>;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {professionals.map((prof) => (
                <motion.div key={prof.id} variants={itemVariants}>
                    <Card className="flex flex-col sm:flex-row">
                        <div className="p-6 flex flex-col items-center justify-center border-b sm:border-r sm:border-b-0">
                            <Icon className="h-10 w-10 text-primary mb-2" />
                            <h3 className="text-lg font-bold font-heading">{prof.name}</h3>
                            <p className="text-sm text-muted-foreground">{prof.location}</p>
                        </div>
                        <div className="p-6 flex-grow">
                            <p className="text-muted-foreground">{prof.description}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {prof.specialties.map((spec) => (
                                    <Badge key={spec} variant="secondary">{spec}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 flex items-center">
                            <Button className="w-full sm:w-auto">View Profile</Button>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ProfessionalsView;
