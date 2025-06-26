import { motion } from "framer-motion";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Enter Your ZIP Code",
      description: "Start by entering your ZIP code so we can identify all available providers in your area."
    },
    {
      number: 2,
      title: "Share Your Preferences",
      description: "Tell us about your internet usage habits and priorities to help our AI customize recommendations."
    },
    {
      number: 3,
      title: "Compare & Choose",
      description: "Review personalized recommendations and interactive comparisons to find your perfect plan."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-neutral-50 dark:bg-neutral-900 border-t border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-display font-bold sm:text-4xl">
            How <span className="gradient-text">InternetProviders.ai</span> Works
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
            Find your perfect internet provider in just a few simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg text-white text-2xl font-bold mb-6 shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-display font-bold mb-4">{step.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {step.description}
                </p>
              </div>
              
              {/* Connector (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 transform -translate-x-8"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
