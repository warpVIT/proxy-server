const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5001;

// Разрешаем только нужный origin
const allowedOrigin = "https://dwjtnq-5173.csb.app";

// Настраиваем CORS заголовки вручную (чтобы всё контролировать)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  next();
});

// Обрабатываем preflight запрос (ключ для CORS)
app.options("/claude", (req, res) => {
  res.sendStatus(200); // preflight must return 200 OK
});

// Парсим JSON после заголовков
app.use(express.json());

// Главный proxy маршрут
app.post("/claude", async (req, res) => {
  const { apiKey, payload } = req.body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Anthropic API returned an error",
        status: response.status,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal proxy error" });
  }
});

app.listen(PORT, () => {
  console.log(`Claude proxy listening on http://localhost:${PORT}`);
});
