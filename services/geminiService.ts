import { GoogleGenAI, Type } from "@google/genai";
import type { Script } from '../types';

export const generateScriptAndMetadata = async (prompt: string, model: string): Promise<Omit<Script, 'id' | 'createdAt'>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const fullPrompt = `
      Based on the following user request, generate a PowerShell script, a concise and descriptive title for it, and an array of 3-5 relevant tags for categorization.
      The user request is: "${prompt}".

      The PowerShell script should be well-commented and follow best practices.
      The title should be in title case.
      The tags should be lowercase strings.

      Return the result as a single JSON object with the following structure:
      {
        "title": "string",
        "tags": ["string"],
        "script": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            script: { type: Type.STRING },
          },
          required: ["title", "tags", "script"],
        },
        temperature: 0.2,
      },
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);

    return {
      title: parsed.title,
      tags: parsed.tags,
      code: parsed.script,
    };
  } catch (error) {
    console.error("Error generating script:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('Requested entity was not found'))) {
       throw new Error("API_KEY_ERROR");
    }
    throw new Error("Failed to generate script. Please check your network connection and API key.");
  }
};

export const editScript = async (originalCode: string, editPrompt: string, model: string): Promise<{ code: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const fullPrompt = `
      You are an expert PowerShell script editor.
      Below is an existing PowerShell script. The user wants to modify it based on their request.
      Apply the requested changes and return a JSON object with a single key "script" that contains the complete, updated PowerShell script code.
      Ensure the returned code is the full script, not just the changed parts.

      Original Script:
      ---
      ${originalCode}
      ---

      User's Edit Request: "${editPrompt}"
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING },
          },
          required: ["script"],
        },
        temperature: 0.1,
      },
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);

    return {
      code: parsed.script,
    };
  } catch (error) {
    console.error("Error editing script:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('Requested entity was not found'))) {
       throw new Error("API_KEY_ERROR");
    }
    throw new Error("Failed to edit script. Please try again.");
  }
};

export const analyzeScriptContent = async (scriptCode: string, model: string): Promise<{ title: string; tags: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const fullPrompt = `
      Analyze the following PowerShell script content. Based on its functionality, generate a concise and descriptive title for it, and an array of 3-5 relevant tags for categorization.
      The title should be in title case.
      The tags should be lowercase strings.

      Return the result as a single JSON object with the following structure:
      {
        "title": "string",
        "tags": ["string"]
      }

      Script Content:
      ---
      ${scriptCode}
      ---
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "tags"],
        },
        temperature: 0.2,
      },
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);

    return {
      title: parsed.title,
      tags: parsed.tags,
    };
  } catch (error) {
    console.error("Error analyzing script:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('Requested entity was not found'))) {
       throw new Error("API_KEY_ERROR");
    }
    throw new Error("Failed to analyze script content. Please try again.");
  }
};