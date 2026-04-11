# Student Merit Portal - Technical Documentation

## 📋 Project Overview

The Student Merit Portal is a full-stack web application designed for educational institutions to manage and evaluate student achievements. It provides a comprehensive system for students to submit their academic, sports, cultural, and other achievements, while administrators can review submissions and generate merit-based rankings.



## 🛠️ Tech Stack (Detailed)

### **Frontend Framework**
- **Next.js 16** (App Router)
  - Server Components for optimal performance
  - Server Actions for secure backend operations
  - Built-in API routes for custom endpoints
  - Automatic code splitting and optimization
  - React 19.2 with latest features

### **UI & Styling**
- **Tailwind CSS v4**
  - Utility-first CSS framework
  - Custom design tokens in `globals.css`
  - Responsive design with mobile-first approach
  
- **shadcn/ui Components**
  - Pre-built, accessible React components
  - Customizable with Tailwind
  - Components: Button, Card, Dialog, Table, Form, Select, Badge, etc.
  - Radix UI primitives for accessibility

### **Backend & Database**
- **Supabase** (Complete Backend-as-a-Service)
  - **PostgreSQL Database**: Relational database for structured data
  - **Supabase Auth**: Built-in authentication with JWT tokens
  - **Supabase Storage**: Object storage for file uploads
  - **Row Level Security (RLS)**: Database-level security policies
  - **Real-time subscriptions**: (Available for future features)

### **Language & Type Safety**
- **TypeScript**
  - Full type safety across frontend and backend
  - Interface definitions for database models
  - Type inference for better developer experience

### **State Management**
- **React Server Components**: Server-side data fetching
- **React Hooks**: Client-side state (useState, useEffect)
- **Server Actions**: Form submissions and mutations

---

## 🗄️ Data Storage Architecture

### **1. Supabase Authentication (`auth.users`)**
**What's Stored:**
- User email and encrypted password
- User metadata (role, full_name, student_id, department, year_of_study)
- Authentication tokens and session data

**How It Works:**
- Managed entirely by Supabase Auth
- JWT tokens contain user metadata for role-based access
- Automatic session management and token refresh

---

### **2. PostgreSQL Database Tables**

