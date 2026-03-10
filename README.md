# Shaw AFB C-UAS SV-1 — Full Installation Multi-Modal Architecture

Interactive DoDAF SV-1 Systems Interface Description for a multi-modal Counter-UAS detection and non-kinetic electronic redirect mesh architecture covering the **complete Shaw AFB installation**, including the Main Cantonment (west) and ARCENT/Third Army HQ Eastern Extension.

---

## Features

- **Full Shaw AFB Coverage** — Main Cantonment, Flight Line, Munitions Storage, ARCENT/3rd Army HQ, CATM Range, Fam Camp, Housing.
- **4-Phenomenology Visualization** — RF (DF+TDOA), Acoustic (MEMS Beamforming), EO/IR (Thermal+HD), Radar (K-band ESA).
- **Interactive Hover/Click** — Every node displays detailed technology specifications, kill chain sequence, key specs, and system counts.
- **Toggleable Layers** — RF sensor coverage, EA effective range, EchoGuard radar coverage, mesh network links, facility overlays.
- **120 DF Sub-Nodes** — 40 sensor locations (30 passive + 10 EA) each with 3-element interferometric direction-finding arrays.
- **30 EchoGuard Radars** — 10 towers providing overlapping 360° hemispherical coverage across the entire installation.
- **Dual C2 Architecture** — Primary server (Cantonment) + Secondary server (ARCENT East) linked via fiber backbone.

---

## Architecture Overview

The system employs four independent sensor phenomenologies to ensure no sUAS threat profile can evade all detection layers simultaneously:

### RF (DF + TDOA)

40 locations with 3-element interferometric direction-finding arrays passively detect any sUAS, maintaining an active control link across 70 MHz – 6 GHz. Local angle-of-arrival vectors fuse with macro TDOA multilateration for sub-second geolocation.

### Acoustic (MEMS Beamforming)

24 arrays of 16-element Knowles MEMS microphones detect propeller acoustic signatures. Effective against RF-silent autonomous platforms with no active control link.

### EO/IR (Thermal + HD PTZ)

12 SPI M1-D stabilized thermal/HD turrets with AI auto-tracking. Cued by acoustic or RF detections for visual confirmation and continuous tracking.

### Radar (K-band ESA)

30 Echodyne EchoGuard units across 10 towers. All-weather, all-lighting, range-rate capable. Detects every aerial target regardless of RF emissions, GPS usage, or lighting conditions. Closes every remaining detection gap.

### Non-Kinetic Defeat

10 EA nodes employ layered countermeasures — protocol-aware command injection (RTH/land), targeted control-link jamming (forces autopilot failsafe), and GPS L1 spoofing (redirects via gradual position offset). All three mechanisms fire simultaneously against detected threats.

---

## Total Asset Count

| Asset | Count |
| :--- | ---: |
| RF Sensor Clusters (3-element DF) | 30 |
| Electronic Attack Nodes w/ DF | 10 |
| Total DF Sub-Node Apertures | 120 |
| EA Transmitters (X310 + UBX-160) | 10 |
| Echodyne EchoGuard ESA Radars | 30 |
| Acoustic MEMS Arrays | 24 |
| EO/IR Thermal Tracking Turrets | 12 |
| C2 Fusion Servers | 2 |
| **Total Sensor Locations** | **40** |
| **Sensor Phenomenologies** | **4** |

---

## System Cost: $1,643,758

| Layer | Cost |
| :--- | ---: |
| RF Sensor Clusters (30 nodes, 90 DF sub-nodes) | $115,920 |
| EA Nodes w/ DF Array (10 nodes, 30 DF sub-nodes, 10 TX) | $171,480 |
| Dual C2 Servers & Infrastructure (Primary + Secondary) | $117,590 |
| Acoustic / EO-IR Augmentation (24 arrays + 12 turrets) | $200,592 |
| Echodyne EchoGuard Radar (10 towers, 30 units) | $722,550 |
| Contingency (15%) + S&H (5%) + Site Survey | $315,627 |

---

## Key Design Decisions

- **All nodes interior to installation boundary** — No sensors outside the wire per operational constraint.
- **3-element DF at every node** (including EA nodes) — Enables instantaneous local bearing without waiting for multi-node TDOA convergence.
- **Dual C2 servers** — Primary at cantonment, secondary at ARCENT East, connected via fiber backbone for redundancy and reduced eastern mesh latency.
- **Solar-powered passive nodes** — RF sensor clusters and acoustic arrays run on 200W solar + LiFePO4 batteries, eliminating hardwired power dependency for the majority of the mesh.
- **EA nodes hardwired** — Transmit power requirements (~50W+ continuous during engagement) exceed practical solar capacity.
- **EchoGuard radar on 20 ft towers** — Elevates radar FOV above building clutter for improved low-altitude detection geometry.

---

## Getting Started

### Option 1: Deploy to Railway (One-Click)

1. Push this repo to GitHub.
2. Navigate to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Railway auto-detects the `Dockerfile` and builds/deploys.
4. The app serves on port `3000`. Railway assigns a public URL automatically.

### Option 2: Deploy via Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option 3: Local Development

```bash
npm install
npm run dev
```

### Option 4: Local Production Build

```bash
npm install
npm run build
npx serve dist -s -l 3000
```

---

## Project Structure

```
shaw-cuas-sv1/
├── Dockerfile           # Railway auto-detects, multi-stage build
├── package.json         # npm start serves production build on port 3000
├── vite.config.js       # Vite 6 config
├── index.html           # Entry point with Google Fonts preconnect
├── README.md
├── .gitignore
└── src/
    ├── main.jsx         # React 18 entry point
    └── App.jsx          # Full interactive SV-1 (all data, tooltips, rendering)
```

---

## Tech Stack

| Component | Detail |
| :--- | :--- |
| Framework | React 18 + Vite 6 |
| Rendering | SVG-based interactive diagram with hover/click state management |
| Fonts | Oxanium (military/technical headers), IBM Plex Mono (data/specs) |
| Container | Multi-stage Dockerfile, served via `serve` on port 3000 |
| Architecture | Single-file — all data, tooltips, and rendering in `App.jsx` (~400 lines) |
| Bundle Size | ~166 KB gzipped |

---

## NDAA Compliance Notes

| Component | Status |
| :--- | :--- |
| RFD900x modems | Compliant per Section 848 FY20 NDAA, Section 817 FY23 NDAA |
| Echodyne EchoGuard | US-designed and manufactured, ITAR-exempt, FCC authorized |
| Ettus Research B205mini-i / X310 | Verify current status (NI acquired by Emerson) |
| NVIDIA Jetson | Verify supply chain compliance for specific procurement vehicle |

---

## Disclaimer

All node positions are approximate and based on publicly available satellite imagery and the Shaw AFB Lodging Guest Directory base maps. Final placement requires an on-site survey, RF propagation modeling, antenna placement optimization, and coordination with the 20th Fighter Wing spectrum management office. GPS spoofing and electronic attack capabilities require appropriate authorization and spectrum deconfliction before activation.
