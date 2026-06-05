# আমার ডাক্তার - Amar Dactar

**Amar Daktar** is a comprehensive, full-stack medical consultation and health management platform designed to connect patients with certified doctors effortlessly. It provides a secure, intuitive, and highly functional interface built primarily for the citizens to ensure seamless healthcare delivery.

The platform boasts dual-language support (English and Bangla) across its entirety, ensuring accessibility for a wide range of audiences, particularly emphasizing native Bengali speakers.

---

## 🎯 Website Goals

1. **Accessible Healthcare for All**: Break geographical barriers by connecting patients directly to verified medical professionals via secure real-time messaging, video, and audio capabilities.
2. **AI-Driven Health Insights**: Utilize cutting-edge AI (OpenRouter and Ollama configurations) to give patients initial symptom analysis and medical report decoding in simple terms before they meet the doctor.
3. **Secure Document Management**: Provide a "Health Vault" for patients to securely store, organize, and share their medical history, prescriptions, and test reports with strict consent controls.
4. **Intuitive Administrative & Doctor Tools**: Give doctors and administrators robust tools to manage schedules, track revenue, handle moderation, and verify credentials efficiently.
5. **Highest Standards of Security & Privacy**: Enforce strict access control, document privacy policies, and live-chat moderation to ensure that patients and doctors remain in a safe, judgment-free environment.

---

## ✨ Features Highlight

### 1. **Robust Authentication & Roles**
- **Roles**: Patient, Doctor, and Admin.
- **Verification**: OTP-based authentication, password reset systems, and JWT token revocation for maximum access control.
- **Doctor Onboarding**: Dedicated verification portal where admins manually review real medical credentials before a doctor is public.

### 2. **AI Health Assistant & Medical Report Decoder**
- Conversational AI capable of symptom checking in both English and natural Bengali.
- **Medical Report Uploads**: AI parses complex lab test imagery or PDFs to explain abnormal values to the patient securely.
- **Memory & Safety**: AI retains conversation memory limited safely to the session and integrates a fully-fledged content safety pipeline to filter abusive language.

### 3. **Paid Doctor Consultation (Live Session)**
- Real-time WebSockets integration for synchronous chatting.
- **Timer & Auto-Expiry**: Paid sessions auto-expire with a strict countdown (5-minute and 1-minute visual warnings).
- **History Preservation**: Even upon expiry, chat history securely converts into persistent read-only modes.
- **Doctor Advanced Report**: Doctors hold advanced escalation tools to report abusive patients, instantly suspending violators logic while retaining session history.

### 4. **Health Vault & Smart Consent Management**
- Secure, chronological repository of the patient's medical records.
- Advanced consent tools: Patients decide exactly which file is shared with which doctor. Unrelated doctors hit strict permission walls.

### 5. **Internationalization (i18n)**
- 100% Bilingual Interface (Bangla ↔ English).
- Translates dynamic server side warnings, UI layers, buttons, placeholder text, and AI responses globally utilizing a highly context-aware context strategy.

### 6. **Fully Fledged Dashboards**
- **Admin**: System metrics, user suspension tools, and real-time verification processing.
- **Doctor**: Earnings modules, patient queues, calendar booking configuration, and live chat queues.
- **Patient**: Unified health timeline, appointments view, billing, and profile completions.

---

## 🔐 Security & Moderation

- **Real-time Abuse Filtering**: Integrated AI abuse detector checking all inputs across public forms, support, AI chat, and Doctor Live chats. First warnings provided, subsequent offenses restrict interaction up to days.
- **Financial Protection**: Patients cannot lose session balances. Doctors hold reporting tools that ban abusive patients with penalty models.
- **Role-based Access Control (RBAC)**: All Express API endpoints enforce rigid security levels depending on standard `authenticateToken` and `isAdmin`/`isDoctor` middlewares.
- **Cloud SQL**: Fully structured relational tables handling transactions and session locks avoiding race conditions during real-time appointments.
- **Data Encryptions**: Uploads to protected cloud buckets, stripped of public direct indexing.

