SHare My FIles — P2P File Sharing (Web)

Overview
SHare My FIles is a modern, peer‑to‑peer (P2P) file sharing web app built with React + Vite. It uses WebRTC (via PeerJS) to connect devices directly in the browser so you can share files quickly without uploading them to a server.

Key Features
- Instant device pairing using shareable Peer IDs and quick share URLs
- Drag & drop file selection with multi-file transfer queue
- Realtime progress indicators and transfer stats
- Device list with online/offline presence and last-seen
- Robust cancel logic:
  - Single connection: cancel on both sides automatically
  - Multiple connections: receiver cancel affects only itself; sender cancel cancels for all
- Light/Dark theme with a theme toggle
- Friendly toasts and status badges (sonner)

Tech Stack
- React + TypeScript + Vite
- PeerJS (WebRTC data channels)
- Tailwind CSS (utility-first styling)
- sonner (toasts)

Project Structure (high level)
- src/
  - App.tsx — App composition and wiring
  - components/
    - NetworkPanel.tsx — Peer ID, quick share, connect controls
    - NetworkStats.tsx — KPI cards (devices, active, transferred, etc.)
    - FileManager.tsx — file selection, start/cancel all, dropzone
    - TransferQueue.tsx — per-file rows with progress + actions
    - DeviceTransfer.tsx — device list and disconnect controls
    - ThemeToogle.tsx — theme toggle button
  - hooks/
    - usePeerNetwork.ts — PeerJS lifecycle, connections, data handler bridge
    - useTransfers.ts — file queue, chunking, progress, cancel logic
    - useTheme.ts — theme persistence + DOM sync
  - constants/
    - types.ts — shared types and component prop contracts
    - constant.ts — constants like CHUNK_SIZE
  - ui/ — shared UI primitives (button, card, input, progress, badge)

Getting Started
Prerequisites
- Node.js 18+
- npm 9+

Install
```bash
npm install
```

Run (Development)
```bash
npm run dev
```
This starts Vite on a local dev server. Open the printed URL in your browser. For P2P testing, open the app in two different browsers/devices (or one normal + one incognito window) and connect using the Peer ID or quick share URL.

Build (Production)
```bash
npm run build
npm run preview
```

How It Works
1) Networking (usePeerNetwork)
- Initializes a PeerJS instance and exposes the generated Peer ID
- Listens for incoming connections; tracks devices and connection state
- Bridges incoming data messages to the app via a pluggable handler (setOnDataHandler)

2) Transfers (useTransfers)
- Accepts selected files, splits into 16KB chunks (configurable via CHUNK_SIZE)
- Broadcasts chunks to all connected devices marked online
- Tracks progress and timings; updates Transfer Queue UI
- Cancellation rules:
  - One connection → cancel for both sides
  - Multiple connections → receiver cancel cancels only for that device; sender cancel cancels for all
- Sends file-cancel/file-cancel-all messages to peers; receivers update state instantly

3) UI Composition
- NetworkPanel: copy Peer ID/URL, connect to device, reconnect, disconnect all
- FileManager: select files, start/cancel all, dropzone
- TransferQueue: itemized list with progress and actions
- DevicesPanel: online devices with quick disconnect
- NetworkStats: KPIs (total devices, active transfers, etc.)

Environment & Configuration
- STUN servers are configured in usePeerNetwork (Google + Twilio). You can add TURN servers for NAT traversal if needed.
- CHUNK_SIZE is defined in src/constants/constant.ts.

Security & Privacy
- WebRTC data channels connect directly peer-to-peer where possible
- No file content is uploaded to a central server
- Clipboard operations are explicit (user-triggered)

Troubleshooting
- Cannot connect: ensure both devices can reach STUN/TURN and are not blocked by network policy. Try different networks/VPN or add TURN servers.
- No Peer ID: refresh the page; check browser console for errors
- Transfers stuck: try reconnecting devices; verify both sides are “Online”
- Cancels not propagating: Ensure both peers are on the same app version and connected at the time of cancel

Roadmap Ideas
- Optional TURN server integration + config
- Per-recipient selection when multiple devices are connected
- Resumable transfers and integrity checks
- QR codes for sharing quick connect URLs

Contributing
1. Fork the repo and create a feature branch
2. Make your changes with clear commits
3. Ensure lint passes and the app builds
4. Open a PR with a concise description and screenshots (if UI changes)

License
MIT — see LICENSE file (or add one) for details.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
