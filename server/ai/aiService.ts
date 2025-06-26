import fetch from 'node-fetch';

interface AIResponse {
  message: string;
  error?: string;
}

interface AIConfig {
  apiKey: string;
  apiType: 'openai' | 'claude';
  model?: string;
}

export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    if (!this.config.model) {
      this.config.model = config.apiType === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-sonnet-20240229';
    }
  }

  async generateResponse(prompt: string, context?: string): Promise<AIResponse> {
    try {
      if (this.config.apiType === 'openai') {
        return await this.callOpenAI(prompt, context);
      } else {
        return await this.callClaude(prompt, context);
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        message: 'I apologize, but I encountered an error. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async callOpenAI(prompt: string, context?: string): Promise<AIResponse> {
    const systemPrompt = `You are an expert internet service advisor. Help users understand internet technologies, compare providers, and make informed decisions about their internet service. Be helpful, clear, and concise.${context ? `\n\nContext: ${context}` : ''}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    return {
      message: data.choices[0].message.content
    };
  }

  private async callClaude(prompt: string, context?: string): Promise<AIResponse> {
    const systemPrompt = `You are an expert internet service advisor. Help users understand internet technologies, compare providers, and make informed decisions about their internet service. Be helpful, clear, and concise.${context ? `\n\nContext: ${context}` : ''}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    return {
      message: data.content[0].text
    };
  }

  // Generate context-aware responses for internet service questions
  async answerInternetQuestion(question: string, userContext?: {
    zipCode?: string;
    currentProvider?: string;
    usage?: string;
  }): Promise<AIResponse> {
    let context = 'The user is asking about internet service.';
    
    if (userContext) {
      if (userContext.zipCode) context += ` They are located in ZIP code ${userContext.zipCode}.`;
      if (userContext.currentProvider) context += ` Their current provider is ${userContext.currentProvider}.`;
      if (userContext.usage) context += ` They primarily use internet for ${userContext.usage}.`;
    }

    return this.generateResponse(question, context);
  }
}

// Singleton instance
let aiService: AIService | null = null;

export function getAIService(): AIService | null {
  if (!process.env.AI_API_KEY || !process.env.AI_API_TYPE) {
    console.log('AI service not configured. Set AI_API_KEY and AI_API_TYPE environment variables.');
    return null;
  }

  if (!aiService) {
    aiService = new AIService({
      apiKey: process.env.AI_API_KEY,
      apiType: process.env.AI_API_TYPE as 'openai' | 'claude'
    });
  }

  return aiService;
} 