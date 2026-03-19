import TeamMemberCard from "@/components/features/about/TeamMemberCard";

//mock data for your 6-person team
const teamMembers = [
    { name: "Team Member 1", role: "Project Lead & Presenter", contributions: ["Vision & Strategy", "Team Management", "Final Presentation"] },
    { name: "Team Member 2", role: "ML Engineer", contributions: ["DDS Classifier Model", "Computer Vision Logic", "Python Backend"] },
    { name: "Team Member 3", role: "Backend & API Developer", contributions: ["Server Architecture", "Database Design", "REST API Development"] },
    { name: "Team Member 4", role: "Frontend Developer", contributions: ["UI Implementation", "State Management", "API Integration"] },
    { name: "Team Member 5", role: "UI/UX & Frontend Support", contributions: ["Figma Mockups", "Component Design", "CSS Styling"] },
    { name: "Team Member 6", role: "Researcher & Content Strategist", contributions: ["Domain Research", "User Journey Mapping", "Content Creation"] },
];

const AboutUsPage = () => {
    return (
        <div className="container py-12 md:py-20">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-heading">Our Submission: Project Astra</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    Astra is the result of a collaborative effort by a passionate team of student innovators dedicated to leveraging AI for social good.
                </p>
            </div>

            <div className="mt-16">
                <h2 className="text-3xl font-bold font-heading text-center mb-10">Meet the Team</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers.map(member => (
                        <TeamMemberCard key={member.name} {...member} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;