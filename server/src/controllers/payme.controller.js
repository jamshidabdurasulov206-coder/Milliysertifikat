const pool = require("../config/db");

exports.paymeCallback = async (req, res) => {
  const { method, params, id } = req.body;

  try {
    switch (method) {
      case "CheckPerformTransaction":
        const testId = params.account.test_id;
        const amount = params.amount;

        const testRes = await pool.query("SELECT price FROM tests WHERE id = $1", [testId]);
        if (testRes.rows.length === 0) {
          return res.json({ error: { code: -31050, message: "Test topilmadi" }, id });
        }

        // 50000 so'm -> 5000000 tiyin
        const dbPriceInTiyin = parseInt(testRes.rows[0].price) * 100;
        if (dbPriceInTiyin !== amount) {
          return res.json({ error: { code: -31001, message: "Noto'g'ri summa" }, id });
        }

        return res.json({ result: { allow: true }, id });

      case "CreateTransaction":
        const { id: paymeTrId, time, account } = params;
        
        // Bu tranzaksiya allaqachon bormi?
        const checkTr = await pool.query("SELECT * FROM orders WHERE transaction_id = $1", [paymeTrId]);
        if (checkTr.rows.length > 0) {
          return res.json({ 
            result: { 
              create_time: Number(checkTr.rows[0].payme_time), 
              transaction: paymeTrId, 
              state: 1 
            }, id 
          });
        }

        // Yangi orderni tranzaksiyaga bog'lash
        // (Eslatma: user_id ni avvalroq yaratilgan orderdan olish kerak yoki account'da yuborish kerak)
        const updateOrder = await pool.query(
          "UPDATE orders SET transaction_id = $1, payme_time = $2, state = 1 WHERE test_id = $3 AND state = 0 RETURNING *",
          [paymeTrId, time, account.test_id]
        );

        if (updateOrder.rows.length === 0) {
          return res.json({ error: { code: -31050, message: "Aktiv buyurtma topilmadi" }, id });
        }

        return res.json({ result: { create_time: time, transaction: paymeTrId, state: 1 }, id });

      case "PerformTransaction":
        const result = await pool.query(
          "UPDATE orders SET state = 2 WHERE transaction_id = $1 AND state = 1 RETURNING *",
          [params.id]
        );

        if (result.rows.length > 0) {
          return res.json({ result: { transaction: params.id, perform_time: Date.now(), state: 2 }, id });
        }
        return res.json({ error: { code: -31008, message: "Xatolik" }, id });

      case "CancelTransaction":
        await pool.query(
          "UPDATE orders SET state = -1, cancel_time = $1, reason = $2 WHERE transaction_id = $3",
          [Date.now(), params.reason, params.id]
        );
        return res.json({ result: { transaction: params.id, cancel_time: Date.now(), state: -1 }, id });

      default:
        return res.json({ error: { code: -32601, message: "Metod topilmadi" }, id });
    }
  } catch (err) {
    console.error("Payme Error:", err.message);
    res.json({ error: { code: -32400, message: "Server xatosi" }, id });
  }
};