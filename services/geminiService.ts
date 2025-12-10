import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { DailyEntry, AIAnalysis } from "../types";

const getAIClient = () => {
  // Access the API key injected by Vite
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.includes("API_KEY")) {
    throw new Error("API Key is missing or invalid. Please check your .env file or Vercel settings.");
  }
  return new GoogleGenAI({ apiKey });
};

// Chat Service
export const createCoachChat = async (recentEntries: DailyEntry[]): Promise<Chat> => {
  const ai = getAIClient();
  
  const contextString = recentEntries.length > 0 
    ? JSON.stringify(recentEntries.map(e => ({
        date: e.date,
        subject: e.subjects,
        duration: `${e.durationMinutes}m`,
        focus: `${e.focusLevel}/10`,
        note: e.remarks
      })))
    : "No recent logs found.";

  // Use ai.chats.create with the specific model
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are FocusMate Coach, a friendly and motivating study partner.
      
      Your goal is to help the student improve their habits, stay consistent, and overcome challenges.
      You have access to their recent study logs (provided below). Use this data to give specific, personalized advice.
      
      Recent Logs:
      ${contextString}
      
      Guidelines:
      1. Be concise, encouraging, and constructive.
      2. If focus was low, ask gently about distractions.
      3. If they studied a lot, praise their consistency.
      4. Suggest breaks or techniques (like Pomodoro) if appropriate.
      5. Keep responses short (under 100 words) unless asked for detailed explanations.`,
    }
  });
};

export const sendMessageToCoach = async (chat: Chat, message: string): Promise<string> => {
  // Use sendMessage for chat interactions
  const response: GenerateContentResponse = await chat.sendMessage({ message });
  return response.text || "I'm having trouble thinking right now. Try again?";
};

// Analysis Service
export const analyzeProgress = async (entries: DailyEntry[]): Promise<AIAnalysis> => {
  const ai = getAIClient();
  
  const dataSummary = entries.map(e => ({
    date: e.date,
    subjects: e.subjects,
    duration: `${e.durationMinutes} mins`,
    focus: `${e.focusLevel}/10`,
    remarks: e.remarks
  }));

  const prompt = `
    Analyze the following study log entries.
    Identify patterns, mistakes, and improvements.
    
    Data: ${JSON.stringify(dataSummary)}
  `;

  // Use ai.models.generateContent with model defined in the call
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          trends: { type: Type.ARRAY, items: { type: Type.STRING } },
          mistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "trends", "mistakes", "suggestions"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as AIAnalysis;
};
