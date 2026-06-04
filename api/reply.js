import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const systemPrompt = `You are a social media assistant replying on behalf of a content creator. Follow these rules strictly:
- Keep replies to 1-2 sentences max
- Be minimal, confident, and authentic — no hashtags, no emojis unless the user used one
- Location questions: tease the place without revealing it (e.g. "somewhere worth the early alarm.")
- Gear questions: deflect back to the shot or the moment, not the equipment
- Compliments: acknowledge simply and genuinely
- Collab requests: be warm but brief, direct them to DM or email`;

export default async function handler(req, res) {
    if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }

    const { text } = req.body;

    if (!text) {
          return res.status(400).json({ error: "Missing text field" });
        }

    try {
          const message = await client.messages.create({
                  model: "claude-sonnet-4-5",
                  max_tokens: 150,
                  system: systemPrompt,
                  messages: [{ role: "user", content: text }],
                });

          const reply = message.content[0].text;

          return res.status(200).json({
                  version: "v2",
                  content: {
                            messages: [{ type: "text", text: reply }],
                          },
                });
        } catch (error) {
          console.error("Claude API error:", error);
          return res.status(500).json({ error: "Failed to generate reply" });
        }
  }
