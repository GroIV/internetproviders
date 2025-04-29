import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hi there! I'm your Internet Assistant. How can I help you today?",
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = {
      sender: 'user',
      text: inputValue,
    };
    
    setMessages([...messages, userMessage]);
    setInputValue('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const botResponse = {
        sender: 'bot',
        text: getSimulatedResponse(inputValue),
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };
  
  // Very simple hardcoded responses for demonstration
  const getSimulatedResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('fiber') || lowerInput.includes('cable') || lowerInput.includes('dsl')) {
      return "Fiber offers the fastest speeds (up to 1 Gbps or more) with symmetrical upload/download, cable provides good speeds (50-500 Mbps) but asymmetrical performance, while DSL is slower (5-100 Mbps) but often more widely available in rural areas.";
    } else if (lowerInput.includes('speed') || lowerInput.includes('fast')) {
      return "For basic web browsing and email, 25 Mbps is sufficient. For HD streaming, aim for 50 Mbps. For multiple users or 4K streaming, 100+ Mbps is recommended. For gaming and large file transfers, 300+ Mbps provides the best experience.";
    } else if (lowerInput.includes('gaming')) {
      return "For gaming, low latency (ping) is often more important than raw speed. Look for plans with ping under 50ms. Fiber connections typically offer the best latency. I'd recommend at least 100 Mbps download and 10 Mbps upload for gaming while others use the network.";
    } else if (lowerInput.includes('streaming') || lowerInput.includes('netflix') || lowerInput.includes('youtube')) {
      return "For streaming video: SD quality needs 3-5 Mbps, HD needs 5-10 Mbps, and 4K needs 25-35 Mbps per stream. If multiple people stream simultaneously, add these requirements together.";
    } else if (lowerInput.includes('router') || lowerInput.includes('wifi')) {
      return "For the best Wi-Fi coverage, place your router centrally in your home, elevated if possible. Avoid placing it near metal objects, microwaves, or thick walls. Consider a mesh network system for larger homes. Make sure to use a secure password and WPA3 encryption if available.";
    } else {
      return "I'd be happy to help with your internet service questions. You can ask me about choosing between providers, understanding internet technologies, troubleshooting connection issues, or optimizing your home network.";
    }
  };
  
  // Common questions for quick access
  const commonQuestions = [
    "What's the difference between fiber, cable, and DSL?",
    "How much speed do I need for my home?",
    "What's the best internet for gaming?",
    "How can I improve my Wi-Fi signal?",
    "Which streaming services use the most bandwidth?"
  ];
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">AI Internet Assistant</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Get personalized help with choosing internet services, understanding technology, 
            and optimizing your connection.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-2 border-primary-100 dark:border-primary-900">
              <CardHeader className="bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                    <i className="ri-robot-line text-white text-lg"></i>
                  </div>
                  <div className="ml-3">
                    <CardTitle className="text-lg">Internet Assistant</CardTitle>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      AI-powered helper
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.sender === 'bot' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center mr-2">
                            <i className="ri-robot-line text-white text-sm"></i>
                          </div>
                        )}
                        
                        <div 
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.sender === 'user' 
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100' 
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        
                        {message.sender === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center ml-2">
                            <i className="ri-user-line text-neutral-600 dark:text-neutral-300 text-sm"></i>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Ask me anything about internet services..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" className="gradient-bg hover:opacity-90">
                        <i className="ri-send-plane-fill"></i>
                      </Button>
                    </form>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {commonQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setInputValue(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Tabs defaultValue="help">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="help">Help Topics</TabsTrigger>
                <TabsTrigger value="how">How It Works</TabsTrigger>
              </TabsList>
              
              <TabsContent value="help">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">You can ask me about:</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <i className="ri-check-line text-primary-500 mt-1 mr-2"></i>
                          <span className="text-sm">Comparing different internet technologies</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line text-primary-500 mt-1 mr-2"></i>
                          <span className="text-sm">Recommended speeds for your household</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line text-primary-500 mt-1 mr-2"></i>
                          <span className="text-sm">Understanding technical jargon</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line text-primary-500 mt-1 mr-2"></i>
                          <span className="text-sm">Troubleshooting common issues</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line text-primary-500 mt-1 mr-2"></i>
                          <span className="text-sm">Optimizing your home network</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Popular Topics:</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="justify-start" onClick={() => setInputValue("What's the difference between Mbps and MBps?")}>
                          <i className="ri-speed-line mr-2"></i>
                          <span className="text-xs">Internet Speeds</span>
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start" onClick={() => setInputValue("What is latency and why does it matter?")}>
                          <i className="ri-timer-line mr-2"></i>
                          <span className="text-xs">Latency</span>
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start" onClick={() => setInputValue("How do I secure my home WiFi?")}>
                          <i className="ri-lock-line mr-2"></i>
                          <span className="text-xs">Security</span>
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start" onClick={() => setInputValue("What's a good upload speed?")}>
                          <i className="ri-upload-line mr-2"></i>
                          <span className="text-xs">Upload Speeds</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="how">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">How the AI Assistant Works:</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        The AI Assistant uses natural language processing to understand your questions and provide helpful responses about internet services and technology.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md">
                        <h4 className="font-medium text-sm mb-1">Personalized Advice</h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Get tailored recommendations based on your specific needs and usage patterns
                        </p>
                      </div>
                      
                      <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md">
                        <h4 className="font-medium text-sm mb-1">Simple Explanations</h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Technical concepts explained in easy-to-understand language without jargon
                        </p>
                      </div>
                      
                      <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md">
                        <h4 className="font-medium text-sm mb-1">Unbiased Information</h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Get objective information about providers and services without sales pressure
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;