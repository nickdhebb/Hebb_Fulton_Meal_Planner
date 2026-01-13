const fetch = require("node-fetch");
const pdfParse = require("pdf-parse");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({ error: "Claude API key missing" });
    }

    const { base64Data } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: "No PDF provided" });
    }

    const buffer = Buffer.from(base64Data, "base64");

    // STEP 1: Extract text from PDF
    const parsed = await pdfParse(buffer);
    const extractedText = parsed.text?.trim();

    if (!extractedText || extractedText.length < 50) {
      return res.status(422).json({
        error: "PDF has no readable text (likely scanned image)"
      });
    }

    // STEP 2: Send text to Claude
    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 800,
          messages: [
            {
              role: "user",
              content: `Extract recipe data and return ONLY valid JSON.

Schema:
{
  "servings": number,
  "cuisine": string,
  "ingredients": [
    { "amount": string, "unit": string, "name": string }
  ]
}

TEXT:
${extractedText}`
            }
          ]
        })
      }
    );

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      throw new Error(errText);
    }

    const raw = await claudeResponse.json();
    const text =
      raw?.content?.find(c => c.type === "text")?.text || "";

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(422).json({ error: "Claude returned no JSON" });
    }

    const parsedJson = JSON.parse(match[0]);

    return res.status(200).json({
      servings: parsedJson.servings ?? 4,
      cuisine: parsedJson.cuisine ?? "Other",
      ingredients: Array.isArray(parsedJson.ingredients)
        ? parsedJson.ingredients
        : []
    });

  } catch (err) {
    console.error("Extract error:", err);
    return res.status(500).json({
      error: "Extraction failed",
      details: err.message
    });
  }
};
