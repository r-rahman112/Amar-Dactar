# আমার ডাক্তার - Amar Daktar

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
