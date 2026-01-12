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

    const data = await claudeResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      message: error.message
    });
  }
}