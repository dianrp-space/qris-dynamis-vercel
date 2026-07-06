import express from "express";
import bodyParser from "body-parser";
import QRCode from "qrcode";
import cors from "cors";
import multer from "multer";
import { decodeQRFromImage } from "./qris-image.js";
import { calculateCRC } from "./qris-crc.js";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "4mb" }));
app.use(bodyParser.urlencoded({ limit: "4mb", extended: true }));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB max (Vercel limit)
});

// Helper: parse static QRIS, inject nominal, return dynamic QRIS (dengan CRC)
function generateDynamicQRIS(staticQris, amount) {
  let qris = staticQris;
  if (qris.startsWith("000201")) {
    qris = qris.slice(0, 6) + "010212" + qris.slice(12);
  } else {
    qris = qris.replace(/01(02)11/, "010212");
  }
  qris = qris.replace(/6304[0-9A-Fa-f]{4}$/, "");

  function parseTags(str) {
    let tags = [];
    let i = 0;
    while (i < str.length) {
      let tag = str.substr(i, 2);
      let len = parseInt(str.substr(i + 2, 2), 10);
      let val = str.substr(i + 4, len);
      tags.push({ tag, len, val });
      i += 4 + len;
    }
    return tags;
  }

  let tags = parseTags(qris);
  tags = tags.filter((t) => t.tag !== "54");

  let nominal = String(Number(amount));
  let nominalTag = { tag: "54", len: nominal.length, val: nominal };
  let idx53 = tags.findIndex((t) => t.tag === "53");
  if (idx53 !== -1) {
    tags.splice(idx53 + 1, 0, nominalTag);
  } else {
    let idx52 = tags.findIndex((t) => t.tag === "52");
    if (idx52 !== -1) {
      tags.splice(idx52 + 1, 0, nominalTag);
    } else {
      tags.push(nominalTag);
    }
  }

  let qrisWithAmount =
    tags
      .map((t) => t.tag + t.len.toString().padStart(2, "0") + t.val)
      .join("") + "6304";

  let crc = calculateCRC(qrisWithAmount);
  let dynamic = qrisWithAmount + crc;
  return dynamic;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Generate dynamic QRIS
app.post("/api/generate", async (req, res) => {
  const { staticQris, amount } = req.body;
  if (!staticQris || !amount)
    return res.status(400).json({ error: "Missing data" });
  try {
    const dynamicQris = generateDynamicQRIS(staticQris, amount);
    const qrImage = await QRCode.toDataURL(dynamicQris);
    res.json({ dynamicQris, qrImage });
  } catch (e) {
    console.error("Error generating QRIS:", e);
    res.status(500).json({ error: "Failed to generate QRIS" });
  }
});

// Parse QR from uploaded image
app.post("/api/parse-image", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const qris = await decodeQRFromImage(req.file.buffer);
    res.json({ qris });
  } catch (e) {
    console.error("Error decoding QR:", e);
    res.status(500).json({ error: "Failed to decode QR" });
  }
});

// Parse QR from image URL
app.post("/api/parse-image-url", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "Missing imageUrl" });
  try {
    const response = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!response.ok) throw new Error("Failed to fetch image from URL");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const qris = await decodeQRFromImage(buffer);
    res.json({ qris });
  } catch (e) {
    console.error("Error decoding QR from URL:", e);
    res.status(500).json({ error: "Failed to decode QR from URL" });
  }
});

// ✅ Export untuk Vercel Serverless Function
export default app;

// ✅ Jalankan server jika dijalankan langsung (lokal dev)
if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`QRIS backend running on port ${PORT}`));
}
