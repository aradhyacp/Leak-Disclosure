# Leak-Disclosure

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue.svg)](https://reactjs.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/aradhyacp/Leak-Disclosure/graphs/commit-activity)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/aradhyacp/Leak-Disclosure/pulls)

**Leak-Disclosure** is a professional-grade, full-stack SaaS security platform designed to empower users by identifying compromised data in global breaches. Featuring real-time monitoring, automated email alerts, and a robust search engine, it provides a comprehensive defense against identity theft.

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [SaaS Highlights](#-saas-highlights)
- [Contributing](#-contributing)
- [License](#-license)

---

## Project Overview

In an era of frequent data breaches, **Leak-Disclosure** serves as a sentinel for your digital identity. This platform allows users to:
1.  **Search:** Instantly check if an email address has been part of known data leaks.
2.  **Monitor:** Set up continuous background monitoring for specific accounts.
3.  **Alert:** Receive immediate email notifications via automated Cron jobs when new leaks are detected.
4.  **SaaS Integration:** Seamlessly upgrade to premium tiers using a secure subscription model.

---

## Core Features

| Feature | Description |
| :--- | :--- |
| 🔍 **Deep Search Engine** | Scans massive datasets to locate leaked credentials and personal info. |
| 🛡️ **Real-time Monitoring** | Continuous background checks using **Cron Jobs** for persistent safety. |
| 💳 **Subscription Management** | Full SaaS flow with **Stripe** integration (Success/Cancel flows). |
| 🔐 **Advanced Auth** | Secure user management and protected routes powered by **Clerk**. |
| 📧 **Automated Alerts** | Instant email notifications when your data is found in new leaks. |
| 🌓 **Theme Support** | Dark/Light mode context for an optimal user experience. |
| 🏗️ **Developer Tooling** | **Husky** pre-commit hooks and **Prettier** for code consistency. |

---

## Tech Stack

### Frontend
<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
</p>

### Backend & Database
<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

### Services & DevOps
<p align="left">
  <img src="https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/Husky-brown?style=for-the-badge&logo=husky&logoColor=white" />
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white" />
</p>

---

## Project Structure

```text
Leak-Disclosure/
├── BE/                     # Backend (Node.js/Express)
│   ├── auth/               # Clerk Auth Logic
│   ├── db/                 # Supabase Schema & Connection
│   ├── monitor/            # Cron Jobs & Email Notification Logic
│   ├── search/             # Leak Search Logic
│   ├── subscription/       # Stripe Subscription Management
│   └── webhook/            # Stripe & Clerk Webhook Handlers
├── FE/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── Components/     # UI Parts (Search, Monitor, Pricing)
│   │   ├── Pages/          # Dashboard, Upgrade, Auth Pages
│   │   ├── Routes/         # Protected vs Public Route Logic
│   │   └── context/        # Theme & Global State
│   └── public/             # Static Assets
├── .husky/                 # Pre-commit formatting hooks
├── .prettierrc             # Code style configuration
└── package.json            # Root dependencies
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- NPM or Yarn
- Accounts for: **Clerk**, **Stripe**, and **Supabase**.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/aradhyacp/Leak-Disclosure.git
    cd Leak-Disclosure
    ```

2.  **Backend Setup**
    ```bash
    cd BE
    npm install
    # Create a .env file and add your credentials:
    # CLERK_SECRET_KEY, STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_KEY
    npm start
    ```

3.  **Frontend Setup**
    ```bash
    cd ../FE
    npm install
    # Create a .env file and add:
    # VITE_CLERK_PUBLISHABLE_KEY, VITE_STRIPE_PUBLIC_KEY
    npm run dev
    ```

---

##  SaaS Highlights

### 💳 Stripe Integration
The platform implements a full payment lifecycle. Using **Stripe Webhooks**, the backend listens for `checkout.session.completed` events to automatically update user subscription statuses in the Supabase database.

### 🔐 Clerk Authentication
Authentication is handled via **Clerk**, providing a secure and seamless login/signup experience. The backend uses a custom `authMiddleware.js` to validate Clerk JWTs, ensuring that only authenticated users can access sensitive monitoring data.

### 📡 Real-time Webhooks
The project features a dedicated `webhook/` directory that processes:
- **Stripe Webhooks:** For handling payments and subscriptions.
- **Clerk Webhooks:** For syncing user data between Clerk and the local Supabase instance.

### ⏲️ Monitoring Cron
Inside `BE/monitor/`, the system runs scheduled tasks (`monitorCron.js`) to scan for new leaks for all subscribed users, sending automated emails via `email.js` if a breach is detected.

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`) - *Husky will ensure formatting!*
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## Contact & Support

**Aradhya CP** - [@aradhyacp](https://github.com/aradhyacp)

Project Link: [https://github.com/aradhyacp/Leak-Disclosure](https://github.com/aradhyacp/Leak-Disclosure)

---
<p align="center">
  Built with ❤️ for a safer internet.
</p>
