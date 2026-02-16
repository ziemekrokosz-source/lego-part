import { GoogleGenAI, Type } from "@google/genai";
import { LegoSet, LegoPart } from "../types";

export const fetchLegoSetData = async (setNumber: string): Promise<LegoSet> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `COMPLETE INVENTORY SCAN: Fetch the 100% full list of parts for LEGO set ${setNumber}.
  
  MANDATORY DATA FOR EACH PART:
  1. Part Name & Color.
  2. Quantity in this set.
  3. Design ID (e.g., 3001 for a 2x4 brick) - CRITICAL for images.
  4. Element ID (e.g., 4113233 for a specific red 2x4 brick).
  
  Return ALL parts. DO NOT TRUNCATE. Use BrickLink as the source of truth.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          theme: { type: Type.STRING },
          totalParts: { type: Type.NUMBER },
          parts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                color: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                description: { type: Type.STRING },
                designId: { type: Type.STRING, description: "The shape ID, e.g. 3001" },
                elementId: { type: Type.STRING, description: "The color-specific ID, e.g. 4113233" }
              },
              required: ["name", "color", "quantity", "description", "designId", "elementId"]
            }
          }
        },
        required: ["name", "theme", "totalParts", "parts"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Brak danych z modelu.");

  let rawData = JSON.parse(text.trim());
  
  const parts: LegoPart[] = rawData.parts.map((p: any, index: number) => {
    // Wielopoziomowa strategia obrazów
    // 1. Oficjalny serwer LEGO (najdokładniejszy dla elementId)
    // 2. BrickLink (najlepszy dla designId jeśli elementId zawiedzie)
    const legoImg = `https://www.lego.com/service/bricks/5/2/${p.elementId}`;
    
    return {
      ...p,
      id: `part-${Date.now()}-${index}`,
      collected: 0,
      imageUrl: legoImg 
    };
  });

  return {
    id: `set-${Date.now()}`,
    number: setNumber,
    name: rawData.name,
    theme: rawData.theme,
    totalParts: rawData.totalParts || parts.reduce((acc, p) => acc + p.quantity, 0),
    imageUrl: `https://images.brickset.com/sets/images/${setNumber}-1.jpg`,
    parts,
    lastModified: Date.now(),
    externalUrls: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(c => c.web).map(c => ({ title: c.web!.title, uri: c.web!.uri })) || []
  };
};