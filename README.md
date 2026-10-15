# 🌟 Memory Vault

Memory Vault is a full-stack personal digital memory journal and timeline application built with React (Vite + Tailwind CSS), Node.js, Express, and MongoDB.

---

## 🚀 Features

- 📸 **Rich Memory Journal**: Save your favorite moments with photos, titles, descriptions, moods, and locations.
- 🏷️ **Tags & Categorization**: Organize memories with custom tags and mood indicators.
- 📅 **Interactive Timeline & On This Day**: Relive memories from this day in previous years.
- ⭐ **Favorites & Search**: Quick filtering, full-text search, and favoriting.
- 🔒 **Secure Authentication**: JWT-based user signup, login, and protected routes.
- ☁️ **Cloudinary Image Storage**: Seamless image management in the cloud.
- ⚡ **Vercel Serverless Ready**: Full Vercel compatibility with seamless serverless API routing.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, Mongoose (MongoDB), Multer, Cloudinary
- **Deployment**: Vercel (Frontend + Serverless Functions via `/api`)

---

## 📦 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bilal-2004-hub/memory-vault.git
   cd memory-vault
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   npm --prefix client install
   npm --prefix server install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `server/.env` and fill in your values:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/memory-vault?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the Development Servers**:
   ```bash
   npm run dev
   ```
   - Client: `http://localhost:5173`
   - Server: `http://localhost:5000`

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com/new), click **Add New > Project** and import `memory-vault`.
3. Set **Framework Preset** to `Vite`.
4. Keep the **Root Directory** as `./`.
5. Add the following **Environment Variables** in Vercel Project Settings:
   - `MONGO_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: A long random secret string
   - `CLOUDINARY_CLOUD_NAME`: (Optional/Recommended) Cloudinary Cloud Name
   - `CLOUDINARY_API_KEY`: (Optional/Recommended) Cloudinary API Key
   - `CLOUDINARY_API_SECRET`: (Optional/Recommended) Cloudinary API Secret
6. Click **Deploy**. Vercel will automatically build the client and host the Express backend as serverless API functions under `/api`.
