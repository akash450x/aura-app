# AURA — Personal Stylist (starter)

This is the first local prototype. It supports:
- Adding clothing photos by category
- Saving wardrobe items in browser IndexedDB
- Saving one personal reference photo locally
- Generating a basic outfit combination from uploaded items
- Installable PWA configuration

## Requirements
- Node.js 22 LTS (or a Vite-supported newer version)
- VS Code (recommended)

## Run on Windows
Open this folder in VS Code. Open Terminal > New Terminal, then run:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

## Important
This prototype stores photos locally in the browser on this device. It does not yet sync to your iPhone or use cloud AI. Do not upload sensitive images. Cloud sync, authentication, AI recommendations, and virtual try-on are later phases.
