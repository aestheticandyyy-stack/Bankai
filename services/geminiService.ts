
import { GoogleGenAI, Type } from "@google/genai";
import { VideoClip, TimedWord } from "../types";

// Safe API Key retrieval with fallback for process-less environments
const getApiKey = () => {
  try {
    return typeof process !== 'undefined' && process.env ? process.env.API_KEY : null;
  } catch (e) {
    return null;
  }
};

// Deferred initialization function
const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Bankai: API_KEY not found in environment. AI features may not respond.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

/**
 * Analyzes a set of video frames to identify viral segments.
 */
export async function analyzeRealVideoFrames(frameBase64s: string[]): Promise<VideoClip[]> {
  const ai = getAI();
  const imageParts = frameBase64s.map(data => ({
    inlineData: {
      data: data.split(',')[1],
      mimeType: 'image/jpeg'
    }
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...imageParts,
        { text: "These are frames extracted from a video. Perform a deep analysis of the visual flow, hooks, and high-energy segments. Identify exactly 3 potential viral moments. For each, provide a start and end time in seconds (estimate based on the frame sequence), a catchy description, and a 'viral score' from 0-100. Return ONLY a JSON array." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            startTimeSeconds: { type: Type.NUMBER },
            endTimeSeconds: { type: Type.NUMBER },
            description: { type: Type.STRING },
            score: { type: Type.NUMBER }
          },
          required: ["id", "startTimeSeconds", "endTimeSeconds", "description", "score"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Deep analysis failed to parse", e);
    return [];
  }
}

export async function generateTimedCaptionsForClip(description: string, duration: number): Promise<TimedWord[]> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a dynamic, word-by-word transcript for a ${duration} second video clip described as: "${description}". The captions should be high-impact. Return as a JSON array of objects with {word, start, end} where start and end are timestamps in seconds relative to the clip start (0.0 to ${duration}.0).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            start: { type: Type.NUMBER },
            end: { type: Type.NUMBER }
          },
          required: ["word", "start", "end"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Caption generation failed", e);
    return [];
  }
}

export async function editScreenshotText(base64Image: string, prompt: string): Promise<string | null> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: `Identify the text areas in this screenshot and perform the following modification: ${prompt}. You must maintain the exact font family, weight, size, and background texture of the original image for a perfect 'ghost' edit.` }
      ]
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return imagePart ? `data:image/png;base64,${imagePart.inlineData.data}` : null;
}
