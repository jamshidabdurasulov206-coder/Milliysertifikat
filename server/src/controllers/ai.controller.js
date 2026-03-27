const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Kalitni tekshirish
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

exports.parseTest = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: "Tahlil qilish uchun matn yetarli emas" });
    }

    // Modelni tanlash (gemini-1.5-flash tavsiya etiladi, u uzun matnlar uchun tezroq)
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });
    
    console.log('AI ishga tushdi, model:', modelName);

    // --- CHUNKING QISMI (YUTUQ SHU YERDA) ---
    // Matnni 7000 belgidan bo'laklarga bo'lamiz
    const chunks = text.match(/[\s\S]{1,7000}/g) || [];
    let allQuestions = [];

    console.log(`Jami ${chunks.length} ta bo'lakka bo'lindi. Ishlov berilmoqda...`);

    for (const [index, chunk] of chunks.entries()) {
      console.log(`${index + 1}-bo'lak yuborilmoqda...`);
      
      const prompt = `
        Vazifa: Berilgan Tarix faniga oid matndan barcha savollarni (test va ochiq turdagi) ajratib ol.
        
        Savol turlari:
        1. "MULTIPLE_CHOICE": 4 ta variantli oddiy testlar.
        2. "OPEN_ENDED": Talaba o'zi matn yoki sana yozadigan savollar (variantlarsiz).

        Qoidalar:
        - "question_text": Savolning to'liq matni.
        - "options": Test bo'lsa 4 ta variant, ochiq savol bo'lsa [].
        - "correct_option": Test bo'lsa to'g'ri indeks (0-3), ochiq savolda null.
        - "correct_answer_text": Ochiq savol uchun to'g'ri javob matni.
        - "difficulty_level": 0.1 dan 3.0 gacha (Rasch modeli).

        Javob FAQAT JSON formatida bo'lsin:
        {
          "questions": [
            {
              "type": "MULTIPLE_CHOICE",
              "question_text": "...",
              "options": ["...", "...", "...", "..."],
              "correct_option": 0,
              "correct_answer_text": null,
              "difficulty_level": 1.2
            }
          ]
        }

        DIQQAT: Matndagi birorta savolni o'tkazib yuborma!
        Matn bo'lagi:
        ${chunk}`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let aiText = response.text().trim();

        // JSONni tozalash
        aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const parsedChunk = JSON.parse(jsonMatch[0]);
          if (parsedChunk.questions && Array.isArray(parsedChunk.questions)) {
            allQuestions.push(...parsedChunk.questions);
          }
        }
        
        // Gemini limitiga tushmaslik uchun ozgina (0.5 sek) kutish
        if (chunks.length > 1) await new Promise(r => setTimeout(r, 500));

      } catch (err) {
        console.error(`${index + 1}-bo'lakda xato:`, err.message);
      }
    }

    // Yakuniy natijani qaytarish
    res.json({ 
      success: true, 
      questions: allQuestions,
      count: allQuestions.length 
    });

  } catch (error) {
    console.error("AI Controller xatosi:", error.message);
    res.status(500).json({ 
      error: "AI tahlilida xatolik yuz berdi",
      details: error.message
    });
  }
};