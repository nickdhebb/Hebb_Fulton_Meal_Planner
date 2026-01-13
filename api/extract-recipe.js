export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;

    if (!body || !body.base64Data) {
      return res.status(400).json({ error: "Missing base64Data" });
    }

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: body.base64Data
                }
              },
              {
                type: "text",
                text:
                  "Extract the recipe information. Return ONLY valid JSON with this exact structure: {\"servings\":6,\"cuisine\":\"Italian\",\"ingredients\":[{\"amount\":\"3\",\"unit\":\"tablespoons\",\"name\":\"olive oil\"}]}. No markdown. No explanation."
              }
            ]
          }
        ]
      })
    });

   const raw = await claudeResponse.json();

const text =
  raw?.content?.find(c => c.type === "text")?.text || "";

const match = text.match(/\{[\s\S]*\}/);

if (!match) {
  return res.status(422).json({
    error: "Claude did not return JSON",
    rawText: text
  });
}

let parsed;
try {
  parsed = JSON.parse(match[0]);
} catch (err) {
  return res.status(422).json({
    error: "Invalid JSON from Claude",
    rawText: text
  });
}

return res.status(200).json({
  servings: parsed.servings ?? 4,
  cuisine: parsed.cuisine ?? "Other",
  ingredients: Array.isArray(parsed.ingredients)
    ? parsed.ingredients
    : []
});

  }
}