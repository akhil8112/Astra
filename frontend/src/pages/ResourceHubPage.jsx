import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import ProfessionalsView from "@/components/features/resources/ProfessionalsView";
import NgoMapView from "@/components/features/resources/NgoMapView";
import { Building, User, Stethoscope, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

const ResourceHubPage = () => {
    return (
        <div className="container py-8 md:py-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-heading">Find Your Support Network</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    Connect with a verified community of specialists, NGOs, and doctors dedicated to supporting neurodiverse journeys.
                </p>
                <Button asChild className="mt-6">
                    <Link to="/resources/library">
                        Explore the Full Resource Library <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="ngos" className="mt-10">
                <div className="flex justify-center">
                    <TabsList className="grid w-full max-w-lg grid-cols-3">
                        <TabsTrigger value="ngos">
                            <Building className="mr-2 h-4 w-4" /> NGOs
                        </TabsTrigger>
                        <TabsTrigger value="therapists">
                            <User className="mr-2 h-4 w-4" /> Therapists
                        </TabsTrigger>
                        <TabsTrigger value="doctors">
                            <Stethoscope className="mr-2 h-4 w-4" /> Doctors
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="ngos" className="mt-6">
                    <NgoMapView />
                </TabsContent>
                <TabsContent value="therapists" className="mt-6">
                    <ProfessionalsView type="Therapist" />
                </TabsContent>
                <TabsContent value="doctors" className="mt-6">
                    <ProfessionalsView type="Doctor" />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ResourceHubPage;