# 🔥 NightFlame BBQ — Firebase Setup Guide

Follow these steps to connect the app to your Firebase project.

---

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"** → Name it `NightFlame BBQ` (or your preferred name)
3. Disable Google Analytics (optional for MVP)
4. Click **Create Project**

---

## 2. Add Android App

1. In Firebase Console → **Project Settings** → **Add App** → **Android**
2. Package name: `com.flamegrill.app`
3. App nickname: `NightFlame BBQ Android`
4. Download **`google-services.json`**
5. Place it in: `android/app/google-services.json`

---

## 3. Add iOS App (Optional)

1. In Firebase Console → **Add App** → **iOS**
2. Bundle ID: `com.flamegrill.app`
3. Download **`GoogleService-Info.plist`**
4. Place it in: `ios/Runner/GoogleService-Info.plist`

---

## 4. Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Phone** authentication
3. Enable **Email/Password** authentication
4. For testing, add test phone numbers in the Firebase Console

---

## 5. Create Firestore Database

1. Go to **Firestore Database** → **Create Database**
2. Select **Start in test mode** (we'll deploy security rules later)
3. Choose the nearest region

---

## 6. Deploy Security Rules

Copy the contents of `firestore.rules` from this project and paste into:
**Firestore** → **Rules** tab → **Publish**

---

## 7. Create Admin Account

1. Go to **Authentication** → **Users** → **Add User**
2. Enter admin email and password
3. Copy the **User UID**
4. Go to **Firestore** → **users** collection → **Add document**
5. Document ID: (paste the UID)
6. Fields:
   - `phoneNumber`: (string) admin phone or email
   - `role`: (string) `admin`
   - `createdAt`: (timestamp) now

---

## 8. Firebase Cloud Messaging (Optional)

1. Go to **Cloud Messaging** → Enable
2. For push notifications, additional setup is needed:
   - Android: Add FCM to `android/app/build.gradle`
   - iOS: Upload APNs certificate

---

## 9. Run the App

```bash
flutter pub get
flutter run
```

---

## Firestore Collections Structure

```
users/
  {userId}/
    phoneNumber: string
    createdAt: timestamp
    role: "customer" | "admin"

menu/
  {itemId}/
    name: string
    description: string
    price: number
    imageUrl: string
    available: boolean

orders/
  {orderId}/
    userId: string
    userPhone: string
    items: array
      - itemId: string
        name: string
        price: number
        quantity: number
        totalPrice: number
    totalAmount: number
    pickupTime: timestamp
    status: "Pending" | "Preparing" | "Ready" | "Completed"
    timestamp: timestamp
```