---

## 🚀 Installation & Local Development Setup

To run **Amar Daktar** locally on your machine, follow these steps:

### Prerequisites
- Node.js (v18+)
- Postgres Database (Neon / Cloud SQL / Local)
- Vite configuration

### Steps

1. **Clone the Repository**
   ```bash
   git clone <repository_url>
   cd amardaktar
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file at the root. Copy the template from `.env.example`:
   ```env
   # Database
   DATABASE_URL=postgres://...
   
   # JWT
   SESSION_SECRET=your_secret_here
   
   # AI Integration
   AI_PROVIDER=openrouter
   OPENROUTER_API_KEY=your_openrouter_key
   ```
   *(Ensure to define all required API limits and moderation secrets).*

4. **Run the Database Migrations**
   Because Amar Daktar initializes dynamic tables on start via Postgres:
   ```bash
   npm run dev
   ```
   *(The server process `server.ts` will automatically execute `CREATE TABLE IF NOT EXISTS` commands establishing your schema on startup).*

5. **Access the App**
   The Frontend & Backend will concurrently serve via Vite proxy logic.
   Navigate to: `http://localhost:3000`

### Build for Production
```bash
npm run build
npm run start
```
*Note that ESM bundlers and compilation output to `/dist/server.cjs` for streamlined Node serving.*

---

## 👨‍💻 Developer & Maintenance

**Maintained By:** Shawon & Development Team.
*(Email: coding.shawon112@gmail.com)*

**Tech Stack:**
- **Frontend**: React (v18+), Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.js, WebSockets (Socket.io).
- **Database**: PostgreSQL (pg implementation).
- **Types**: Written rigorously in TypeScript.

For contributions or detailed architectural overviews, check the `src/backend` components and the main frontend React structure located inside `src/`.


# Production Deployment Guide

This guide is designed for developers deploying the Amar Daktar platform to production for the first time. It includes all infrastructure, credential, and environmental requirements based on the current codebase.

---

## SECTION 1: REQUIRED SERVICES

The Amar Daktar platform integrates the following external services:

* **PostgreSQL** (e.g., Neon, Cloud SQL, Supabase DB): The core relational database used to store users, appointments, session history, and transactions.
* **Firebase**: Used exclusively for handling OAuth authentication (Google, Facebook, Apple).
* **Supabase**: Provides Edge Functions (used to send secure support emails without exposing secrets on the backend directly). It can also act as the primary PostgreSQL database.
* **OpenRouter / Ollama**: The AI brains behind the symptom checker and medical report parsing. OpenRouter is used for production models, while Ollama is supported for local privacy variants.
* **Resend**: Used inside the Supabase Edge Function to deliver support form submission emails to the admin.
* **Redis** (Optional but recommended): Used via `ioredis` and `rate-limit-redis` for enforcing API rate limiting to prevent abuse.

---

## SECTION 2: REQUIRED ENVIRONMENT VARIABLES

Ensure your deployment environment (Vercel, Railway, Render, etc.) has all the following variables configured correctly. 

| Variable Name | Required/Optional | Purpose | Example Value |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | **Required** | Connects client-side Support forms to Supabase Edge Functions. | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | **Required** | Public API key for Supabase client calls. | `eyJhbGciOiJIUz...` |
| `DATABASE_URL` | **Required** | Full connection string to your PostgreSQL instance. | `postgres://user:pass@host/db` |
| `JWT_SECRET` / `SESSION_SECRET`| **Required** | Cryptographic key to sign auth JWT cookies. | `your_long_random_jwt_secret` |
| `NODE_ENV` | **Required** | Defines the environment. | `production` |
| `VITE_FIREBASE_API_KEY` | **Required** | Firebase setup for OAuth | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | **Required** | Firebase Setup | `app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | **Required** | Firebase Setup | `app` |
| `VITE_FIREBASE_STORAGE_BUCKET` | **Required** | Firebase Setup | `app.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | **Required** | Firebase Setup | `12345` |
| `VITE_FIREBASE_APP_ID` | **Required** | Firebase Setup | `1:123:web:abc` |
| `REDIS_URL` | Optional | Connection string for Redis Rate Limiting. | `rediss://default:pass@host:port` |
| `AI_PROVIDER` | Optional | Which AI inference provider to use. Defaults to `openrouter`. | `openrouter` |
| `OPENROUTER_API_KEY` | **Required** (if OpenRouter) | Authentication for LLM inference. | `sk-or-v1-abcdef...` |
| `AI_MODEL` / `VITE_AI_MODEL` | Optional | Specifies the precise model router ID. | `google/gemini-pro` |
| `OLLAMA_BASE_URL` | Optional | Points to Ollama server for local AI. | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Optional | Target Ollama localized model. | `llama3` |

