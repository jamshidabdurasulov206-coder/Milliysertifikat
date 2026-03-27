const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Kalitni tekshirish (fail-safe)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

exports.parseTest = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: "Tahlil qilish uchun matn yetarli emas" });
    }


    // Dinamik model tanlash: listModels orqali generateContent ni qo'llab-quvvatlaydigan birinchi modelni tanlash
    let modelName = process.env.GEMINI_MODEL;
    if (!modelName) {
      try {
        if (typeof genAI.listModels === 'function') {
          const modelsResp = await genAI.listModels();
          const models = modelsResp.models || modelsResp;
          // Faqat generateContent ni qo'llab-quvvatlaydigan modelni tanlash
          const found = models.find(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'));
          if (found && found.name) {
            modelName = found.name;
            console.log('Auto-selected Gemini model:', modelName);
          } else {
            throw new Error('Hech bir model generateContent ni qo‘llab-quvvatlamaydi');
          }
        } else {
          throw new Error('genAI.listModels funksiyasi mavjud emas. SDK versiyasini tekshiring.');
        }
      } catch (err) {
        console.error('Model ro‘yxatini olishda xato:', err.message);
        return res.status(500).json({ error: 'Model ro‘yxatini olishda xato', details: err.message });
      }
    }
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log('AI: ishlatiladigan model:', modelName);

    const prompt = `
      Vazifa: Berilgan Tarix faniga oid matndan barcha savollarni (test va ochiq turdagi) ajratib ol.
      
      Savol turlari:
      1. "MULTIPLE_CHOICE": 4 ta variantli oddiy testlar.
      2. "OPEN_ENDED": Talaba o'zi matn yoki sana yozadigan savollar (variantlarsiz).

      Qoidalar:
      - "question_text": Savolning to'liq matni.
      - "options": Agar test bo'lsa 4 ta variant, agar ochiq savol bo'lsa bo'sh massiv [].
      - "correct_option": Test bo'lsa to'g'ri indeks (0-3), ochiq savol bo'lsa null.
      - "correct_answer_text": Ochiq savol uchun kutilayotgan to'g'ri javob matni yoki sana.
      - "difficulty_level": 0.1 dan 3.0 gacha (Rasch modeli).

      Javob FAQAT JSON formatida bo'lsin:
      {
        "questions": [
          {
            "type": "MULTIPLE_CHOICE",
            "question_text": "Amir Temur qachon tug'ilgan?",
            "options": ["1336", "1342", "1330", "1338"],
            "correct_option": 0,
            "correct_answer_text": null,
            "difficulty_level": 1.0
          },
          {
            "type": "OPEN_ENDED",
            "question_text": "Xiva xonligida yer egaligining qaysi turi davlatga tegishli bo'lgan?",
            "options": [],
            "correct_option": null,
            "correct_answer_text": "Miri",
            "difficulty_level": 2.5
          }
        ]
      }

      MUHIM: Matndagi BARCHA savollarni o'tkazib yubormasdan qayta ishla!
      Matn: ${text}`;


    // AI dan javob olish
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (err) {
      console.error('AI generateContent xatosi:', err.message);
      return res.status(500).json({ error: 'AI generateContent xatosi', details: err.message });
    }
    const response = await result.response;
    let aiText = response.text().trim();

    // 1. Markdown belgilarini tozalash (```json ... ```)
    aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // 2. FAQAT JSON qismini qidirib topish (Regex orqali xavfsizroq kesish)
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI tahlili natijasida haqiqiy JSON ma'lumoti topilmadi");
    }
    aiText = jsonMatch[0];

    const parsedData = JSON.parse(aiText);

    // 3. Formatni tekshirish va Frontend uchun standartlashtirish
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
    console.error("AI Controller xatosi:", error.message);
    
    // 404 xatosi bo'lsa, foydalanuvchiga aniq ko'rsatish
    const status = error.message.includes("404") ? 404 : 500;
    
    res.status(status).json({ 
      error: "AI tahlilida xatolik yuz berdi",
      details: error.message,
      hint: status === 404 ? "API model nomi yoki kalitni tekshiring" : "Server xatosi"
    });
  }
};