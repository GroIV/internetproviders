import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  zipCode: z.string().length(5, "ZIP code must be 5 digits").regex(/^\d+$/, "ZIP code must contain only numbers"),
});

type FormValues = z.infer<typeof formSchema>;

const CallToAction = () => {
  const [_, setLocation] = useLocation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zipCode: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    setLocation(`/compare?zip=${data.zipCode}`);
  };

  return (
    <section className="py-16 bg-neutral-900 border-t border-neutral-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-radial from-primary-400 to-transparent opacity-60 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-secondary-400 to-transparent opacity-60 blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl font-display font-bold text-white sm:text-4xl mb-6">
          Ready to Find Your Perfect Internet Provider?
        </h2>
        <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
          Enter your ZIP code to see all available providers and plans in your area.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md mx-auto">
            <div className="flex">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter ZIP Code"
                        className="flex-1 min-w-0 block w-full px-5 py-4 rounded-l-xl"
                        maxLength={5}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/[^0-9]/g, '').substring(0, 5);
                          field.onChange(target.value);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="inline-flex items-center px-6 py-4 text-base font-medium rounded-r-xl text-white gradient-bg hover:opacity-90 shadow-lg"
              >
                Get Started
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default CallToAction;
