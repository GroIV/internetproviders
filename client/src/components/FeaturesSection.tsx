import { motion } from "framer-motion";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FeaturesSection = () => {
  const features: Feature[] = [
    {
      icon: "ri-ai-generate",
      title: "AI Recommendations",
      description: "Our AI analyzes your usage patterns and preferences to recommend the perfect provider and plan."
    },
    {
      icon: "ri-map-2-line",
      title: "Coverage Maps",
      description: "Visualize which providers serve your location with accurate, up-to-date coverage maps."
    },
    {
      icon: "ri-scales-3-line",
      title: "Plan Comparison",
      description: "Compare plans side-by-side with interactive visualizations highlighting key differences."
    },
    {
      icon: "ri-speed-up-line",
      title: "Speed Test",
      description: "Measure your current speeds and see how they stack up against available options in your area."
    },
    {
      icon: "ri-building-line",
      title: "Home Setup Advisor",
      description: "Get personalized recommendations for optimizing your home network setup for maximum performance."
    },
    {
      icon: "ri-book-open-line",
      title: "Educational Resources",
      description: "Learn about internet technologies, terminology, and best practices with our comprehensive guides."
    }
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="absolute inset-0 grid-pattern opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-display font-bold sm:text-4xl">
            <span className="gradient-text">Smart Features</span> for Better Decisions
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
            Our AI-powered platform takes the guesswork out of finding the right internet provider.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 shadow-md group-hover:border-transparent transition-colors duration-300">
                <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4 shadow-md">
                  <i className={`${feature.icon} text-white text-xl`}></i>
                </div>
                <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary-500 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
