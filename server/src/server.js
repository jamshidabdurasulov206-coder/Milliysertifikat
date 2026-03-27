require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda muvaffaqiyatli ishga tushdi`);
});

// Server kutilmaganda o'chib qolmasligi uchun
process.on('unhandledRejection', (err) => {
  console.log("Unhandled Rejection! O'chirilmoqda..."); // Bu yerda "" qo'shtirnoq ishlatildi
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});