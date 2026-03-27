const express = require("express");
const cors = require("cors");
const app = express();

// 1. Middlewares
app.use(cors());
app.use(express.json());

// 2. Oddiy tekshiruv yo'lagi
app.get("/", (req, res) => {
  res.json({ message: "Milliy Sertifikat API is running..." });
});

// 3. Routerlarni ulash
try {
  app.use("/subjects", require("./routes/subject.routes"));
  app.use("/tests", require("./routes/test.routes"));
  app.use("/questions", require("./routes/question.routes"));
  app.use("/attempts", require("./routes/attempt.routes"));
  app.use("/auth", require("./routes/auth.routes"));
  app.use("/api/ai", require("./routes/ai.routes"));
  app.use("/api/admin", require("./routes/admin.routes"));
  
  // PAYME INTEGRATSIYASI
  app.use("/api/payme", require("./routes/payme.routes")); 
  
  console.log("✅ Barcha routerlar muvaffaqiyatli yuklandi");
} catch (error) {
  console.error("❌ Routerlarni yuklashda xato:", error.message);
}

// 4. Xatoliklarni ushlab qolish middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server ichki xatosi!" });
});

module.exports = app;