# CSI KARE Core Team 2026–27 QR Profile System

> **A modern, glassmorphic digital profile portal for CSI KARE Student Chapter Core Team members with permanent QR codes mapped to physical ID cards.**

---

## 🎯 Purpose

CSI KARE Core Team members have physical ID cards with a permanent QR code printed on the back. When scanned with any smartphone camera, the QR opens that member's dynamic profile page:

```
Physical ID Card
       ↓ Scan QR
https://YOUR-DOMAIN/member/CSI26-001
       ↓
Krishna Chaithanya's CSI KARE Profile
Photo • Role • Academic Year
Instagram • LinkedIn • Email • Phone
```

> **IMPORTANT**: This is **NOT** a verification system. No verification badges, authenticity checks, or verification statuses are used. The QR is simply a permanent, convenient shortcut to the member's profile.

---

## ✨ Features

- 📱 **Mobile-First & Glassmorphism Design**: Tailored for instant mobile scans with modern glass aesthetics, glowing neon accents, and smooth animations.
- ⚡ **Dynamic Member Routing**: Fully dynamic route `/member/:memberId`. Initial seed comes with 80 records (`CSI26-001` through `CSI26-080`), but supports unlimited dynamically added members (`CSI26-081`, `CSI26-100`, etc.) without code changes or redeployments.
- 🌓 **Dark & Light Mode**: Seamless theme switching with local storage persistence.
- 🔒 **Secure Admin Dashboard**: Firebase Authentication protected dashboard (`/admin`) for viewing, editing, adding, and deleting members.
- 📸 **Cloudinary Photo Uploads**: Admin photo uploads with automatic face detection, cropping, and WebP optimization.
- 🏷️ **Permanent QR Code Architecture**: The physical QR code URL (`/member/{memberId}`) remains permanent forever even if photo, role, contacts, or design are updated later.
- 🖨️ **High-Res & Vector QR Downloads**: Single-click downloads for **1024x1024 PNG**, **SVG Vector**, and **Print-Ready ID Card Back Badges**.
- 📦 **Bulk QR Export**: "Generate All QR Codes" generates high-res PNGs for all registered members and downloads them inside a single `.zip` archive (`CSI_KARE_80_QR_CODES.zip`).
- 🛡️ **Invalid Profile Handling**: Visiting a non-existent member ID (e.g. `/member/CSI26-999`) gracefully renders a clean "PROFILE NOT FOUND" page without exposing database errors.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router 7
- **Database & Auth**: Firebase Firestore & Firebase Authentication
- **Media Hosting**: Cloudinary
- **Icons & Visuals**: Lucide React & Custom Brand SVGs
- **QR Generation**: `qrcode`, `qrcode.react`, `jszip`, `file-saver`

---

## 🚀 Getting Started

### 1. Installation

Clone or open the project folder and install dependencies:

```bash
npm install
```

### 2. Environment Variables Setup

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Firebase Web App Credentials
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=csi-id-info.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=csi-id-info
VITE_FIREBASE_STORAGE_BUCKET=csi-id-info.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Cloudinary Credentials
VITE_CLOUDINARY_CLOUD_NAME=dxwuwjdgf
VITE_CLOUDINARY_UPLOAD_PRESET=CSI-ID-INFO
VITE_CLOUDINARY_API_KEY=944146294165256
VITE_CLOUDINARY_API_SECRET=px_8rm87Vjdjgt1wPosTS-hcqEM

# Optional Custom Domain for QR code generation (default uses window.location.origin)
# VITE_CUSTOM_DOMAIN=https://csikare.org
```

### 3. Run Locally

Start the Vite development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🔐 Firebase Setup Guide

### 1. Firebase Web App Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/) and open your project (`csi-id-info`).
2. Go to **Project Settings > General > Your Apps**.
3. Add a **Web App** (named `CSI KARE Web`) and copy the `firebaseConfig` keys into your `.env` file.

### 2. Firebase Authentication
1. In Firebase Console, go to **Build > Authentication**.
2. Click **Get Started** and enable the **Email / Password** sign-in method.
3. Add an admin user (e.g. `admin@csikare.org` with a secure password).

### 3. Firestore Database & Security Rules
1. In Firebase Console, go to **Build > Firestore Database** and create a database in production mode.
2. Publish the included `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /members/{memberId} {
      // Anyone can view member profiles by scanning QR
      allow read: if true;
      // Only authenticated admins can add/update/delete profiles
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📸 Cloudinary Photo Upload Setup

1. In your [Cloudinary Console](https://console.cloudinary.com/), go to **Settings > Upload**.
2. Under **Upload presets**, click **Add upload preset**.
3. Set the preset name to `CSI-ID-INFO` and set Signing Mode to **Unsigned** (or use the configured API Key & Secret for signed direct uploads).
4. Save the preset.

---

## 📂 Firestore Member Schema

Each document in the `members` collection is keyed by its permanent `memberId`:

```
members/
  ├── CSI26-001 (Document)
  ├── CSI26-002 (Document)
  └── ...
```

**Document Structure:**
```json
{
  "memberId": "CSI26-001",
  "name": "Krishna Chaithanya",
  "role": "Core Team Lead",
  "year": "3rd Year",
  "photoUrl": "https://res.cloudinary.com/...",
  "instagram": "https://instagram.com/csikare",
  "linkedin": "https://linkedin.com/company/csi-kare",
  "email": "krishna.csi@klu.ac.in",
  "phone": "+91 9876543210",
  "createdAt": "2026-09-28T10:00:00.000Z",
  "updatedAt": "2026-09-28T10:00:00.000Z"
}
```

---

## 💻 Admin Workflow

1. Open `/admin/login` and enter your admin credentials.
2. In the **Admin Dashboard** (`/admin`):
   - **Sync Initial 80**: Click "Sync Initial 80" to populate all 80 baseline records (`CSI26-001` to `CSI26-080`).
   - **Add New Member**: Dynamically add new members (`CSI26-081`, etc.) at any time.
   - **Edit Member**: Update names, roles, academic years, upload Cloudinary photos, and enter Instagram/LinkedIn/Email/Phone links.
   - **QR Code**: Preview the high-resolution QR modal, download PNG, SVG, or printable ID card badges.
   - **Generate All QR Codes**: One-click bulk generation to download all QR codes packaged inside a ZIP file.

---

## 🚀 Deployment to Firebase Hosting

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Login and deploy with Firebase CLI:
   ```bash
   npx firebase login
   npx firebase deploy
   ```

---

## 🏛️ CSI KARE Student Chapter
Kalasalingam Academy of Research and Education • Core Team 2026–27
