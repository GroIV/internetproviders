import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { blogPosts } from "@/data/blogPosts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import BlogImage from "@/components/BlogImage";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const BlogPost = () => {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const [post, setPost] = useState<typeof blogPosts[0] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract ID from path - handle both /resources/:id and /blog/:id formats
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    const foundPost = blogPosts.find(p => p.id === id || p.slug === id);
    if (foundPost) {
      setPost(foundPost);
      
      // Add structured data to head
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(foundPost.schema);
      document.head.appendChild(script);
      
      // Update meta tags
      document.title = foundPost.metaTitle;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', foundPost.metaDescription);
      }
      
      // Clean up on unmount
      return () => {
        document.head.removeChild(script);
      };
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
            Sorry, we couldn't find the article you're looking for.
          </p>
          <Button onClick={() => setLocation("/resources")}>
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  const relatedPosts = post.relatedPosts
    .map(id => blogPosts.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <motion.article 
      className="min-h-screen pt-20 pb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary-50 to-transparent dark:from-primary-950/20 dark:to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 mb-4">
              <span className="capitalize">{post.category}</span>
              <span>•</span>
              <span>{post.readTime} min read</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-6">
              {post.title}
            </h1>
            
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              {post.description}
            </p>
          </div>
          
          {/* Author Info */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
                {post.author.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left">
                <div className="font-medium">{post.author.name}</div>
                <div className="text-neutral-500 dark:text-neutral-400">{post.author.title}</div>
              </div>
            </div>
            <span className="text-neutral-400">•</span>
            <time className="text-neutral-500 dark:text-neutral-400">
              {new Date(post.publishDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </time>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="rounded-2xl overflow-hidden shadow-xl">
          <BlogImage 
            src={post.id} 
            alt={post.imageAlt} 
            className="w-full h-[400px] object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
        />
        
        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">Topics</h3>
          <div className="flex flex-wrap gap-2">
            {post.keywords.map((keyword, index) => (
              <span 
                key={index}
                className="px-3 py-1 text-sm bg-neutral-100 dark:bg-neutral-800 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <Card className="mt-12 p-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {post.author.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-1">About {post.author.name}</h3>
              <p className="text-neutral-600 dark:text-neutral-300">{post.author.bio}</p>
            </div>
          </div>
        </Card>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Card 
                  key={related!.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/resources/${related!.id}`)}
                >
                  <div className="h-40 overflow-hidden">
                    <BlogImage 
                      src={related!.id} 
                      alt={related!.imageAlt} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold mb-2 line-clamp-2">{related!.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                      {related!.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Back to Resources */}
        <div className="mt-16 text-center">
          <Button 
            variant="outline"
            onClick={() => setLocation("/resources")}
            className="inline-flex items-center"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Back to All Resources
          </Button>
        </div>
      </div>
    </motion.article>
  );
};

// Simple markdown parser for basic formatting
function parseMarkdown(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-6">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-8">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Lists
    .replace(/^\* (.+)$/gim, '<li class="ml-6 mb-2">$1</li>')
    .replace(/^- (.+)$/gim, '<li class="ml-6 mb-2">$1</li>')
    .replace(/(<li.*<\/li>)\n(?!<li)/g, '$1</ul>\n')
    .replace(/(?<!<\/ul>)\n(<li)/g, '\n<ul class="list-disc mb-6">$1')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gim, '<li class="ml-6 mb-2">$1</li>')
    .replace(/(<li.*<\/li>)\n(?!<li)/g, '$1</ol>\n')
    .replace(/(?<!<\/ol>)\n(<li)/g, '\n<ol class="list-decimal mb-6">$1')
    // Code blocks
    .replace(/```[\s\S]*?```/g, match => {
      const code = match.slice(3, -3).trim();
      return `<pre class="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg overflow-x-auto mb-6"><code>${code}</code></pre>`;
    })
    // Inline code
    .replace(/`(.+?)`/g, '<code class="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-sm">$1</code>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-6">')
    .replace(/^/, '<p class="mb-6">')
    .replace(/$/, '</p>');
}

export default BlogPost;