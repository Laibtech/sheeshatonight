# 👑 SheeshaTonight Mobile App (iOS & Android)

Luxury cross-platform mobile application for **SheeshaTonight** — UAE's premier on-demand sheesha rental, catering, and marketplace platform. Built with **React Native** and **Expo**.

---

## 📱 Features

- **Royal VIP Dark & Gold Luxury Design**: Tailored for high-end clientele in Dubai, Abu Dhabi, and the GCC.
- **On-Demand Sheesha Rentals**: VIP Villa, Yacht, and Gala setups with certified Shisha Masters.
- **Flavor & Hookah Store**: Browse authentic European hookahs, 100+ premium tobacco flavors, bowls, and coals.
- **Smart Cart & UAE Delivery Calculator**: Real-time delivery calculations for Dubai, Abu Dhabi, and Sharjah with free delivery thresholds.
- **One-Tap WhatsApp VIP Concierge**: Direct deep-link booking and customer support.
- **Seamless Backend Integration**: Connects to the SheeshaTonight Next.js & MySQL REST API (`/api/products`, `/api/categories`, etc.) with graceful offline fallbacks.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start Expo Development Server
```bash
npm run start
```

### 3. Run on Devices

- **Physical Phone (iOS & Android)**:
  1. Install the **Expo Go** app from App Store or Google Play.
  2. Scan the QR code displayed in the terminal with your phone camera (iOS) or Expo Go app (Android).

- **Android Emulator**:
  ```bash
  npm run android
  ```

- **iOS Simulator (macOS required)**:
  ```bash
  npm run ios
  ```

- **Web Preview**:
  ```bash
  npm run web
  ```

---

## 🛠️ Project Structure

```text
mobile/
  App.tsx                 # Root tab bar navigation and layout
  app.json                # Expo configuration and metadata
  src/
    theme.ts              # Luxury color palette, spacing, typography
    types.ts              # Data contracts and TypeScript models
    services/
      api.ts              # API client, WhatsApp helpers, fallback data
    context/
      CartContext.tsx     # Global cart state & calculations
    screens/
      HomeScreen.tsx      # Hero, quick actions, featured catering setups
      RentalsScreen.tsx   # Villa, Yacht & Gala packages with feature lists
      ShopScreen.tsx      # Searchable product grid with category chips
      CartScreen.tsx      # Cart breakdown, Emirate selector, checkout
      ProfileScreen.tsx   # VIP member card, orders, addresses, hotline
```
