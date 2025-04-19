import express from "express";
import fetch from "node-fetch";

const app = express();

// Обработка preflight-запроса вручную
app.options("/claude", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://dwjtnq-5173.csb.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  res.sendStatus(200);
});

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === "https://dwjtnq-5173.csb.app") {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  next();
});

app.use(express.json());

app.post("/claude", async (req, res) => {
  const { apiKey, payload } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: "Missing API key" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed to contact Claude." });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Claude proxy listening on port ${PORT}`);
});
