// This file simulates a backend proxy.
// In a real production environment, this would be a server (e.g., a GCP Cloud Run instance)
// that securely stores and uses the API key. The client would make fetch requests to this server.
// For this frontend-only prototype, we are keeping the Gemini SDK calls here to demonstrate
// the correct architecture and prepare for a seamless transition to a real backend.

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// This is the ONLY place the API key should be referenced.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This simulates the structure of a backend that would handle various endpoints.
export const postToProxy = async (endpoint: string, body: any): Promise<any> => {
    console.log(`[PROXY] Calling endpoint: ${endpoint}`);

    switch (endpoint) {
        case '/gemini/generateContent':
        case '/gemini/generateSummary':
            return callGeminiGenerateContent(body);
        
        case '/gemini/stream':
             // This is a special case for streaming, we return the stream directly
            return callGeminiStream(body);

        case '/tts/synthesize':
            return callGoogleTts(body);

        default:
            throw new Error(`Unknown proxy endpoint: ${endpoint}`);
    }
};

// --- Gemini Handlers ---

async function callGeminiGenerateContent(body: any): Promise<GenerateContentResponse> {
    const { model, contents, config } = body;
    try {
        const response = await ai.models.generateContent({ model, contents, config });
        // The real API returns a complex object, we return it whole.
        return response;
    } catch (error) {
        console.error("Gemini API error (via proxy simulation):", error);
        throw error;
    }
}

async function callGeminiStream(body: any): Promise<AsyncGenerator<string>> {
    const { model, contents, config } = body;
    try {
        const responseStream = await ai.models.generateContentStream({ model, contents, config });
        
        // We need to adapt the SDK's stream to a simple text chunk stream for the UI
        async function* textStream(): AsyncGenerator<string> {
            for await (const chunk of responseStream) {
                if(chunk.text) {
                    yield chunk.text;
                }
            }
        }
        return textStream();

    } catch (error) {
        console.error("Gemini API streaming error (via proxy simulation):", error);
        throw error;
    }
}

// --- Google TTS Handler ---
async function callGoogleTts(body: any): Promise<{ audioContent: string | null }> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Google TTS API key is not configured.");
      return { audioContent: null };
    }
    const TTS_API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    try {
        const response = await fetch(TTS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Google TTS API error:', error.error.message || 'Unknown error');
            return { audioContent: null };
        }

        const data = await response.json();
        return { audioContent: data.audioContent || null };

    } catch (error) {
        console.error('Failed to synthesize speech:', error);
        return { audioContent: null };
    }
}