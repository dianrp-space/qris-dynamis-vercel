# QRIS Dynamic Generator - Vercel Ready ✅

Generator QRIS Dinamis fullstack yang siap di-deploy ke Vercel.

## 📁 Struktur Project

```
qris-dynamis-vercell/
├── api/                  # Serverless functions (Vercel)
│   ├── index.js         # Express handler
│   ├── qris-crc.js      # CRC calculator
│   └── qris-image.js    # QR decoder
├── images/              # Static assets
│   ├── logo_blue.webp
│   └── qris.png
├── index.html           # Frontend utama
├── style.css            # Styling
├── script.js            # Frontend logic
├── api-documentation.html
├── vercel.json          # Konfigurasi Vercel
├── package.json         # Dependencies
└── README.md
```

## 🚀 Deploy ke Vercel

### Cara 1: Via Vercel Dashboard (Paling Mudah)

1. Push project ini ke GitHub
2. Buka [vercel.com/new](https://vercel.com/new)
3. Import repository GitHub Anda
4. Klik **Deploy** (tidak perlu setting tambahan)
5. Selesai! ✅

### Cara 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy ke production
vercel --prod
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Jalankan server (akan jalan di port 3001)
npm start

# Buka browser
# Frontend: buka index.html langsung
# API: http://localhost:3001/api/health
```

## 📡 API Endpoints

Base URL production: `https://your-app.vercel.app`
Base URL local: `http://localhost:3001`

### 1. Health Check
```bash
GET /api/health
```

### 2. Generate QRIS Dinamis
```bash
POST /api/generate
Content-Type: application/json

{
  "staticQris": "00020101021126610014COM...",
  "amount": 1000
}
```

### 3. Parse QRIS dari Gambar (Upload)
```bash
POST /api/parse-image
Content-Type: multipart/form-data

file: [gambar QRIS]
```

### 4. Parse QRIS dari URL Gambar
```bash
POST /api/parse-image-url
Content-Type: application/json

{
  "imageUrl": "https://example.com/qr_image.jpg"
}
```

## ⚙️ Environment Variables (Opsional)

Tidak ada env yang wajib. Tapi jika ingin setting:

| Variable | Default | Keterangan |
|----------|---------|------------|
| `PORT` | 3001 | Port local development |
| `NODE_ENV` | development | development/production |

Setting di Vercel Dashboard: **Settings → Environment Variables**

## 🔧 Konfigurasi Vercel (`vercel.json`)

- **Build Command**: Otomatis (tidak perlu)
- **Output Directory**: `/` (root)
- **API Routes**: `/api/*` → `api/index.js`
- **Static Files**: HTML, CSS, JS, images di root
- **Max Duration**: 30 detik per request
- **Memory**: 1024 MB

## ⚠️ Limit Vercel (Free Tier)

- **Function Duration**: 10 detik (Hobby) / 60 detik (Pro)
- **Payload Size**: 4.5 MB per request
- **Memory**: 1024 MB
- **File upload max**: 4 MB (sudah di-set di multer)

## 🌐 Cara Kerja

1. **Frontend** (HTML/CSS/JS) di-serve langsung dari root
2. **API** di-handle oleh `api/index.js` sebagai serverless function
3. **Routing**: 
   - `/*` → static files (index.html, style.css, dll)
   - `/api/*` → Express handler
4. **CORS** sudah di-enable, bisa diakses dari domain manapun

## 📝 Testing

Setelah deploy, test dengan:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Generate QRIS
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"staticQris":"00020101021126610014COM.GO-PAY","amount":1000}'
```

## 📄 License

Feel free to use. © 2026 DRP Network Solutions
