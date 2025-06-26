import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BlogImage from '@/components/BlogImage';
import { blogPosts } from '@/data/blogPosts';
import { useLocation } from 'wouter';

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter posts based on search query
  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Group posts by category
  const basicsPosts = filteredPosts.filter(post => post.category === 'basics');
  const tipsPosts = filteredPosts.filter(post => post.category === 'tips');
  const comparisonPosts = filteredPosts.filter(post => post.category === 'comparison');

  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Educational Resources</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
          Expert guides and in-depth articles about internet technology, optimization tips, and making informed decisions about your internet service.
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search articles by topic, keyword, or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <i className="ri-search-line text-neutral-400"></i>
          </div>
        </div>
      </div>
      
      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2 text-xs">
              {filteredPosts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="basics">
            Basics
            <Badge variant="secondary" className="ml-2 text-xs">
              {basicsPosts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="tips">
            Tips
            <Badge variant="secondary" className="ml-2 text-xs">
              {tipsPosts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="comparison">
            Compare
            <Badge variant="secondary" className="ml-2 text-xs">
              {comparisonPosts.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <ResourceCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="basics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {basicsPosts.map((post) => (
              <ResourceCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="tips">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tipsPosts.map((post) => (
              <ResourceCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="comparison">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comparisonPosts.map((post) => (
              <ResourceCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* SEO Content Section */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Complete Internet Knowledge Hub</h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          Whether you're troubleshooting slow speeds, comparing internet providers, or securing your home network, 
          our comprehensive guides provide expert insights backed by industry experience. Each article is written 
          by certified professionals and updated regularly to reflect the latest technologies and best practices.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">50+</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">Expert Tips</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">2025</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">Updated Content</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">100%</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">Free Access</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ResourceCardProps {
  post: typeof blogPosts[0];
}

const ResourceCard = ({ post }: ResourceCardProps) => {
  const [_, setLocation] = useLocation();
  
  // Format read time
  const readTimeText = post.readTime < 60 
    ? `${post.readTime} min read` 
    : `${Math.round(post.readTime / 60)} hour read`;

  return (
    <a href={`/resources/${post.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="h-48 overflow-hidden">
          <BlogImage 
            src={post.id} 
            alt={post.imageAlt} 
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs">
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </Badge>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {readTimeText}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-neutral-100 line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-3">
          {post.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <i className="ri-user-line text-sm text-neutral-600 dark:text-neutral-300"></i>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {post.author.name}
            </div>
          </div>
          
          <a
            href={`/resources/${post.id}`}
            className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Read Article
            <i className="ri-arrow-right-line ml-1"></i>
          </a>
        </div>
        </CardContent>
      </Card>
    </a>
  );
};

export default Resources;