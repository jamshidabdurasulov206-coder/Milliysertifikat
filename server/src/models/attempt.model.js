const pool = require("../config/db");

exports.createAttempt = async (test_id, user_name, answers, score) => {
  const res = await pool.query(
    "INSERT INTO attempts (test_id, user_name, answers, score) VALUES ($1, $2, $3, $4) RETURNING *",
    [test_id, user_name, JSON.stringify(answers), score]
  );
  return res.rows[0];
};

exports.getAttemptsByTest = async (test_id) => {
  const res = await pool.query(
    "SELECT * FROM attempts WHERE test_id=$1 ORDER BY created_at DESC",
    [test_id]
  );
  return res.rows;
};