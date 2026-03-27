const pool = require("../config/db");

exports.createSubject = async (name) => {
  const res = await pool.query(
    "INSERT INTO subjects (name) VALUES ($1) RETURNING *",
    [name]
  );
  return res.rows[0];
};

exports.getSubjects = async () => {
  const res = await pool.query("SELECT * FROM subjects ORDER BY id DESC");
  return res.rows;
};

exports.deleteSubject = async (id) => {
  const res = await pool.query("DELETE FROM subjects WHERE id = $1", [id]);
  return res.rowCount > 0;
};