---

## SECTION 3: REQUIRED API KEYS

You will need to obtain the following keys to authorize interactions:

* **OpenRouter API Key**: Obtain from [OpenRouter.ai](https://openrouter.ai). This allows the application to query premium generative models.
* **Firebase Credentials**: Obtain from [Firebase Console](https://console.firebase.google.com). Configure a new Web App to get your configuration object. Inject these credentials via the `VITE_FIREBASE_*` environment variables in your deployment dashboard!
* **Supabase Keys & Storage**: Obtain from your project dashboard on [Supabase.com](https://supabase.com). You will need the `Project URL` and `anon` key. You **MUST** create a public storage bucket named `medical-reports` in Supabase to accept medical file uploads!
* **Resend API Key**: Obtain from [Resend.com](https://resend.com). This key is strictly injected into Supabase secrets (not your main app `.env`) to process emails securely.

---

## SECTION 4: REQUIRED SECRETS

### Supabase Edge Function Secrets
Since the `send-support-email` function lives in Supabase Edge Functions, you must set these secrets directly inside Supabase:

* `RESEND_API_KEY`: Used by the Edge Function to send emails securely.
* `SUPPORT_EMAIL`: The destination admin email address that will receive customer support messages.

*To set Supabase secrets, run via Supabase CLI:*
`supabase secrets set RESEND_API_KEY=your_key SUPPORT_EMAIL=your_email`

---

## SECTION 5: REQUIRED DATABASES

* **PostgreSQL**: Used for all major tables (users, patients, doctors, sessions, payments).
* **Database Setup & Migrations**: Amar Daktar initializes dynamic tables on start. In a production Node.js environment, the Express server uses `pg` to execute `CREATE TABLE IF NOT EXISTS` natively on bootstrap. Ensure your provided DB User in `DATABASE_URL` has standard DDL execution privileges for the first run.

---

## SECTION 6: REQUIRED PACKAGES

### Production Dependencies
These packages must be compiled and deployed:
* **Express & Middleware**: `express`, `cors`, `cookie-parser`, `helmet`, `express-rate-limit`
* **Realtime**: `socket.io`, `socket.io-client`
* **Database & Auth**: `pg`, `bcryptjs`, `jsonwebtoken`, `firebase`
* **AI & Utils**: `@google/genai`, `zod`, `multer`, `ioredis`
* **Frontend**: `react`, `react-dom`, `framer-motion`, `lucide-react`, `tailwindcss`, `recharts`

### Development Dependencies
Used locally for compiling and type checks:
* **TypeScript & Bundlers**: `typescript`, `vite`, `esbuild`, `tsx`
* **Tailwind CSS**: `tailwindcss`, `autoprefixer`
* **Types**: `@types/node`, `@types/express`, `@types/pg`, etc.

---

## SECTION 7: LOCAL DEVELOPMENT

If you want to review the application locally before production deployment:

1. **`npm install`**: Installs all required Node modules.
2. **`npm run dev`**: Uses `tsx` and `vite` proxy middleware to serve both the Express Backend and React Frontend concurrently at `http://localhost:3000`. You can develop and test immediately.
3. **`npm run build`**: Compiles the React frontend using Vite (into `dist/`) and bundles the Express server using esbuild into a clean CommonJS file (`dist/server.cjs`).
4. **`npm run start`**: Executes the compiled production backend `node dist/server.cjs`.
5. **`npm run lint`**: Runs TypeScript validation to spot errors.

---

## SECTION 8: VERCEL DEPLOYMENT

Amar Daktar is a Full-Stack application. Because it relies heavily on WebSockets (`socket.io`), standard serverless platforms like Vercel will struggle with long-polling/sockets dropping connections randomly. A containerized platform (like Google Cloud Run, Railway, or Render) is recommended, but Vercel can be used for standard API endpoints and Frontend.

If deploying to **Railway or Render** (Recommended):
1. Push your project to a GitHub repository.
2. Create a new Web Service and link the repo.
3. Set the build command to: `npm install && npm run build`
4. Set the start command to: `npm run start`
5. Configure your Environment Variables matching Section 2.
6. Deploy and verify. 

If deploying Frontend only to **Vercel** (requires splitting the backend):
1. Push project to GitHub.
2. Import the repository in Vercel.
3. Add the `VITE_*` environment variables.
4. Deploy the project. Note that `server.ts` handles API routes, so you must either use a custom `vercel.json` rewrites or host the backend separately elsewhere.

---

## SECTION 9: POST DEPLOYMENT CHECKLIST

Ensure the application is fully functional:

- [ ] Homepage loads successfully
- [ ] English ↔ Bangla language switch works exactly across all UI elements
- [ ] Patient, Admin, and Doctor Login/Signup works
- [ ] Dashboard metrics and charts load
- [ ] AI Chat Assistant successfully processes symptom chats
- [ ] Paid Doctor Live Chat works (WebSockets establish correctly)
- [ ] Medical Upload Report safely stores locally/blob and parses
- [ ] Support Form successfully pings Supabase Edge Functions and sends the email
- [ ] Session Expiry Timers calculate correctly and lock interfaces securely
- [ ] Responsive UI functions elegantly on phone dimensions

---

## SECTION 10: FIREBASE CONFIGURATION

1. **Authorized Domains**: Go to Firebase Authentication Settings. Add your production domain (`your-app.com`) to the **Authorized Domains** list to allow OAuth flows.
2. **Providers**: Enable Google, Facebook, and Apple authentication gateways.
3. **Client Configuration**: Configure your deployment environment to pass the `VITE_FIREBASE_*` environment variables directly to the build. Do NOT hardcode them into the source control.

---

## SECTION 11: SUPABASE CONFIGURATION

1. **Create Edge Functions**: The `send-support-email` function needs to be explicitly created in your Supabase project instance.
   - Install Supabase CLI.
   - Create the function to capture POST bodies and invoke the Resend API.
   - Deploy the function via `supabase functions deploy send-support-email`
2. **Secrets**: Inject `RESEND_API_KEY` into Supabase safely.
3. **CORS Configuration**: Ensure your Edge function returns the correct CORS headers so your production domain can POST to it successfully.

---

## SECTION 12: TROUBLESHOOTING

* **PostgreSQL Connection Errors**: Double-check `DATABASE_URL`. If using Neon or Supabase DB, append `?sslmode=require` to the string if your deployment engine requires SSL encryption.
* **Missing Environment Variables**: Verify that Vercel/Railway injected strings properly. UI components will show explicit toast errors if `VITE_SUPABASE_URL` is omitted.
* **OpenRouter / AI Failing**: If "Failed to process chat" appears, verify `OPENROUTER_API_KEY` is present and you have active credits internally on the provider.
* **WebSocket Disconnections**: If the Paid Doctor Chat drops randomly, ensure your hosting provider supports sticky sessions or raw WebSocket upgrades (some load balancers strip socket upgrade headers).
* **Firebase Auth Error (Domain unauthorized)**: You forgot to add your production URL to Firebase's authorized domains list.
* **Send Email Function Failures**: Ensure `RESEND_API_KEY` is validated and the sender email identity on Resend is verified with DNS.
