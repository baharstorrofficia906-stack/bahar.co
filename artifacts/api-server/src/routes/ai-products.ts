import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const CATEGORIES = [
  "Dates", "Coffee", "Perfumes", "Incense", "Gifts",
  "Electrical Devices", "Shoes", "Bags", "Abayas", "Ecoway",
];

router.post("/admin/ai/generate-product", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || typeof description !== "string" || description.trim().length < 3) {
      return res.status(400).json({ error: "A description is required" });
    }

    const systemPrompt = `You are a product data assistant for "Bahar", a luxury Saudi Arabian products e-commerce store selling to Egypt.
Your job is to extract structured product information from a description provided by the admin.

Available categories: ${CATEGORIES.join(", ")}

Return ONLY a valid JSON object with these fields:
- name (string): English product name, concise and elegant (max 60 chars)
- nameAr (string): Arabic product name, accurate translation (max 60 chars)
- category (string): must be one of the available categories exactly
- price (number): price in EGP (Egyptian Pound), integer
- originalPrice (number | null): original price if there's a discount, otherwise null
- stock (number): reasonable stock quantity, default 20 if not mentioned
- description (string): rich English product description, 2-4 sentences highlighting luxury/quality
- featured (boolean): true only if it's a flagship or premium product

Do not include any explanation or markdown — only the JSON object.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: description.trim() },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "";

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        return res.status(500).json({ error: "AI returned invalid JSON", raw });
      }
      parsed = JSON.parse(match[0]);
    }

    if (!CATEGORIES.includes(parsed.category as string)) {
      parsed.category = "Gifts";
    }

    res.json({ product: parsed });
  } catch (err) {
    req.log.error({ err }, "AI product generation failed");
    res.status(500).json({ error: "AI generation failed. Please try again." });
  }
});

export default router;
