import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { logger } from "@/lib/logger";

const EducationalResourcesPreview = () => {
  const [_, setLocation] = useLocation();
  
  const resources = [
    {
      id: "understanding-internet-speeds",
      title: "Understanding Internet Speeds",
      description: "Learn what different speed tiers mean and how much bandwidth you actually need for various activities.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    },
    {
      id: "wifi-optimization",
      title: "Wi-Fi Optimization Tips",
      description: "Discover how to maximize your home Wi-Fi performance with simple adjustments and optimal router placement.",
      image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    },
    {
      id: "fiber-cable-dsl-comparison",
      title: "Fiber vs Cable vs DSL",
      description: "Compare the different internet connection types to understand their strengths, limitations, and best use cases.",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
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
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div 
                  className="h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
                  onClick={() => {
                    logger.info('Card image clicked', { resourceId: resource.id });
                    setLocation(`/resources/${resource.id}`);
                  }}
                >
                  <ImageWithFallback 
                    src={resource.image} 
                    alt={resource.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 
                    className="text-xl font-display font-bold mb-2 text-neutral-900 dark:text-neutral-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    onClick={() => {
                      logger.info('Title clicked', { resourceId: resource.id });
                      setLocation(`/resources/${resource.id}`);
                    }}
                  >
                    {resource.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                    {resource.description}
                  </p>
                  <a
                    href={`/resources/${resource.id}`}
                    className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    Read Guide
                    <i className="ri-arrow-right-line ml-1"></i>
                  </a>
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

// Simple, bulletproof image component
const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const fallbackSrc = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80";
  
  return (
    <>
      {loading && (
        <Skeleton className="absolute inset-0 w-full h-48" />
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          if (!error) {
            setError(true);
            setLoading(false);
          }
        }}
      />
    </>
  );
};

export default EducationalResourcesPreview;