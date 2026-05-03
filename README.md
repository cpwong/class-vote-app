# Class Vote App

A beautiful, responsive, and real-time voting application built with **Next.js**, **React**, and **Firebase**. This platform allows a cohort of students to securely log in and nominate their most helpful classmates, while providing administrators with a powerful dashboard to manage the cohort and visualize results on a projector-friendly leaderboard.

## Features

- **Premium UI**: Glassmorphism aesthetic with fluid animations using pure CSS.
- **Secure Authentication**: Role-based access control (Admin vs Student) using HTTP-only JWT cookies.
- **Real-time Leaderboard**: A gorgeous, animated, projector-friendly histogram visualizing the top 5 nominated students.
- **Batch Processing**: Highly optimized backend using Firebase Admin SDK and Firestore batch writes.
- **Concurrency Tested**: Ready to handle dozens of simultaneous voting submissions without data races.

---

## 👩‍🎓 Usage Instructions: Students

1. Navigate to the application URL provided by your instructor.
2. Click **Student Login**.
3. Enter your unique **Username** and the shared **Cohort Password**.
4. You will be presented with a list of all your classmates. Select up to **3 classmates** who have been the most helpful to you.
5. Click **Save Votes**.
6. *Note: You can return to the portal at any time to change your votes before the voting session ends.*

---

## 👨‍🏫 Usage Instructions: Admin

1. Navigate to the application URL and click **Admin Login**.
2. Log in using the admin password (the default initial password is `admin123`).
3. **Global Settings**: Immediately change your Admin Password and set the shared Student Cohort Password.
4. **Manage Cohort**: 
   - **Bulk Add**: Paste a list of students (format: `username, Full Name` on each line) to instantly populate your classroom.
   - **Edit/Remove**: Manage individual students directly from the dashboard.
5. **Projector Leaderboard**: Click the **Open Leaderboard ↗** button at the top right to launch a stunning, animated, full-screen histogram. Drag this window to your classroom projector!
6. **Session Control**: Use the **Reset All Votes** button to wipe the slate clean for a new voting round without deleting your students.

---

## 💻 Usage Instructions: Developers & Testing

### Pre-requisites

Before setting up the server locally, ensure you have the following credentials ready for your `.env.local` file (refer to `.env.local.example`):
- **Firebase Admin SDK Service Account**: 
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
- **Firebase Client-Side Configuration**:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
- **Application Secrets**:
  - `SESSION_SECRET` (A strong random string for session/cookie signing)

### Local Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. **Firebase Setup**:
   - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
   - Navigate to **Firestore Database** and create a new database in test mode or with appropriate security rules.
   - Go to **Project Settings > Service accounts** and click **Generate new private key**. This will download a JSON file containing your credentials.
3. Create a `.env.local` file in the root directory and configure your Firebase Admin SDK credentials using the downloaded JSON file:
   ```env
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="your-service-account-email"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   SESSION_SECRET="your-super-secret-key"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### Simple Randomized Test

If you want to quickly populate the database with random votes to test the Leaderboard UI without running the full E2E script:
1. Log in to the **Admin Dashboard**.
2. Click the **Simulate Votes** button. This will instantly generate and submit randomized votes on behalf of your existing cohort.
3. Open the **Projector Leaderboard** to view the randomly generated results.

### End-to-End Concurrency Testing

To ensure the server and database can handle intense, simultaneous traffic (e.g., an entire classroom submitting their votes at the exact same second), you can run the built-in Playwright E2E stress test.

1. **Install Playwright**:
   ```bash
   npm install -D playwright
   npx playwright install chromium
   ```
2. **Configure the Test**:
   Open `scripts/e2e-concurrency.js` and ensure the `USERNAMES` array contains a list of real students currently in your local database. Verify that `TARGET_URL` matches your local server (e.g., `http://localhost:3000`).
3. **Run the Stress Test**:
   ```bash
   node scripts/e2e-concurrency.js
   ```
   *This script will instantly spawn isolated, incognito browser contexts for every user in your list, log them all in simultaneously, pick random classmates, and submit their votes concurrently.*
