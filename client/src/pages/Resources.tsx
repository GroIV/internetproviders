import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const guides = [
    {
      title: "Understanding Internet Speeds",
      description: "Learn what different speed tiers mean and how much bandwidth you actually need for various activities.",
      category: "basics",
      image: "https://images.unsplash.com/photo-1563770557593-bda3c68c9c9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    },
    {
      title: "Wi-Fi Optimization Tips",
      description: "Discover how to maximize your home Wi-Fi performance with simple adjustments and optimal router placement.",
      category: "tips",
      image: "https://images.unsplash.com/photo-1586804699875-02246fdeaf0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    },
    {
      title: "Fiber vs Cable vs DSL",
      description: "Compare the different internet connection types to understand their strengths, limitations, and best use cases.",
      category: "comparison",
      image: "https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    },
    {
      title: "Internet Security Best Practices",
      description: "Protect your home network and devices with these essential security measures and tips.",
      category: "tips",
      image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    },
    {
      title: "Understanding Router Specifications",
      description: "Learn what router specs like dual-band, Wi-Fi 6, and MU-MIMO actually mean for your home network.",
      category: "basics",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    },
    {
      title: "Streaming Service Bandwidth Requirements",
      description: "Find out how much internet speed you need for popular streaming services at different quality levels.",
      category: "comparison",
      image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
    }
  ];
  
  // Filter resources based on search query
  const filteredGuides = guides.filter(guide => 
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    guide.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group guides by category for tab filtering
  const basicGuides = filteredGuides.filter(guide => guide.category === 'basics');
  const tipGuides = filteredGuides.filter(guide => guide.category === 'tips');
  const comparisonGuides = filteredGuides.filter(guide => guide.category === 'comparison');

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Educational Resources</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
          Learn everything you need to know about internet technology, services, and optimization.
        </p>
      </div>
      
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <i className="ri-search-line text-neutral-400"></i>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
          <TabsTrigger value="comparison">Comparisons</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide, index) => (
              <ResourceCard key={index} guide={guide} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="basics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {basicGuides.map((guide, index) => (
              <ResourceCard key={index} guide={guide} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="tips">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tipGuides.map((guide, index) => (
              <ResourceCard key={index} guide={guide} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="comparison">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comparisonGuides.map((guide, index) => (
              <ResourceCard key={index} guide={guide} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ResourceCardProps {
  guide: {
    title: string;
    description: string;
    category: string;
    image: string;
  };
}

const ResourceCard = ({ guide }: ResourceCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img src={guide.image} alt={guide.title} className="w-full h-48 object-cover" />
      <CardContent className="p-6">
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {guide.category.charAt(0).toUpperCase() + guide.category.slice(1)}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">{guide.title}</h3>
        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
          {guide.description}
        </p>
        <Button variant="link" className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 p-0">
          Read Guide
          <i className="ri-arrow-right-line ml-1"></i>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Resources;