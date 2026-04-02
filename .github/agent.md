# 🤖 Milliy Sertifikat — Agent Konteksti

## Loyiha Haqida

**Milliy Sertifikat** — bu O'zbekistondagi fanlar bo'yicha onlayn sertifikatlash platformasi.
Foydalanuvchilar testlarni yechadi, AI va Rasch (IRT) modeli asosida baholanadi, sertifikat oladi.

## Texnologiyalar

- **Frontend**: React 19.2 (CRA), React Router DOM 7, Fetch API, QRCode.react, jsPDF, html2canvas
- **Backend**: Express 5, PostgreSQL (raw SQL via pg), JWT auth, bcrypt
- **AI**: Google Gemini API (`@google/generative-ai`) — test parsing va javob baholash
- **Payment**: Payme callback integration
- **Database**: PostgreSQL — jadvallar: users, subjects, tests, questions, attempts, orders

## Loyiha Tuzilishi

```
Milliysertifikat/
├── frontend/src/         # React SPA
│   ├── api/              # API wrappers (api.js, axios.js, adminApi.js)
│   ├── context/          # AuthContext (localStorage + JWT)
│   └── pages/            # 17+ ta sahifa (JSX)
├── server/src/           # Express backend
│   ├── config/db.js      # PostgreSQL Pool
│   ├── controllers/      # 9 ta controller
│   ├── middlewares/       # auth.middleware.js, isAdmin.middleware.js
│   ├── models/           # 4 ta model (raw SQL)
│   ├── routes/           # 9 ta router
│   └── services/         # 7 ta service
├── docs/                 # Hujjatlar
│   ├── architecture.md   # Arxitektura
│   ├── frontend.md       # Frontend hujjati
│   ├── backend.md        # Backend hujjati
│   └── tasks.md          # Vazifalar va rejalar
└── .github/agent.md      # Shu fayl
```

## Kod Yozish Qoidalari

### Umumiy
- Til: JavaScript (ES6+), JSX
- Import uslubi: CommonJS (backend), ES Modules (frontend)
- Formatlashtirish: 2 bo'sh joy indent
- Izohlar: O'zbek tilida (ba'zan ingliz)

### Backend
- Controller → Service → Model arxitekturasi
- SQL query'lar: parametrized (`$1, $2...`), ORM yo'q
- Middleware zanjiri: `auth → isAdmin → controller`
- Xatolik javoblari: `{ message: "...", error: "..." }`
- Status kodlar: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

### Frontend  
- Funktsional komponentlar (hooks bilan)
- State: useState, useEffect, useContext
- Routing: React Router v7 (`<Routes>`, `<Route>`)
- API chaqiruv: `fetch()` + custom wrappers
- Auth: `localStorage` → `token`, `user`, `userId`

## Muhim Kontekst

### Rasch Modeli (Asosiy Hisoblash)
```
θ = ln(P/(1-P))         // logit
Z = (θ - μ) / σ         // z-score
T = 50 + 10Z            // t-score
Standard_ball = round((finalScore × maxBall) / 65)

Level darajalari:
T ≥ 70 → A+, T ≥ 65 → A, T ≥ 60 → B+
T ≥ 55 → B, T ≥ 50 → C+, T ≥ 46 → C, T < 46 → D
```

### Natija Oqimi
```
Attempt yaratish → AI baholash → is_reviewed=true
→ Admin tasdiqlash → is_published=true → Foydalanuvchi ko'radi
```

### AI Ishlatish Joylari
1. **Test Parsing**: Matn/PDF → JSON savollar (`/api/ai/parse-test`)
2. **Javob Baholash**: Ochiq javoblar → 0/0.5/1 ball (`evaluationService.js`)

## Agent Uchun Qoidalar

1. **Yangi endpoint** qo'shsangiz: route → controller → service → model ketma-ketligida yozing
2. **SQL query** lar doim parametrized bo'lsin (`$1, $2...`)
3. **Auth kerak bo'lgan** endpointga `auth` middleware qo'shing
4. **Admin endpointga** `auth + isAdmin` middleware zanjiri qo'shing
5. **Rasch formulalarni** qo'shimcha joylarga nusxalamang — `utils/rasch.js` yarating
6. **Frontend API** funksiyalarini `src/api/api.js`-ga qo'shing
7. **Yangi sahifa** qo'shsangiz, `App.js`-da route qo'shing va himoya kerak bo'lsa `ProtectedRoute` ishlating
8. **Database o'zgarishi** uchun `server/migrations/` papkaga SQL migratsiya qo'shing
9. **Hujjatlarni** yangilang: `docs/` papkadagi tegishli faylni yangilang
10. **Secret/API kalitlarni** hardcode qilmang — `.env` fayl ishlating

## Ma'lum Muammolar

- `attempt.controller.js` juda katta (582 satr) — refaktoring kerak
- Rasch formulasi 4+ joyda takrorlangan
- `ai.routes.js` ichida controller logikasi bor
- Admin sahifalari frontend-da himoyalanmagan
- `BASE_URL` hardcoded
- Input validation yetarli emas
- Test coverage 0% — testlar yozilmagan

## Foydali Buyruqlar

```bash
# Backend
cd server && npm run dev         # Development (nodemon)
cd server && npm start           # Production

# Frontend
cd frontend && npm start         # Development (port 3000)
cd frontend && npm run build     # Production build

# Database
psql -U test_app -d test_app     # PostgreSQL-ga ulanish
```
