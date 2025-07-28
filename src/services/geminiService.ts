import { ReplyTone, AnalysisResult, GeneratedReply } from '../types';
import { performanceService } from './performanceService';

export class GeminiService {
  private static instance: GeminiService;
  private apiKey: string | null = null;
  private model: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || null;
    this.model = process.env.REACT_APP_GEMINI_MODEL || 'gemini-2.5-flash';
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  // Check if API key is configured
  public isApiKeyConfigured(): boolean {
    return !!this.apiKey;
  }

  // Test API connection
  public async testConnection(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, this is a test message."
            }]
          }]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  // Convert image to base64
  private async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Get tone guidelines
  private getToneGuidelines(tone: ReplyTone): string {
    const guidelines = {
      [ReplyTone.FRIENDLY]: `
- Warm, approachable, and positive
- Use friendly language and expressions
- Shows genuine interest and care
- Includes light humor when appropriate
- Examples: "That sounds awesome!", "Hope you're doing well", "Would love to hear more"`,

      [ReplyTone.CASUAL]: `
- Relaxed, informal, everyday language
- Use contractions and casual expressions
- Natural, conversational flow
- Not too formal or overly enthusiastic
- Examples: "Yeah totally", "Sounds good", "What's up with that?"`,

      [ReplyTone.FORMAL]: `
- Professional, polite, and respectful
- Proper grammar and complete sentences
- Courteous but not overly familiar
- Appropriate for workplace or formal relationships
- Examples: "I would be happy to help", "Thank you for reaching out", "Please let me know"`,

      [ReplyTone.PROFESSIONAL]: `
- Business-appropriate, competent, reliable
- Clear communication with purpose
- Respectful and solution-oriented
- Maintains professional boundaries
- Examples: "I'll look into that", "Let's schedule a time to discuss", "Thanks for the update"`,

      [ReplyTone.FLIRTY]: `
- Playful, charming, with subtle romantic interest
- Light teasing and compliments
- Creates intrigue and maintains conversation
- Appropriate level based on relationship stage
- Examples: "You're trouble 😏", "Miss me already?", "That's what I like to hear"`,

      [ReplyTone.WITTY]: `
- Clever, humorous, and entertaining
- Quick comebacks and smart observations
- Shows personality and intelligence
- Light sarcasm when appropriate
- Examples: "Well that escalated quickly", "Plot twist!", "You've got a point there"`
    };

    return guidelines[tone] || guidelines[ReplyTone.CASUAL];
  }

  // Create comprehensive chat analysis prompt
  private createChatAnalysisPrompt(tone: ReplyTone): string {
    const toneGuidelines = this.getToneGuidelines(tone);
    
    return `You are an expert at analyzing chat conversations and generating contextually appropriate replies. 

TASK: Analyze this chat screenshot and generate 3 different reply options in ${tone.toLowerCase()} tone.

ANALYSIS STEPS:
1. Read and understand the conversation context
2. Identify message positioning: RIGHT SIDE messages are MINE (the person I'm speaking for), LEFT SIDE messages are from the OTHER PERSON
3. Identify who is speaking and what the last message says
4. Determine the relationship dynamic (friends, romantic, professional, family, etc.)
5. Consider the conversation mood and energy level
6. Generate replies that fit naturally into this specific conversation as the RIGHT SIDE person

TONE GUIDELINES:
${toneGuidelines}

OUTPUT FORMAT (JSON only):
{
  "context": "Brief summary of the conversation context and last message",
  "lastMessage": "The exact last message that needs a reply",
  "relationship": "Type of relationship (friends/romantic/professional/family/casual)",
  "mood": "Current conversation mood (playful/serious/excited/concerned/etc)",
  "replies": [
    {
      "id": "1",
      "text": "First reply option",
      "reasoning": "Why this reply works in this context"
    },
    {
      "id": "2", 
      "text": "Second reply option",
      "reasoning": "Why this reply works in this context"
    },
    {
      "id": "3",
      "text": "Third reply option", 
      "reasoning": "Why this reply works in this context"
    }
  ]
}

ADDITIONAL CONTEXT ANALYSIS:
- Time of day (if visible in screenshot)
- Message timestamps and conversation flow
- Emoji usage and communication style
- Group chat vs. individual conversation
- Platform type (iMessage, WhatsApp, etc.)

REPLY STRATEGY:
- You are speaking as the RIGHT SIDE person (me) - maintain my voice and style
- Match the energy level and communication style of the conversation
- Consider conversation momentum (quick back-and-forth vs. delayed responses)
- Adapt to group dynamics if multiple people are involved
- Reference previous messages when relevant
- Maintain consistency with my established persona in the chat
- Keep my personality consistent with how I've been responding in the conversation

IMPORTANT RULES:
- Only respond with valid JSON
- Make replies sound natural and human
- Consider the conversation history, not just the last message
- Match MY communication style (right side messages) already established
- Keep replies appropriate for the relationship type
- Vary the length and approach of the 3 replies
- Remember: I am the RIGHT SIDE person, speaking to the LEFT SIDE person
- Do not include anything outside the JSON response

If the screenshot is unclear or unreadable:
{
  "context": "Unable to clearly read the conversation",
  "lastMessage": "Screenshot unclear",
  "relationship": "unknown",
  "mood": "unclear",
  "replies": [
    {
      "id": "1",
      "text": "Could you send that again? The image was a bit blurry",
      "reasoning": "Polite way to ask for clarification"
    },
    {
      "id": "2",
      "text": "Hey! What did you say? I couldn't see the message clearly",
      "reasoning": "Casual way to indicate technical issue"
    },
    {
      "id": "3",
      "text": "Sorry, having trouble reading that. Can you type it out?",
      "reasoning": "Direct request for text alternative"
    }
  ]
}`;
  }

  // Parse Gemini API response
  private parseGeminiResponse(responseText: string): AnalysisResult {
    try {
      // Extract JSON from response (handle cases where Gemini adds extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.context || !parsed.replies || !Array.isArray(parsed.replies)) {
        throw new Error('Invalid response structure');
      }

      const replies: GeneratedReply[] = parsed.replies.map((reply: any, index: number) => ({
        id: reply.id || `reply_${index + 1}`,
        text: reply.text || '',
        tone: reply.tone || 'CASUAL',
        timestamp: new Date(),
        reasoning: reply.reasoning || ''
      }));

      return {
        context: parsed.context,
        replies,
        timestamp: new Date(),
        screenshotUrl: undefined,
        lastMessage: parsed.lastMessage || '',
        relationship: parsed.relationship || 'unknown',
        mood: parsed.mood || 'neutral'
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  // Main method to analyze image and generate replies
  public async analyzeImageAndGenerateReplies(
    imageFile: File,
    tone: ReplyTone
  ): Promise<AnalysisResult> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Track performance
    return performanceService.trackApiCall(async () => {
      try {
        // Convert image to base64
        const base64Image = await this.convertImageToBase64(imageFile);
        
        // Generate comprehensive prompt
        const prompt = this.createChatAnalysisPrompt(tone);
        
        // Prepare request payload with the correct structure
        const payload = {
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64Image
                }
              },
              {
                text: prompt
              }
            ]
          }]
        };

        // Make API request
        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Gemini API error:', errorData);
          
          if (response.status === 400) {
            throw new Error('Invalid request. Please check your image and try again.');
          } else if (response.status === 401) {
            throw new Error('Invalid API key. Please check your configuration.');
          } else if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error(`API request failed (${response.status}). Please try again.`);
          }
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Invalid response from AI service');
        }

        const responseText = data.candidates[0].content.parts[0].text;
        
        // Parse and return result
        return this.parseGeminiResponse(responseText);
        
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error('Failed to analyze image. Please try again.');
        }
      }
    }, 'gemini_analysis');
  }
}

// Export singleton instance
export const geminiService = GeminiService.getInstance(); 