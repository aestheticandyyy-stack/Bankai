
import { GoogleGenAI, Type } from "@google/genai";
import { VideoClip, TimedWord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Analyzes a set of video frames to identify viral segments.
 * This is "Real Analysis" using multimodal input.
 */
export async function analyzeRealVideoFrames(frameBase64s: string[]): Promise<VideoClip[]> {
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
        { text: "These are frames from a video file. Analyze the visual flow and identifying 3 high-impact 'hooks' or 'viral moments'. Provide the approximate start/end times in seconds (assuming the frames represent a 30-60s clip). Return as JSON." }
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
    console.error("Analysis failed", e);
    return [];
  }
}

export async function generateTimedCaptionsForClip(description: string, duration: number): Promise<TimedWord[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a word-by-word transcript for a ${duration}s viral clip described as: "${description}". The speaker is high energy. Return as JSON array of {word, start, end} where start and end are within 0 to ${duration} seconds.`,
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
    console.error("Captions failed", e);
    return [];
  }
}

export async function editScreenshotText(base64Image: string, prompt: string): Promise<string | null> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: `Identify text and edit: ${prompt}. Match font/style exactly.` }
      ]
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return imagePart ? `data:image/png;base64,${imagePart.inlineData.data}` : null;
}
