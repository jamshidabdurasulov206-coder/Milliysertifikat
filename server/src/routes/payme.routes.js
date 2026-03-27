const express = require("express");
const router = express.Router();
const paymeController = require("../controllers/payme.controller");

// Payme faqat POST so'rovi yuboradi
router.post("/callback", paymeController.paymeCallback);

module.exports = router;