# ECGenius — Frontend

**AI-Powered Digital ECG Analysis and Reporting System**

## About the Project

ECGenius is a web-based platform designed to support doctors in reviewing digital ECG analysis results and AI-generated medical reports.

The frontend provides an interface for doctors and patients to access their respective dashboards and interact with the system.

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   └── ecg/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   │   ├── auth/
│   │   ├── doctor/
│   │   └── patient/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example` and configure the API URL.

### Run Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run Linter

```bash
npm run lint
```

## Project Status

Frontend initial setup and application structure.

