
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiScenarioUAV } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    uavs: {
      type: Type.ARRAY,
      description: "List of Unmanned Aerial Vehicles (UAVs).",
      items: {
        type: Type.OBJECT,
        properties: {
          start: {
            type: Type.OBJECT,
            description: "The starting coordinates of the UAV.",
            properties: {
              x: { type: Type.NUMBER, description: "X-coordinate between -450 and 450." },
              y: { type: Type.NUMBER, description: "Y-coordinate between -450 and 450." },
            },
            required: ['x', 'y'],
          },
          end: {
            type: Type.OBJECT,
            description: "The target destination coordinates of the UAV.",
            properties: {
              x: { type: Type.NUMBER, description: "X-coordinate between -450 and 450." },
              y: { type: Type.NUMBER, description: "Y-coordinate between -450 and 450." },
            },
            required: ['x', 'y'],
          },
        },
        required: ['start', 'end'],
      },
    },
  },
  required: ['uavs'],
};


export const generateScenarioFromPrompt = async (
  prompt: string
): Promise<GeminiScenarioUAV[]> => {
  if (!API_KEY) {
    throw new Error("API key for Gemini is not configured.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following user request, generate a multi-UAV scenario. The simulation canvas is 1000x1000 pixels, with the origin (0,0) at the center. Coordinates should range from -450 to 450 to keep UAVs within view. Ensure the start and end points are different for each UAV. User request: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed.uavs && Array.isArray(parsed.uavs)) {
      return parsed.uavs as GeminiScenarioUAV[];
    }
    return [];
  } catch (error) {
    console.error("Error generating scenario with Gemini:", error);
    throw new Error("Failed to generate scenario. Please check your prompt or API key.");
  }
};
