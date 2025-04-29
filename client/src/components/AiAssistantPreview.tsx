import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

const AiAssistantPreview = () => {
  const [_, setLocation] = useLocation();

  const features = [
    {
      icon: "ri-robot-line",
      title: "Personalized Recommendations",
      description: "Get tailored provider and plan suggestions based on your specific needs and usage patterns."
    },
    {
      icon: "ri-question-answer-line",
      title: "Jargon-Free Explanations",
      description: "Understand complex internet terminology and technology concepts explained in simple language."
    },
    {
      icon: "ri-file-search-line",
      title: "Contract Analysis",
      description: "Upload provider contracts and get AI-powered explanations of terms, conditions, and potential gotchas."
    }
  ];
  
  // Sample AI chat messages for the preview
  const messages = [
    {
      sender: "bot",
      text: "Hi there! I'm your Internet Assistant. How can I help you today?"
    },
    {
      sender: "user",
      text: "I need help finding an internet plan for streaming and working from home."
    },
    {
      sender: "bot",
      text: "Great! To help you find the best plan, I need to know a few things:",
      list: [
        "How many people use the internet simultaneously?",
        "What kind of streaming quality do you prefer (HD, 4K)?",
        "Do you do video conferencing for work?"
      ]
    },
    {
      sender: "user",
      text: "We have 3 people, we watch in 4K, and yes I do video calls daily."
    },
    {
      sender: "bot",
      text: "Based on your needs, I recommend a plan with at least 300 Mbps download speed. This would handle multiple 4K streams and video calls simultaneously.",
      recommendation: {
        title: "Recommended Plan:",
        plan: "AT&T Fiber 500 - $65/month"
      }
    }
  ];

  return (
    <section className="py-20 bg-neutral-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-secondary-400 to-transparent opacity-60 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-primary-400 to-transparent opacity-60 blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="lg:w-1/2 space-y-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              Meet Your Personal <span className="gradient-text">AI Assistant</span>
            </h2>
            <p className="text-lg text-neutral-300 max-w-2xl">
              Our AI assistant helps you navigate the complex world of internet services. Ask questions, get recommendations, and learn about technology in plain language.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <i className={`${feature.icon} text-xl text-primary-400`}></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-display font-medium text-white">{feature.title}</h3>
                    <p className="mt-2 text-neutral-300">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div>
              <Button 
                className="inline-flex items-center justify-center gradient-bg hover:opacity-90 shadow-lg"
                onClick={() => setLocation("/ai-assistant")}
              >
                Try AI Assistant
                <i className="ri-arrow-right-line ml-2"></i>
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2 mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* AI Chat Interface Preview */}
            <div className="bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-700 max-w-md mx-auto overflow-hidden">
              <div className="bg-neutral-800 px-4 py-3 border-b border-neutral-700 flex items-center">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                  <i className="ri-robot-line text-white text-lg"></i>
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-white font-semibold">Internet Assistant</div>
                  <div className="text-xs text-neutral-400">Online</div>
                </div>
                <button className="p-2 text-neutral-400 hover:text-white">
                  <i className="ri-settings-4-line"></i>
                </button>
              </div>
              
              <div className="h-96 p-4 overflow-y-auto bg-neutral-900">
                {messages.map((message, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.2 }}
                    className={`flex items-start mb-4 ${message.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.sender === 'bot' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                        <i className="ri-robot-line text-white text-sm"></i>
                      </div>
                    )}
                    
                    <div className={`${message.sender === 'bot' ? 'ml-2 bg-neutral-800 rounded-lg rounded-tl-none' : 'mr-2 bg-primary-600 rounded-lg rounded-tr-none'} px-4 py-2 max-w-xs`}>
                      <p className="text-white text-sm">{message.text}</p>
                      
                      {message.list && (
                        <ul className="list-disc list-inside text-white text-sm mt-2 space-y-1">
                          {message.list.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                      
                      {message.recommendation && (
                        <div className="mt-3 p-3 bg-neutral-700 rounded-lg">
                          <p className="text-white text-sm font-semibold">{message.recommendation.title}</p>
                          <p className="text-white text-sm mt-1">{message.recommendation.plan}</p>
                          <Button className="mt-2 w-full px-3 py-1.5 text-xs gradient-bg rounded text-white font-medium">
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                        <i className="ri-user-line text-white text-sm"></i>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <div className="px-4 py-3 bg-neutral-800 border-t border-neutral-700">
                <div className="flex">
                  <input type="text" placeholder="Ask me anything about internet services..." className="flex-1 bg-neutral-700 border-0 rounded-l-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <Button className="px-4 py-2 gradient-bg rounded-r-lg text-white">
                    <i className="ri-send-plane-fill"></i>
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="px-3 py-1 bg-neutral-700 border-0 rounded-full text-xs text-white hover:bg-neutral-600">
                    Speed test?
                  </Button>
                  <Button variant="outline" size="sm" className="px-3 py-1 bg-neutral-700 border-0 rounded-full text-xs text-white hover:bg-neutral-600">
                    Compare fiber vs cable
                  </Button>
                  <Button variant="outline" size="sm" className="px-3 py-1 bg-neutral-700 border-0 rounded-full text-xs text-white hover:bg-neutral-600">
                    Best gaming plans
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AiAssistantPreview;
