import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CHAT_MODEL, TRANSCRIBE_MODEL, SYSTEM_INSTRUCTION_CHAT, SYSTEM_INSTRUCTION_TRANSCRIBE } from '../constants';
import { ChatMessage } from '../types';

// Initialize Gemini Client
// Assumption: process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToChat = async (
  message: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    // Convert internal history format to Gemini API format if needed,
    // but for simple single-turn or managed history, we can just use the chat session.
    // However, to keep it stateless/robust for this demo, we'll re-instantiate or just maintain a session in the component.
    // Here we will use a fresh chat session for simplicity or pass history if we want multi-turn memory properly managed.
    
    // Constructing history for the chat
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: CHAT_MODEL,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_CHAT,
      },
      history: chatHistory
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "No response received.";
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

export const transcribeMedia = async (
  base64Data: string,
  mimeType: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: TRANSCRIBE_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Transcribe this audio/video. The language is Hinglish and English. Please provide a clear, formatted transcript."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_TRANSCRIBE,
      }
    });

    return response.text || "Could not generate transcript.";
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
};