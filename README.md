<div align="center">

# ✚ CareQueue

### Smart Hospital Queue & Real-Time Pharmacy Inventory

**Your Health, Our Priority.**

Helping patients spend less time waiting and less time searching for medicine.

<br/>

![Team](https://img.shields.io/badge/Team-Terminal-0D9488?style=for-the-badge)
![Competition](https://img.shields.io/badge/IntelliCon'26-0F766E?style=for-the-badge)
![Category](https://img.shields.io/badge/Bracket-Undergraduate-CCFBF1?style=for-the-badge)
![Domain](https://img.shields.io/badge/Domain-Health-115E59?style=for-the-badge)

**Team ID:** `765E2C97`

</div>

---

## 🌿 The Problem We're Solving

Healthcare should be about getting better—not spending hours wondering when your turn will come or travelling between pharmacies to find a medicine.

In Sri Lanka, patients often face two frustrating challenges:

- **Uncertain waiting times:** Patients wait in clinic and OPD queues without knowing how many people are ahead or when they may be seen.
- **Hard-to-find medicine:** Patients may visit several pharmacies before finding one that has their medicine in stock.

## 💚 Meet CareQueue

CareQueue is a smart healthcare support platform designed to make everyday care more convenient. It brings **appointment booking, live queue information, wait-time estimates, and pharmacy medicine discovery** into one place.

Our goal is simple: make healthcare journeys clearer, calmer, and more patient-friendly.

### ✨ What You Can Do

| Feature | How it helps |
|---|---|
| 📅 **Book appointments** | Book a healthcare session without unnecessary hassle. |
| 🎟️ **Track your queue** | See your place in the queue and understand how many patients are ahead. |
| ⏱️ **Estimate waiting time** | Get an estimated wait based on recent patient-serving times and queue length. |
| 💊 **Find medicines** | Search for a medicine and discover matching medicines available in pharmacy stock. |
| 🔔 **Receive notifications** | Get in-browser alerts while CareQueue is open. |
| 🛡️ **Protected accounts** | Use account authentication with securely hashed passwords. |
| 🧑‍💼 **Admin dashboard** | Review payment-log information and support operational oversight. |

> **Designed around the patient:** less uncertainty, fewer unnecessary trips, and a smoother healthcare experience.

---

## 🧠 AI That Has a Practical Purpose

CareQueue uses AI for two focused tasks. AI features are optional: if the API key is missing or a request fails, the application can fall back to non-AI logic.

### 1. 💊 Smarter Medicine Search

**The challenge:** People may search using a brand name, a generic name, or a slightly different medicine description.

**What CareQueue does:** The app can ask Claude to suggest likely generic and brand-name matches for the search text. CareQueue then checks those matches against the medicine stock recorded by pharmacies.

**Why it matters:** Searching becomes more flexible than relying only on an exact text match.

- Results are cached for **one hour** to reduce repeated requests.
- AI suggests possible names; pharmacy inventory is used to check stock matches.

### 2. ⏳ More Informed Wait-Time Estimates

**The challenge:** A queue number alone does not tell a patient how long the wait may be.

**What CareQueue does:** The app sends recent doctor-specific minutes-per-patient samples and the number of patients ahead to Claude. The result is sanity-checked before being used.

**Why it matters:** Patients get a more useful estimate than a queue position alone can provide.

- Estimates are cached for **60 seconds**.
- The estimate is a guide, not a guarantee; actual waiting times can change.

### 🔐 Privacy-conscious AI

Only the medicine search text, doctor's name, and queue numbers are sent to the AI service for these features. **Patient names, phone numbers, and patient records are not sent.**

The default model is `claude-haiku-4-5-20251001`. You can change it with the `ANTHROPIC_MODEL` environment variable.

## 🧰 Built With

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS 3, React Router |
| **Backend** | Java 17, Spring Boot 3.3, Maven |
| **Authentication & validation** | Spring Security, JWT (`jjwt`), Bean Validation |
| **Database** | MongoDB (Atlas or local), TTL indexes, `2dsphere` geospatial index |
| **AI integration** | Claude API via REST from Spring Boot |
| **Notifications** | In-browser notifications |
| **Deployment plan** | Frontend: Vercel · Backend: Docker service on Render · Database: MongoDB Atlas |

**Deployment status:** The project is not yet fully deployed; MongoDB Atlas deployment remains pending.
*not yet deployed

## 🏗️ How It Works

```text
Patient
   │
   ▼
CareQueue Web App
(React + Vite + Tailwind)
   │
   ▼
Spring Boot REST API
   ├── Appointment & queue logic
   ├── Authentication and validation
   ├── Medicine stock matching
   └── Optional Claude AI assistance
   │
   ▼
MongoDB
(appointments, accounts, inventory and app data)
```

The frontend provides the patient-facing experience. The Spring Boot backend handles application logic and data access, while MongoDB stores the app's operational data. Claude can assist with medicine-name resolution and wait-time reasoning when configured.

## 🚀 Run CareQueue 

### Prerequisites

Make sure you have:

- Java 17
- Maven
- Node.js 18 or newer
- A MongoDB instance (local or Atlas)
- An Anthropic API key if you want to enable the AI features
  
### 1. Clone the project

```bash
git clone https://github.com/Thewni03/CareQueue

cd CareQueue
```
### 2. Run the backend

```bash
cd backend
mvn spring-boot:run
```
### 3. Run the backend
Open a new terminal from the project folder:

```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 in your browser.

Note: Ensure MongoDB is running and the required environment variables are configured.

## 🔒 Data, Security & Privacy

CareQueue is designed to handle appointment and queue workflows—not to act as a medical-record system.

- **Appointment retention:** Appointment records containing a patient's phone number are automatically deleted by a MongoDB TTL index two days after the session date.
- **Password protection:** Passwords are stored as BCrypt hashes.
- **Payment demo:** Only the last four digits of a card are stored. This version does not charge real cards.
- **Admin payment log:** The payment log contains patient name, hospital, amount, and payment method for the admin dashboard.
- **Limited health data:** The application does not store medical records, diagnoses, or prescriptions.
- **AI data minimisation:** Patient names, phone numbers, and patient records are not sent to Claude by the two AI features described above.
- **Secret management:** Configuration secrets belong in environment variables, not source control.

Please use demo data when evaluating the project. The privacy notes above describe the current implementation and should not be interpreted as a claim of a formal security audit or regulatory certification.

## 🚧 Current Limitations & Next Steps

- **Demo data only:** No live hospital integrations are currently available.
- **Browser-only alerts:** Notifications work while the app is open. True push notifications would require frontend Firebase setup.
- **Deployment in progress:** MongoDB Atlas is not yet deployed.
- **Estimates are not promises:** Queue conditions can change, so wait-time estimates should be treated as guidance.
- **Inventory accuracy matters:** Medicine search results depend on the pharmacy stock data available in the system.

### 🔭 Where CareQueue Could Go Next

- Integrate with real hospital appointment and queue systems.
- Add Firebase-powered push notifications.
- Connect participating pharmacies and refresh inventory more frequently.
- Improve accessibility and multilingual support for Sri Lankan users.

## Meet Team Terminal

Built for **IntelliCon '26 Buildathon**

- Thewni Mahathantrige
- Wijekoon W.M.D.C
- Nimsara G.K

<div align="center">

### 💚 Better information. Less waiting. More care.

**CareQueue — Your Health, Our Priority.**

*Built with purpose by Team Terminal for IntelliCon '26.*

</div>
