const testService = require("../services/test.service");
const questionService = require("../services/question.service"); // Savollar service-ini ham chaqiramiz

exports.createTest = async (req, res) => {
  try {
    const { title, description, subject_id, questions } = req.body;

    // 1. Avval TESTni yaratamiz (title, description, subject_id)
    const newTest = await testService.createTest({ title, description, subject_id });

    // 2. Agar savollar yuborilgan bo'lsa, ularni yangi test_id bilan birma-bir saqlaymiz
    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        // Har bir savolni bazaga yuborish
        await questionService.createQuestion({
          test_id: newTest.id, // Yangi yaratilgan testning ID-si
          question_text: q.question_text,
          options: q.options,
          correct_option: q.correct_option
        });
      }
    }

    // Hammasi tayyor bo'lgach javob qaytaramiz
    res.status(201).json({ 
      message: "Test va savollar muvaffaqiyatli saqlandi", 
      test: newTest 
    });
    
  } catch (err) {
    console.error("Test yaratishda xato:", err);
    res.status(400).json({ message: err.message });
  }
};

// Qolgan getTests va deleteTest funksiyalari o'zgarishsiz qoladi
exports.getTests = async (req, res) => {
  try {
    const tests = await testService.getTests();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    await testService.deleteTest(req.params.id);
    res.json({ message: "Test o'chirildi" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};