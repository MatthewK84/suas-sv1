# Shaw AFB C-UAS SV-1 — Multi-Modal Architecture Diagram

Interactive DoDAF SV-1 Systems Interface Description for a multi-modal Counter-UAS detection and electronic redirect mesh architecture at Shaw AFB, Sumter SC.

## Features
- **4-Phenomenology Visualization**: RF (DF+TDOA), Acoustic (MEMS BF), EO/IR (Thermal+HD), Radar (K-band ESA)
- **Interactive Hover/Click**: Every node shows detailed technology specifications and kill chain role
- **Toggleable Layers**: RF coverage, EA range, radar coverage, mesh network, facility overlays
- **66 DF Sub-Nodes**: 22 sensor locations with 3-element interferometric direction-finding arrays
- **18 EchoGuard Radars**: 6 towers providing 360° hemispherical coverage

## System Cost: $956,945

| Layer | Cost |
|---|---|
| RF Sensor Clusters (17 nodes, 51 DF sub-nodes) | $65,688 |
| EA Nodes w/ DF Array (5 nodes, 15 DF sub-nodes) | $85,740 |
| C2 Server & Infrastructure | $82,200 |
| Acoustic / EO-IR Augmentation (12 + 6) | $121,296 |
| Echodyne EchoGuard Radar (6 towers, 18 units) | $442,530 |
| Contingency + S&H (20%) | $159,491 |

## Deploy to Railway

### Option 1: One-click via Dockerfile
1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Railway auto-detects the Dockerfile and builds/deploys
4. App serves on port 3000

### Option 2: Via Railway CLI
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option 3: Manual
```bash
npm install
npm run build
npx serve dist -s -l 3000
```

## Tech Stack
- React 18 + Vite 6
- SVG-based interactive diagram
- Fonts: Oxanium (headers), IBM Plex Mono (data)
- Dockerfile for containerized deployment

## Classification
**UNCLASSIFIED // FOUO**
All node positions are approximate and based on publicly available satellite imagery. Final placement requires site survey and RF propagation modeling.
