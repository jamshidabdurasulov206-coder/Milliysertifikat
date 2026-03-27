const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// API kalit mavjudligini tekshirish
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ XATO: .env faylida GEMINI_API_KEY topilmadi!");
}

// 404 xatosini oldini olish uchun API versiyasini aniq ko'rsatamiz (ixtiyoriy, lekin tavsiya etiladi)
const genAI = new GoogleGenerativeAI(apiKey);

router.post("/parse-test", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 10) {
    return res.status(400).json({ error: "Tahlil qilish uchun matn yetarli emas" });
  }

  try {
    // MUHIM: Model xatoliklari uchun zaxira operatorlar
    const modelCandidates = [
      process.env.GEMINI_MODEL,
      "gemini-3.1-flash-lite-preview"
    ].filter(Boolean);

    let model;
    let lastModelError;
    for (const candidate of modelCandidates) {
      try {
        console.log(`Using Gemini model candidate: ${candidate}`);
        model = genAI.getGenerativeModel({ model: candidate });
        break;
      } catch (err) {
        lastModelError = err;
        console.warn(`model ${candidate} not available:`, err.message);
        if (!err.message.includes("404")) {
          throw err;
        }
      }
    }

    if (!model) {
      const err = lastModelError || new Error("No valid model candidates");
      throw new Error(`AI model tanlanmadi: ${err.message}`);
    }
    const prompt = `
      Vazifa: Berilgan matndan barcha test savollarini ajratib ol va FAQAT JSON formatida qaytar.
      
      Javob struktura qoidasi:
      {
        "questions": [
          {
            "question_text": "Savol matni",
            "options": ["A variant", "B variant", "C variant", "D variant"],
            "correct_option": 0,
            "difficulty_level": 1.5
          }
        ]
      }
      
      Qoidalar:
      - "correct_option" to'g'ri javobning indeksi (0, 1, 2 yoki 3).
      - "difficulty_level" 0.1 dan 3.0 gacha son.
      - Hech qanday kirish so'zi yoki tushuntirish yozma, faqat toza JSON qaytar.

      Matn:
      ${text}
    `;

    // AI so'rovi (generateContent 404 model queryidan qaytishi mumkin)
    let result;
    let lastError;
    for (const candidate of modelCandidates) {
      try {
        const modelInstance = genAI.getGenerativeModel({ model: candidate });
        result = await modelInstance.generateContent(prompt);
        console.log(`AI: generateContent muvaffaqiyatli ${candidate} modelda`);
        break;
      } catch (err) {
        lastError = err;
        console.warn(`AI: ${candidate} modelda generateContent xato:`, err.message);
        if (!err.message.includes("404")) {
          throw err;
        }
      }
    }

    if (!result) {
      throw new Error(`Hech qanday model generateContent bajarilmadi: ${lastError?.message || "Noma'lum"}`);
    }

    const response = await result.response;
    let aiText = response.text().trim();

    // 1. Markdown belgilarini tozalash
    aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

    // 2. FAQAT JSON qismini qidirib topish (Regex orqali)
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI tahlilida haqiqiy JSON ma'lumoti topilmadi");
    }
    aiText = jsonMatch[0];

    const parsedData = JSON.parse(aiText);

    // 3. Formatni frontend uchun standartlashtirish
    let finalQuestions = [];
    if (parsedData.questions && Array.isArray(parsedData.questions)) {
      finalQuestions = parsedData.questions;
    } else if (Array.isArray(parsedData)) {
      finalQuestions = parsedData;
    } else {
      finalQuestions = [parsedData];
    }

    res.json({ 
      success: true, 
      questions: finalQuestions,
      count: finalQuestions.length 
    });

  } catch (error) {
    console.error("AI Router Xatosi:", error.message);
    
    // 404 yoki boshqa tarmoq xatolarini aniqlash
    const statusCode = error.message.includes("404") ? 404 : 500;
    
    res.status(statusCode).json({ 
      error: "AI tahlilida xatolik",
      details: error.message 
    });
  }
});

module.exports = router;