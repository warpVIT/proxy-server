const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5001;

// Разрешаем CORS для всех доменов (или укажи конкретные)
app.use(cors());

// Позволяет парсить JSON в теле запроса
app.use(express.json());

app.post("/claude", async (req, res) => {
  try {
    const { apiKey, payload } = req.body;

    if (!apiKey || !payload) {
      return res.status(400).json({ error: "Missing apiKey or payload." });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: result.error || "Failed to fetch from Anthropic API.",
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error in /claude:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Claude proxy listening on http://localhost:${PORT}`);
});
