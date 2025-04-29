import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

const EducationalResourcesPreview = () => {
  const [_, setLocation] = useLocation();
  
  const resources = [
    {
      title: "Understanding Internet Speeds",
      description: "Learn what different speed tiers mean and how much bandwidth you actually need for various activities.",
      image: "https://images.unsplash.com/photo-1563770557593-bda3c68c9c9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    },
    {
      title: "Wi-Fi Optimization Tips",
      description: "Discover how to maximize your home Wi-Fi performance with simple adjustments and optimal router placement.",
      image: "https://images.unsplash.com/photo-1586804699875-02246fdeaf0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    },
    {
      title: "Fiber vs Cable vs DSL",
      description: "Compare the different internet connection types to understand their strengths, limitations, and best use cases.",
      image: "https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    }
  ];

  return (
    <section id="resources" className="py-20 relative">
      <div className="absolute inset-0 grid-pattern opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-display font-bold sm:text-4xl">
            <span className="gradient-text">Educational Resources</span>
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
            Learn everything you need to know about internet technology, services, and optimization
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img src={resource.image} alt={resource.title} className="w-full h-48 object-cover" />
                <CardContent className="p-6">
                  <h3 className="text-xl font-display font-bold mb-2 text-neutral-900 dark:text-neutral-100">{resource.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                    {resource.description}
                  </p>
                  <Button variant="link" className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 p-0">
                    Read Guide
                    <i className="ri-arrow-right-line ml-1"></i>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            className="inline-flex items-center justify-center gradient-bg hover:opacity-90 shadow-md"
            onClick={() => setLocation("/resources")}
          >
            Browse All Resources
            <i className="ri-arrow-right-line ml-2"></i>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EducationalResourcesPreview;
