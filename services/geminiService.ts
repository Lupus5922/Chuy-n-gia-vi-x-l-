
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const API_KEY = process.env.API_KEY || "";

export const getGeminiResponse = async (
  prompt: string,
  image?: string,
  history: { role: string; parts: string }[] = []
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const parts: Part[] = [{ text: prompt }];
    
    if (image) {
      // image is expected to be a base64 string without the prefix data:image/jpeg;base64,
      const base64Data = image.split(',')[1] || image;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        { role: 'user', parts: [{ text: `System Instruction: ${SYSTEM_INSTRUCTION}` }] },
        ...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
        { role: "user", parts }
      ],
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });

    return response.text || "Xin lỗi, tôi không thể xử lý yêu cầu này lúc này.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã xảy ra lỗi khi kết nối với chuyên gia AI. Vui lòng kiểm tra lại kết nối mạng.";
  }
};
