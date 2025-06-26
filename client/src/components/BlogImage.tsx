import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogImageProps {
  src: string;
  alt: string;
  className?: string;
}

const BlogImage = ({ src, alt, className = "" }: BlogImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Direct URL mapping - guaranteed to work
  const imageUrls: Record<string, string> = {
    "understanding-internet-speeds": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80",
    "wifi-optimization": "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80",
    "fiber-cable-dsl-comparison": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80",
    "internet-security": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80",
    "router-specifications": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80",
    "streaming-bandwidth": "https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80"
  };

  // Fallback image that definitely works
  const fallbackImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340&q=80";

  // Get the correct image URL
  const getImageUrl = () => {
    // If it's already a full URL, use it
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // Direct lookup
    if (imageUrls[src]) {
      return imageUrls[src];
    }
    
    // Try partial matching
    const matchedKey = Object.keys(imageUrls).find(key => 
      src.includes(key) || key.includes(src)
    );
    
    if (matchedKey) {
      return imageUrls[matchedKey];
    }
    
    // Return fallback
    return fallbackImage;
  };

  const finalImageUrl = getImageUrl();

  return (
    <div className={`relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 ${className}`}>
      {loading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <img
        src={finalImageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setLoading(false)}
        onError={(e) => {
          // Try fallback on error
          const img = e.target as HTMLImageElement;
          if (img.src !== fallbackImage) {
            img.src = fallbackImage;
          } else {
            setError(true);
            setLoading(false);
          }
        }}
      />
      {error && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <div className="text-center p-4">
            <i className="ri-image-line text-4xl text-neutral-400 mb-2"></i>
            <p className="text-sm text-neutral-500">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogImage;