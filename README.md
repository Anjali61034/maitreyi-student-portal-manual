# 🎓 Student Merit Portal

A comprehensive web-based platform for students to submit achievements  
(**Academic, Sports, Co-curricular**) and for administrators to **evaluate, rank, and manage merit automatically** based on predefined criteria.

---

## 🌟 Features

### 👩‍🎓 Student Dashboard
- Submit achievements in **6 categories**:
  - Academic
  - Sports
  - Extra-Curricular Activities (ECA)
  - Outreach
  - NCC
  - Industry
- **Automatic point calculation** based on Rank / Participation
- **CGPA submission** with year-wise input
- Upload & view **proof documents** (Images / PDFs)
- Delete own submissions **before review**
- Track real-time status:
  - Pending
  - Approved
  - Rejected

---

### 🧑‍💼 Admin Dashboard
- Review all student submissions
- Approve / Reject with:
  - Remarks
  - Manual point adjustment
- View uploaded proofs in a **popup modal**
- Generate **Merit Rankings** filtered by:
  - Academic Year
  - Student Year

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (Radix UI)
- **Backend / Database:** Supabase  
  - PostgreSQL  
  - Authentication  
  - Storage
- **Icons:** Lucide React

---

## 📋 Prerequisites

- Node.js **18+**
- A **Supabase project** (Free tier works)
- Git

---

## 🚀 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone <your-repo-url>
cd merit-portal
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Deployment
🚀 Live URL: [Student Merit Portal](https://maitreyi-student-portal-manual.vercel.app)

