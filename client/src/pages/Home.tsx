import ZipCodeSearch from '@/components/ZipCodeSearch';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorks from '@/components/HowItWorks';
import AiAssistantPreview from '@/components/AiAssistantPreview';
import EducationalResourcesPreview from '@/components/EducationalResourcesPreview';
import CallToAction from '@/components/CallToAction';

const Home = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <AiAssistantPreview />
      <EducationalResourcesPreview />
      <CallToAction />
    </div>
  );
};

export default Home;