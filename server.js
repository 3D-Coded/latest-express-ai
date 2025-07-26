import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Readable } from "stream";

dotenv.config();

import { run } from "@openai/agents";
import { additiveExpert } from "./agents/additiveExpert.js";

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));
app.use(express.json());

app.post("/aistream", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).send("Invalid messages");
  }

  try {
    const conversationText = messages
      .map((msg) => {
        const speaker = msg.role === "user" ? "User" : "Assistant";
        return `${speaker}: ${msg.content}`;
      })
      .join("\n");

    const fullPrompt = `${conversationText}\nAssistant:`;

    const result = await run(additiveExpert, fullPrompt, { stream: true });
    const stream = result.toTextStream(); // Web stream

    const nodeStream = Readable.fromWeb(stream); // Convert to Node.js stream

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    nodeStream.pipe(res); // Stream directly to response
  } catch (err) {
    console.error("Streaming error:", err);
    res.status(500).send("Agent error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
