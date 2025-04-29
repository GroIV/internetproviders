import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Form schema validation
const formSchema = z.object({
  zipCode: z.string().length(5, "ZIP code must be 5 digits").regex(/^\d+$/, "ZIP code must contain only numbers"),
});

type FormValues = z.infer<typeof formSchema>;

interface ZipCodeSearchProps {
  fullWidth?: boolean;
  onSearch?: (zipCode: string) => void;
  className?: string;
}

const ZipCodeSearch = ({ fullWidth = false, onSearch, className = "" }: ZipCodeSearchProps) => {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isUsingLocation, setIsUsingLocation] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zipCode: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    if (onSearch) {
      onSearch(data.zipCode);
    } else {
      // Default behavior: redirect to comparison page with ZIP code
      setLocation(`/compare?zip=${data.zipCode}`);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsUsingLocation(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you would use a reverse geocoding service to get the ZIP code
            // For now, we'll simulate with a mock response
            const mockZipCode = "90210"; // Beverly Hills as an example
            
            // Update the form field
            form.setValue("zipCode", mockZipCode, { shouldValidate: true });
            
            toast({
              title: "Location detected",
              description: `Using ZIP code: ${mockZipCode}`,
            });
            
            setIsUsingLocation(false);
          } catch (error) {
            console.error("Error getting ZIP from coordinates:", error);
            toast({
              title: "Location Error",
              description: "Could not determine your ZIP code from location",
              variant: "destructive",
            });
            setIsUsingLocation(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          let message = "Could not determine your location";
          
          if (error.code === 1) {
            message = "Location permission denied";
          } else if (error.code === 2) {
            message = "Location unavailable";
          } else if (error.code === 3) {
            message = "Location request timed out";
          }
          
          toast({
            title: "Location Error",
            description: message,
            variant: "destructive",
          });
          
          setIsUsingLocation(false);
        }
      );
    } catch (error) {
      console.error("Geolocation error:", error);
      toast({
        title: "Location Error",
        description: "Could not access location services",
        variant: "destructive",
      });
      setIsUsingLocation(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-neutral-800 shadow-xl rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 ${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium">Enter Your ZIP Code</FormLabel>
                <div className="mt-2 flex">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 90210"
                      className="flex-1 min-w-0 block w-full rounded-l-lg"
                      maxLength={5}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^0-9]/g, '').substring(0, 5);
                        field.onChange(target.value);
                      }}
                    />
                  </FormControl>
                  <Button 
                    type="submit" 
                    className={`inline-flex items-center rounded-r-lg gradient-bg hover:opacity-90 ${fullWidth ? 'px-6' : 'px-4'}`}
                  >
                    Find Providers
                    <i className="ri-arrow-right-line ml-2"></i>
                  </Button>
                </div>
              </FormItem>
            )}
          />
          
          <div className="flex items-center">
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
            <span className="px-3 text-sm text-neutral-500 dark:text-neutral-400">or</span>
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={handleUseCurrentLocation}
            disabled={isUsingLocation}
          >
            {isUsingLocation ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Detecting location...
              </span>
            ) : (
              <>
                <i className="ri-map-pin-line mr-2 text-secondary-500"></i>
                Use Current Location
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ZipCodeSearch;
