# 🎮 Roblox Studio Web (3D Game Creator & Publisher)

> A full-featured, high-performance web recreation of **Roblox Studio (.exe)** built with **React**, **Three.js**, and **TypeScript**. Build 3D worlds, write Luau scripts, test games with an interactive 3D avatar, and publish games to the community gallery.

🌐 **Live Demo Website:** [https://opstudio-web.vercel.app](https://opstudio-web.vercel.app)

---

## ✨ Features

- **Authentic Studio Desktop Interface**:
  - Full Dark Theme matching official Roblox Studio desktop styling (`#26262b` / `#1e1e24` / `#323238`).
  - **Ribbon Bar**: Home, Model, Test, View, and Plugins tabs with authentic tool layouts.
  - **Document Tabs**: Multi-tab workspace with `[🎮 Workspace]` and `[📄 Script.lua]` tabs.
  - **File Menu**: Save Place to `.rbxl` file, Open Place, and Publish to Roblox.

- **⚡ Cannon.js Real-Time Rigid Body Physics**:
  - Full integration of **Cannon.js** (`cannon-es`): real gravity (`-28 m/s²`), rigid body collisions, friction, and restitution.
  - **Dynamic Unanchored Objects**: Push wooden crates pyramid, watch domino chains topple with physics, and kick bouncy beach balls.
  - **Player Physics Body**: 65kg avatar capsule with momentum transfer that physically knocks and pushes unanchored objects.
  - **Procedural Collision & Footstep Audio**: Material-based collision impact sounds (wood, metal, plastic) and walking footsteps via Web Audio API.
  - **💥 Physics Blast Impulser**: Trigger explosive impulse waves that blast unanchored parts through the air!

- **📱 Phone-Optimized Android & Desktop UI Modes**:
  - **1-Tap UI Switch**: Toggle instantly between **`📱 Android / Mobile UI`** and **`💻 Desktop Studio UI`** in App Settings or TopBar.
  - **Phone Layout**: Full-screen 3D viewport, ergonomic bottom dock, and sliding bottom sheets for Explorer, Properties, Toolbox, and Console.
  - **Touch Thumb Controls**: On-screen D-Pad with **`U` (Up)**, **`D` (Down)**, **`L` (Left)**, **`R` (Right)**, and **`JUMP` (Space)** with adjustable opacity.

- **3D World Building & Transform Tools**:
  - **Transform Gizmos**: Select (`1`), Move (`2`), Scale (`3`), and Rotate (`4`) with active 3D colored axis handles.
  - **Part Inserter**: Block, Sphere, Cylinder, Wedge, SpawnLocation, 🔥 Lava Kill Hazards, 🪙 Collectible Coins, ⚡ Trampolines, and Speed Boost Pads.
  - **Material & BrickColors**: Plastic, SmoothPlastic, Neon, Wood, Metal, Grass, Brick, Glass, and authentic Roblox BrickColors.
  - **Physics & Mechanics**: Live toggles for `Anchored` and `CanCollide`.

- **Real Play Mode (F5 Testing)**:
  - Spawns an animated **3D Roblox R6 Character** (yellow head/arms, blue torso, green legs, classic smiley face, red builder cap).
  - Smooth third-person orbital camera with mouse look.
  - Classic **"Oof!"** death sound and ragdoll block-shatter effect on lava contact.
  - Collectible coins with shiny Web Audio chime and live leaderboard tracking.
  - Roblox TopBar with in-game Chat, Health Bar, and Esc Pause Menu.

- **Explorer & Properties Panels**:
  - **Explorer Tree**: `Workspace`, `Camera`, `Baseplate`, `NPCs`, `Lighting`, `ReplicatedStorage`, and `StarterPlayer`.
  - **Properties Grid**: True 2-column live inspection for Data, Appearance, Transform, and Collision properties.

- **Luau Script Editor & Output Console**:
  - Tabbed code editor with line numbers and Luau snippets (Lava kill, spinning rotor, coin rewards, fading platforms, rainbow colors).
  - Real-time Output console with filterable print, warning, error logs and interactive Command Bar (`>`).

- **Creator Toolbox & Discover Gallery**:
  - 1-click model inserter: Medieval Castle Tower, Trampoline, Lava Floor, Zombie Dummy NPC, Street Lamps.
  - Pre-built playable games: **⭐ Super Obby Tower 3D**, **🌋 Lava Escape Volcano**, and **🛠️ Sandbox Baseplate**.
  - **.rbxl JSON Import & Export**: Download place files or load community creations.

- **Android Native App (PWA & APK Ready)**:
  - **1-Tap PWA Install**: Android users visiting [https://opstudio-web.vercel.app](https://opstudio-web.vercel.app) in Chrome/Edge can tap **"Install App"** to install directly to their home screen as a standalone Android app with native icon and splash screen.
  - **On-Screen Mobile Touch D-Pad**: High-visibility touch buttons for **`U` (Up)**, **`D` (Down)**, **`L` (Left)**, **`R` (Right)**, and **Jump (Space)**.
  - **Multi-Touch Viewport**: 1-finger swipe to rotate 360° camera, 2-finger pinch-to-zoom.
  - **Google Play & .APK Packaging**: 100% compliant with **PWABuilder** to export `.apk` / `.aab` for Google Play Store.

- **Smart TV & Cross-Device Compatibility**:
  - Built with `@vitejs/plugin-legacy` so it runs smoothly on Smart TVs (Android TV, Samsung Tizen, LG webOS), tablets, and desktops.
  - Auto-fallback for lower-power TV WebGL GPUs.

---

## 📱 Android App & APK Guide

### Option 1: 🚀 GitHub Actions Se Automatic APK Build (Direct .APK Download)
Project me automated GitHub Actions CI/CD setup kiya hua hai (`.github/workflows/build-apk.yml`):

1. **Code ko GitHub par Push karein:**
   ```bash
   git add .
   git commit -m "Add Android APK build workflow"
   git push origin main
   ```
2. **Workflow Run karein:**
   - Apne GitHub repository me jayein aur **"Actions"** tab par click karein.
   - Left sidebar me **"📱 Build Android APK"** select karein.
   - Right side me **"Run workflow"** button par click karke branch select karein (`main`) aur **"Run workflow"** daba dein (ya kisi bhi push par ye automatically chal jayega).
3. **APK Download karein:**
   - Workflow complete hone par run par click karein (Green checkmark `✓`).
   - Page ke bottom me **"Artifacts"** section me jayein.
   - **`Roblox-Studio-Web-Debug-APK`** par click karke ZIP download karein.
   - Extract karke `app-debug.apk` ko apne Android phone me install karein!

### Option 2: Install Directly on Android (Fastest, No APK required)
1. Open [https://opstudio-web.vercel.app](https://opstudio-web.vercel.app) in **Google Chrome** on your Android phone or tablet.
2. Tap the **"📲 Install App"** button at the top, or tap Chrome's three dots (`⋮`) menu $\rightarrow$ **"Install app"** / **"Add to Home screen"**.
3. The app is now installed on your Android app drawer with full-screen view, offline support, and touch controls!

### Option 3: Generate an Android `.apk` / `.aab` (PWABuilder)
1. Go to [PWABuilder.com](https://www.pwabuilder.com).
2. Enter your live URL: `https://opstudio-web.vercel.app`.
3. Click **"Start"** $\rightarrow$ **"Package for Android"**.
4. Download your signed **`.apk`** or Google Play **`.aab`** file!

---

## 🕹️ Controls Guide

| Input | Action |
| :--- | :--- |
| **`U`** or **`W`** / **`↑`** | Move Up / Forward |
| **`D`** or **`S`** / **`↓`** | Move Down / Backward |
| **`L`** or **`A`** / **`←`** | Move Left |
| **`R`** or **`→`** | Move Right |
| **`Space`** | Jump (In Play Mode) |
| **Mouse Drag** (Left or Right Click) | 360° Camera View / Orbit |
| **Scroll Wheel** | Zoom In / Zoom Out |
| **Middle Click** / **Alt + Drag** | Pan Camera |
| **`F5`** | Start / Stop Simulation |
| **`Ctrl + Z`** | Undo |
| **`Ctrl + Y`** | Redo |
| **`Ctrl + S`** | Save Place File |
| **`Ctrl + D`** | Duplicate Selected Part |
| **`Delete`** / **`Backspace`** | Delete Selected Part |

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **3D Graphics Engine**: Three.js (WebGL / WebGL2 with software GL fallback)
- **Styling**: Tailwind CSS
- **Audio Synthesis**: Web Audio API (100% procedural sounds, zero external 404 dependencies)
- **Bundler & Tooling**: Vite 8 + `@vitejs/plugin-legacy`
- **Hosting & Deployment**: Vercel (SPA routing configured in `vercel.json`)

---

## 🚀 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/roblox-studio-web.git
   cd roblox-studio-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
   Production assets will be generated in the `dist/` directory.

---

## 🌐 Deployment to Vercel

The project is pre-configured with `vercel.json` for single-page application rewrites.

### Quick Deploy with Vercel CLI:
```bash
npm i -g vercel
vercel --prod
```

### Deploy via GitHub:
1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Click **Deploy**. Vercel will automatically detect Vite and publish your site!

---

## 📄 License

Apache-2.0 License. Made for builders and creators!