#### **`profiles` Table**
\`\`\`sql
Columns:
- id (UUID, Primary Key) → References auth.users(id)
- role (TEXT) → 'student' or 'admin'
- full_name (TEXT)
- student_id (TEXT, unique for students)
- department (TEXT)
- year_of_study (INTEGER, for students)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
\`\`\`
**Purpose:** Extended user profile information beyond basic auth data

**RLS Policies:**
- Users can view and update their own profile
- Admins can view all profiles (checked via JWT role)

---

#### **`achievements` Table**
\`\`\`sql
Columns:
- id (UUID, Primary Key)
- name (TEXT) → e.g., "First Class with Distinction"
- category (TEXT) → 'academic', 'sports', 'cultural', etc.
- description (TEXT)
- max_points (INTEGER) → Maximum merit points for this achievement
- created_at (TIMESTAMP)
\`\`\`
**Purpose:** Defines available achievement types and their point values

**RLS Policies:**
- Everyone can read achievements
- Only admins can create/update/delete achievements

---

#### **`submissions` Table**
\`\`\`sql
Columns:
- id (UUID, Primary Key)
- student_id (UUID) → Foreign Key to profiles(id)
- achievement_id (UUID) → Foreign Key to achievements(id)
- description (TEXT) → Student's description of achievement
- proof_url (TEXT) → URL to uploaded proof document in Storage
- points_awarded (INTEGER) → Actual points given by admin
- status (TEXT) → 'pending', 'approved', 'rejected'
- reviewed_by (UUID, nullable) → Foreign Key to profiles(id) - admin who reviewed
- reviewed_at (TIMESTAMP, nullable)
- admin_notes (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
\`\`\`
**Purpose:** Stores student achievement submissions with review status

**RLS Policies:**
- Students can create submissions and view only their own
- Admins can view all submissions and update them (approve/reject)

---

#### **`merit_evaluations` Table**
\`\`\`sql
Columns:
- id (UUID, Primary Key)
- student_id (UUID) → Foreign Key to profiles(id)
- total_points (INTEGER) → Sum of all approved submission points
- rank (INTEGER) → Student's rank based on total points
- evaluation_date (TIMESTAMP)
- created_at (TIMESTAMP)
\`\`\`
**Purpose:** Stores calculated merit scores and rankings

**RLS Policies:**
- Students can view their own evaluation
- Admins can view all evaluations and create/update them

---

### **3. Supabase Storage**

#### **`achievement-proofs` Bucket**
**What's Stored:**
- PDF documents, images (JPG, PNG), and other proof files
- Organized by user ID: `{user_id}/{filename}`

**Storage Policies:**
- Students can upload files to their own folder (`{user_id}/`)
- Students can view/delete only their own files
- Admins can view all files
- Bucket is set to PUBLIC for easy URL access

**File Upload Flow:**
1. Student selects file in form
2. File uploaded to Supabase Storage via `supabase.storage.from('achievement-proofs').upload()`
3. Public URL generated and stored in `submissions.proof_url`
4. File accessible via URL for admin review

---

## 🔐 Authentication & Security

### **Authentication Flow**

#### **Sign Up:**
1. User fills sign-up form (email, password, role, profile info)
2. `supabase.auth.signUp()` creates user in `auth.users`
3. User metadata (role, full_name, etc.) stored in `raw_user_meta_data`
4. Database trigger (`handle_new_user()`) automatically creates profile in `profiles` table
5. User redirected to sign-up success page (email verification required)

#### **Login:**
1. User enters email and password
2. `supabase.auth.signInWithPassword()` validates credentials
3. JWT token generated with user metadata (including role)
4. Token stored in cookies via middleware
5. User redirected based on role:
   - Student → `/dashboard`
   - Admin → `/admin`

#### **Session Management:**
1. Middleware (`middleware.ts`) runs on every request
2. Checks for valid session using `supabase.auth.getUser()`
3. Refreshes expired tokens automatically
4. Protects routes:
   - `/dashboard/*` → Students only
   - `/admin/*` → Admins only
   - `/auth/*` → Public (login/signup)

---

### **Row Level Security (RLS)**

**How It Works:**
- PostgreSQL policies enforce data access at database level
- Policies check `auth.uid()` (current user ID) and JWT claims
- Even if someone bypasses frontend, database blocks unauthorized access

**Example Policy:**
\`\`\`sql
-- Students can only view their own submissions
CREATE POLICY "Students can view own submissions"
  ON public.submissions FOR SELECT
  USING (student_id = auth.uid());

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON public.submissions FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
\`\`\`

---

## 🔄 Application Workflows

### **Student Workflow**

#### **1. Registration & Login**
\`\`\`
Sign Up → Enter Details (role=student, student_id, department, year) 
→ Profile Created → Email Verification → Login → Dashboard
\`\`\`

#### **2. Submit Achievement**
\`\`\`
Dashboard → New Submission → Select Achievement Type 
→ Enter Description → Upload Proof (PDF/Image) 
→ File Uploaded to Storage → Submission Created in DB (status='pending')
→ View in "My Submissions"
\`\`\`

#### **3. Track Submissions**
\`\`\`
Dashboard → My Submissions → View List (Pending/Approved/Rejected)
→ See Admin Notes → Check Points Awarded
\`\`\`

#### **4. View Merit Ranking**
\`\`\`
Dashboard → Merit Evaluation → See Total Points → See Rank → Compare with Peers
\`\`\`

---

### **Admin Workflow**

#### **1. Registration & Login**
\`\`\`
Sign Up → Enter Details (role=admin) 
→ Profile Created → Login → Admin Portal
\`\`\`

#### **2. Review Submissions**
\`\`\`
Admin Portal → Review Submissions → Filter by Status/Category/Student
→ Click Submission → View Details + Proof Document
→ Approve/Reject → Enter Points + Notes → Update Status
→ Submission Updated in DB
\`\`\`

#### **3. Manage Students**
\`\`\`
Admin Portal → Students → View All Students
→ See Student Details (ID, Department, Year)
→ View Submission Count per Student
\`\`\`

#### **4. Generate Merit Rankings**
\`\`\`
Admin Portal → Merit Evaluation → Select Evaluation Period
→ Click "Generate Merit List" 
→ System Calculates: Sum of approved points per student
→ Ranks Students (highest points = Rank 1)
→ Creates/Updates merit_evaluations records
→ View Rankings Table
\`\`\`

#### **5. Manage Achievement Types**
\`\`\`
Admin Portal → Achievements → View All Achievement Types
→ Add New Achievement (Name, Category, Max Points)
→ Edit/Delete Existing Achievements
\`\`\`

---

## 📁 Project File Structure

\`\`\`
student-merit-portal/
├── app/
│   ├── layout.tsx                 # Root layout with fonts
│   ├── page.tsx                   # Landing page
│   ├── globals.css                # Tailwind + design tokens
│   ├── auth/
│   │   ├── login/page.tsx         # Login page
│   │   ├── sign-up/page.tsx       # Sign-up with role selection
│   │   └── sign-up-success/page.tsx
│   ├── dashboard/                 # Student portal
│   │   ├── layout.tsx             # Dashboard layout with nav
│   │   ├── page.tsx               # Dashboard home
│   │   ├── submissions/page.tsx   # View own submissions
│   │   ├── new-submission/page.tsx # Submit achievement
│   │   ├── merit/page.tsx         # View own ranking
│   │   └── profile/page.tsx       # Edit profile
│   └── admin/                     # Admin portal
│       ├── layout.tsx             # Admin layout with nav
│       ├── page.tsx               # Admin dashboard
│       ├── submissions/page.tsx   # Review all submissions
│       ├── students/page.tsx      # Manage students
│       ├── merit/page.tsx         # Generate rankings
│       └── achievements/page.tsx  # Manage achievement types
├── components/
│   ├── dashboard-nav.tsx          # Student sidebar nav
│   ├── admin-nav.tsx              # Admin sidebar nav
│   ├── new-submission-form.tsx    # Achievement submission form
│   ├── submissions-table.tsx      # Admin submissions table
│   ├── merit-evaluation-form.tsx  # Merit generation form
│   └── ui/                        # shadcn/ui components
├── lib/
│   └── supabase/
│       ├── client.ts              # Browser Supabase client
│       ├── server.ts              # Server Supabase client
│       └── middleware.ts          # Middleware Supabase client
├── scripts/                       # Database setup SQL
│   ├── 001_create_profiles.sql
│   ├── 002_profile_trigger.sql
│   ├── 003_create_achievements.sql
│   ├── 004_create_submissions.sql
│   ├── 005_create_merit_evaluations.sql
│   ├── 006-009_fix_rls_policies.sql
│   └── 010-011_create_storage_bucket.sql
├── middleware.ts                  # Next.js middleware for auth
├── SUPABASE_SETUP.md             # Storage bucket setup guide
└── PROJECT_DOCUMENTATION.md       # This file
\`\`\`

---

## 🚀 Setup Instructions

### **1. Prerequisites**
- Node.js 18+ installed
- Supabase account created
- Supabase project created

### **2. Environment Variables**
Already configured in v0:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### **3. Database Setup**
Run SQL scripts in order (001 → 011) in Supabase SQL Editor:
1. Creates tables (profiles, achievements, submissions, merit_evaluations)
2. Sets up RLS policies
3. Creates database trigger for auto-profile creation
4. Pre-populates achievement categories

### **4. Storage Setup**
Follow `SUPABASE_SETUP.md` to create `achievement-proofs` bucket manually in Supabase dashboard with proper policies.

### **5. Run Application**
\`\`\`bash
npm install
npm run dev
\`\`\`

---

## 🔍 Key Technical Decisions

### **Why Supabase?**
- All-in-one solution (Auth + Database + Storage)
- Built-in RLS for security
- PostgreSQL for complex queries and relationships
- Real-time capabilities for future features

### **Why Next.js App Router?**
- Server Components reduce client-side JavaScript
- Server Actions for secure mutations without API routes
- Built-in middleware for authentication
- Optimal performance with automatic optimizations

### **Why Row Level Security?**
- Security enforced at database level (not just frontend)
- Prevents data leaks even if frontend is compromised
- Simplifies authorization logic (no manual checks in every query)

### **Why JWT for Role Checking?**
- Avoids circular database queries (infinite recursion)
- Role available immediately without extra DB call
- Faster policy evaluation

---

## 📊 Data Flow Example

**Student Submits Achievement:**
\`\`\`
1. Student fills form in browser
2. File uploaded to Supabase Storage → Returns public URL
3. Server Action called with form data + file URL
4. Server Action inserts into submissions table:
   {
     student_id: auth.uid(),
     achievement_id: selected_achievement,
     description: "Won first prize...",
     proof_url: "https://supabase.co/storage/.../proof.pdf",
     status: "pending"
   }
5. RLS policy checks: Is student_id = auth.uid()? ✅ Allow
6. Record created in database
7. Student redirected to submissions page
8. Query fetches submissions WHERE student_id = auth.uid()
9. RLS policy allows (own data)
10. Submissions displayed in table
\`\`\`

**Admin Reviews Submission:**
\`\`\`
1. Admin opens review page
2. Query: SELECT * FROM submissions (all submissions)
3. RLS policy checks: Is user admin? (JWT role = 'admin') ✅ Allow
4. All submissions returned with student details (JOIN profiles)
5. Admin clicks "Approve" → Opens dialog
6. Admin enters points + notes → Submits
7. Server Action updates submission:
   {
     status: "approved",
     points_awarded: 50,
     reviewed_by: admin_id,
     reviewed_at: now(),
     admin_notes: "Excellent achievement"
   }
8. RLS policy checks: Is user admin? ✅ Allow UPDATE
9. Record updated
10. Student sees updated status in their dashboard
\`\`\`

---

## 🎯 Future Enhancements

- Email notifications (Supabase Edge Functions)
- Real-time submission updates (Supabase Realtime)
- Analytics dashboard for admins
- Bulk submission approval
- Export merit list to PDF/Excel
- Student achievement certificates generation
- Mobile app (React Native with same Supabase backend)

---

## 📝 Notes for Developers

- Always read files before editing (v0 requirement)
- Use Server Components by default, Client Components only when needed
- All database queries automatically protected by RLS
- Test with both student and admin accounts
- Check browser console for `[v0]` debug logs during development
- Storage bucket must be created manually (SQL scripts don't have permissions)

---

**Built with ❤️ using Next.js 16, Supabase, and TypeScript**
