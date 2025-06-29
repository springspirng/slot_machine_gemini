import { GoogleGenAI } from "@google/genai";
import { SymbolDefinition } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSymbols = async (theme: string): Promise<SymbolDefinition[]> => {
  const prompt = `Generate a list of exactly 7 unique slot machine symbols based on the theme: "${theme}".

Your response MUST be a valid JSON array of objects, without any surrounding text, explanations, or markdown fences.

Each object in the array represents a symbol and must have the following properties:
1. "name": A string representing the symbol's name.
2. "emoji": A string containing a single, relevant emoji.
3. "payout": A number representing the payout multiplier for getting three in a row.

The payout values should be distributed between 5 and 100. Exactly one symbol must have the highest payout of 100.

Here is a full, valid JSON example for a "pirate" theme:
[
  {"name": "Gold Coin", "emoji": "🪙", "payout": 10},
  {"name": "Parrot", "emoji": "🦜", "payout": 15},
  {"name": "Anchor", "emoji": "⚓", "payout": 20},
  {"name": "Map", "emoji": "🗺️", "payout": 25},
  {"name": "Ship", "emoji": "⛵", "payout": 50},
  {"name": "Captain", "emoji": "🏴‍☠️", "payout": 75},
  {"name": "Treasure Chest", "emoji": "💎", "payout": 100}
]

Now, generate the JSON for the theme: "${theme}".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData.every(item => 'name' in item && 'emoji' in item && 'payout' in item)) {
        return parsedData as SymbolDefinition[];
    } else {
        console.error("API returned invalid data structure:", parsedData);
        throw new Error("API returned data in an unexpected format.");
    }

  } catch (error) {
    console.error("Failed to generate symbols:", error);
    // Check if the error is a parsing error to give a more specific message
    if (error instanceof SyntaxError) {
        throw new Error("Could not parse symbols from the AI. The format was invalid.");
    }
    throw new Error("Could not generate symbols. Please try a different theme.");
  }
};
