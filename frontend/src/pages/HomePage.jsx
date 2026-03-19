import HeroSection from "@/components/features/homepage/HeroSection";
import FeaturesSection from "@/components/features/homepage/FeaturesSection";
import HowItWorksSection from "@/components/features/homepage/HowItWorksSection";
import CtaSection from "@/components/features/homepage/CtaSection";
import CommunitySection from "@/components/features/homepage/CommunitySection";

const HomePage = () => {
    return (
        <>
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <CommunitySection />
            <CtaSection />
        </>
    );
};

export default HomePage;