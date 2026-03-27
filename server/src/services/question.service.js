const pool = require("../config/db");

exports.createQuestion = async (data) => {
  let { test_id, question_text, options, correct_option, difficulty_level } = data;

  // Rasch modeli uchun majburiy maydonlar tekshiruvi
  if (!test_id || !question_text || options == null || correct_option == null) {
    throw new Error("Barcha maydonlar to'ldirilishi shart");
  }

  // test_id butun son bo'lishi tekshiruvi
  const parsedTestId = Number(test_id);
  if (!Number.isInteger(parsedTestId) || parsedTestId <= 0) {
    throw new Error("test_id musbat butun son bo'lishi kerak");
  }
  test_id = parsedTestId;

  // difficulty_level ni raqamga aylantirish
  if (difficulty_level === undefined || difficulty_level === null) {
    difficulty_level = 0.0;
  } else {
    const parsedDifficulty = Number(difficulty_level);
    if (Number.isNaN(parsedDifficulty)) {
      throw new Error("difficulty_level raqam bo'lishi kerak");
    }
    difficulty_level = parsedDifficulty;
  }

  // Options massiv yoki JSON ob'ekt sifatida saqlaymiz
  let finalOptions;
  if (Array.isArray(options) || (options && typeof options === 'object')) {
    finalOptions = JSON.stringify(options);
  } else if (typeof options === 'string') {
    try {
      JSON.parse(options); // tekshirish
      finalOptions = options;
    } catch (err) {
      throw new Error("options to'g'ri JSON bo'lishi kerak");
    }
  } else {
    throw new Error("options massiv yoki JSON ob'ekt bo'lishi kerak");
  }

  // test_id jadvalda mavjudligini tekshirish (FK xatosini tushunarli qilish uchun)
  const testExists = await pool.query("SELECT id FROM tests WHERE id = $1", [test_id]);
  if (testExists.rowCount === 0) {
    throw new Error("Berilgan test_id uchun test topilmadi");
  }

  const result = await pool.query(
    `INSERT INTO questions (test_id, question_text, options, correct_option, difficulty_level) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [test_id, question_text, finalOptions, correct_option, difficulty_level]
  );

  return result.rows[0];
};

exports.getQuestionsByTest = async (test_id) => {
  const result = await pool.query(
    "SELECT * FROM questions WHERE test_id = $1 ORDER BY id ASC",
    [parseInt(test_id)]
  );
  
  return result.rows;
};