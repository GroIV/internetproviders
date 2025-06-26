import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  isAI?: boolean;
}

const AiAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hi there! I'm your Internet Assistant. How can I help you today?",
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      sender: 'user',
      text: inputValue,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Call the AI API
      const response = await apiRequest('POST', '/api/ai/chat', {
        message: inputValue,
        context: {
          // You could add user context here if available
          // zipCode: userZipCode,
          // currentProvider: userProvider,
        }
      });
      
      const data = await response.json();
      
      const botResponse: Message = {
        sender: 'bot',
        text: data.message,
        isAI: data.isAI
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again later.',
        isAI: false
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
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
  
  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    // Trigger form submission
    const form = document.getElementById('chat-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };
  
  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
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
                          {message.sender === 'bot' && message.isAI !== undefined && (
                            <p className="text-xs mt-1 opacity-60">
                              {message.isAI ? '✨ AI Response' : '📚 Knowledge Base'}
                            </p>
                          )}
                        </div>
                        
                        {message.sender === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center ml-2">
                            <i className="ri-user-line text-neutral-600 dark:text-neutral-300 text-sm"></i>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
                    <form id="chat-form" onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Ask me anything about internet services..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit" 
                        className="gradient-bg hover:opacity-90"
                        disabled={isLoading}
                      >
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
                          onClick={() => handleQuickQuestion(question)}
                          disabled={isLoading}
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
                        <Button variant="outline" size="sm" className="justify-start" onClick={() => handleQuickQuestion("What's the difference between Mbps and MBps?")}>
                          <i className="ri-speed-line mr-2"></i>
                          <span className="text-xs">Internet Speeds</span>
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start" onClick={() => handleQuickQuestion("What is latency and why does it matter?")}>
                          <i className="ri-timer-line mr-2"></i>
                          <span className="text-xs">Latency</span>
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start" onClick={() => handleQuickQuestion("How do I secure my home WiFi?")}>
                          <i className="ri-lock-line mr-2"></i>
                          <span className="text-xs">Security</span>
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start" onClick={() => handleQuickQuestion("What's a good upload speed?")}>
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
                    
                    <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md">
                      <p className="text-xs text-primary-700 dark:text-primary-300">
                        <i className="ri-information-line mr-1"></i>
                        {process.env.AI_API_KEY ? 'AI-powered responses active' : 'Using knowledge base responses'}
                      </p>
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