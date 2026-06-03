import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import OpenAI from 'openai';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;
const UPLOAD_DIR = 'uploads';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
const upload = multer({ dest: UPLOAD_DIR });

app.use(cors());
app.use(express.json());

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. Meal analysis requests will fail.');
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/analyze-meal', upload.single('image'), async (req, res) => {
  let imagePath = null;

  try {
    const description = req.body.description || '';
    imagePath = req.file?.path;

    if (!imagePath) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });

    const response = await client.responses.create({
      model: 'gpt-5.4',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Analyze this meal image and optional description.

            Return only valid JSON with this exact shape:
            {
              "meal_name": "string",
              "items": [
                {
                  "name": "string",
                  "estimated_quantity": "string",
                  "calories_min": number,
                  "calories_max": number,
                  "protein_min": number,
                  "protein_max": number,
                  "carbs_min": number,
                  "carbs_max": number,
                  "fat_min": number,
                  "fat_max": number,
                  "confidence": number
                }
              ],
              "totals": {
                "calories_min": number,
                "calories_max": number,
                "protein_min": number,
                "protein_max": number,
                "carbs_min": number,
                "carbs_max": number,
                "fat_min": number,
                "fat_max": number
              },
              "notes": ["string"]
            }

            Use realistic ranges, not exact precision.
            If the meal is unclear, widen the range.
            If oils, sauces, or hidden ingredients are possible, mention that in notes.
            Be conservative and honest.
            Always fill in the totals object with the sum of all item ranges.
            Do not leave totals empty or zero unless the food truly cannot be estimated.
            User description: ${description}`,
            },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${imageBase64}`,
            },
          ],
        },
      ],
    });

    const text = response.output_text;
    const parsed = JSON.parse(text);

    const items = Array.isArray(parsed.items) ? parsed.items : [];

    const computedTotals = items.reduce(
      (acc, item) => {
        acc.calories_min += Number(item.calories_min ?? 0);
        acc.calories_max += Number(item.calories_max ?? 0);
        acc.protein_min += Number(item.protein_min ?? 0);
        acc.protein_max += Number(item.protein_max ?? 0);
        acc.carbs_min += Number(item.carbs_min ?? 0);
        acc.carbs_max += Number(item.carbs_max ?? 0);
        acc.fat_min += Number(item.fat_min ?? 0);
        acc.fat_max += Number(item.fat_max ?? 0);
        return acc;
      },
      {
        calories_min: 0,
        calories_max: 0,
        protein_min: 0,
        protein_max: 0,
        carbs_min: 0,
        carbs_max: 0,
        fat_min: 0,
        fat_max: 0,
      }
    );

    parsed.totals = {
      calories_min: Number(parsed.totals?.calories_min ?? computedTotals.calories_min),
      calories_max: Number(parsed.totals?.calories_max ?? computedTotals.calories_max),
      protein_min: Number(parsed.totals?.protein_min ?? computedTotals.protein_min),
      protein_max: Number(parsed.totals?.protein_max ?? computedTotals.protein_max),
      carbs_min: Number(parsed.totals?.carbs_min ?? computedTotals.carbs_min),
      carbs_max: Number(parsed.totals?.carbs_max ?? computedTotals.carbs_max),
      fat_min: Number(parsed.totals?.fat_min ?? computedTotals.fat_min),
      fat_max: Number(parsed.totals?.fat_max ?? computedTotals.fat_max),
    };

    console.log(JSON.stringify(parsed, null, 2));

    res.json(parsed);
  } catch (error) {
    console.error('Meal analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze meal',
      details: error?.message || 'Unknown error',
    });
  } finally {
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
