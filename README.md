# WorkSphere - Mobile HR Management System

**WorkSphere** is a professional, full-stack mobile HR Management System designed specifically for **Visartech** (Technology & Digital Solutions).

---

## 🏢 Project Background
- **Client Company:** Visartech
- **Industry:** Technology and Digital Solutions
- **Team Size:** 6 Employees, 1 HR Administrator
- **Target Platforms:** Android (Primary Testing Platform) and iOS
- **Development Environment:** Cross-platform (Windows / macOS / Linux)

---

## 🛠️ Technology Stack

### Frontend (Initialized)
- **Framework:** React Native with Expo (SDK 58)
- **Language:** JavaScript
- **Routing & Navigation:** Expo Router (file-based navigation with tabs and stacks)
- **Styling:** React Native `StyleSheet` with centralized corporate design tokens (`src/constants/theme.js`)
- **Safe Area & Screens:** `react-native-safe-area-context`, `react-native-screens`
- **Iconography:** `@expo/vector-icons` (Ionicons)

### Backend (Planned for Subsequent Phases)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Security:** JWT authentication & bcrypt password hashing

---

## 📂 Project Folder Structure

```
WorkSphere/
├── app/                              # Expo Router File-Based Routing
│   ├── _layout.jsx                   # Root layout (SafeAreaProvider, AuthProvider, Stack)
│   ├── index.jsx                     # Welcome & landing splash screen
│   ├── (auth)/                       # Authentication Route Group
│   │   ├── _layout.jsx               # Auth stack navigator
│   │   └── login.jsx                 # Modern corporate login with role switching
│   ├── (tabs)/                       # Main Bottom Tab Navigator
│   │   ├── _layout.jsx               # Tab navigator configuration & icons
│   │   ├── index.jsx                 # HR Dashboard (KPI stats, check-in, announcements)
│   │   ├── modules.jsx               # Directory of all 8 planned HR modules
│   │   └── profile.jsx               # User & Visartech company profile screen
│   └── modal.jsx                     # System architecture & specs modal
├── src/                              # Scalable Application Core
│   ├── components/                   # Reusable UI Component Library
│   │   ├── common/
│   │   │   ├── Button.jsx            # Primary, outline, danger, ghost variants & loaders
│   │   │   ├── Card.jsx              # Rounded corporate cards with shadows & elevation
│   │   │   ├── Header.jsx            # Top navigation header bar with back actions
│   │   │   ├── Input.jsx             # Form inputs with icons, validation & helpers
│   │   │   ├── Badge.jsx             # Status and role badges (HR Admin, Employee, etc.)
│   │   │   ├── Avatar.jsx            # User avatar with fallback initials & status dot
│   │   │   └── StatCard.jsx          # KPI metric cards for HR dashboard
│   │   ├── feedback/
│   │   │   └── EmptyState.jsx        # Standard placeholder for future module sections
│   │   └── index.js                  # Centralized component exports
│   ├── constants/
│   │   ├── theme.js                  # Design tokens: palette, typography, spacing, radius, shadows
│   │   └── company.js                # Visartech company metadata, roles, and 8 module definitions
│   ├── context/
│   │   └── AuthContext.jsx           # Global authentication and role state management
│   ├── hooks/
│   │   ├── useAuth.js                # Hook to access user, role, and role toggling
│   │   └── useTheme.js               # Hook to access design tokens
│   └── utils/
│       ├── formatting.js             # Date, time, and name initials formatters
│       └── responsive.js             # Screen scaling and platform checks
├── assets/                           # App icons, splash, and adaptive icons
├── app.json                          # Expo configuration (name, slug, scheme, plugins)
├── package.json                      # Project dependencies and scripts
└── .npmrc                            # Dependency resolution settings
```

---

## 📦 Installed Dependencies

| Dependency | Purpose |
| :--- | :--- |
| `expo` (`~58.0.26`) | Core Expo SDK runtime |
| `expo-router` (`~58.0.32`) | File-based navigation system |
| `expo-constants` (`~58.0.16`) | Access to system constants and configuration |
| `expo-linking` (`~58.0.17`) | Deep linking support |
| `expo-status-bar` (`~58.0.5`) | Cross-platform status bar styling |
| `react` (`19.3.0`) & `react-native` (`0.88.1`) | Core React Native mobile framework |
| `react-native-safe-area-context` (`~5.11.1`) | Inset and notch handling for modern phones |
| `react-native-screens` (`~4.30.1`) | Native screen primitives for optimized stack navigation |
| `@expo/vector-icons` | Vector icons (Ionicons) for mobile interface |

---

## 🚀 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm start
# or
npx expo start
```

### 3. Testing on Android (Expo Go)
1. Install **Expo Go** from Google Play Store on your Android device.
2. Ensure your computer and Android device are on the same Wi-Fi network (or use `npx expo start --tunnel`).
3. Scan the QR code displayed in your terminal with the Expo Go app.

### 4. Testing on Android Emulator (e.g. Windows / Android Studio)
1. Launch your Android Virtual Device (AVD) from Android Studio.
2. In the terminal, start the project and press `a`:
```bash
npm run android
# or press 'a' in the interactive Expo CLI
```

### 5. Testing on iOS Simulator (Optional)
```bash
npm run ios
# or press 'i' in the interactive Expo CLI
```

---

## 👥 Dual User Roles Preview

The application includes an instant role toggle on the Dashboard and Profile screens:
- **HR Administrator (`Elena Rostova`):** Shows company-wide metrics (6/6 attendance, pending leave approvals, company-scope KPIs).
- **Employee (`Alex Turner`):** Shows personal attendance status, leave balance (14 days), assigned sprint tasks, and interactive check-in/check-out toggle.
