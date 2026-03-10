import { useState, useCallback, useRef, useEffect } from 'react'

// ─── DATA ─────────────────────────────────────────────
const PERIMETER = [
  [180,80],[420,55],[680,45],[820,70],[870,130],[890,250],[880,400],
  [850,520],[780,590],[620,630],[440,640],[280,610],[180,540],[140,420],[130,280],[145,160]
]
const RW = { x1:240, y1:180, x2:780, y2:480, w:14 }

const FACILITIES = [
  { id:"fl", label:"FLIGHT LINE", x:510, y:290, w:200, h:50, p:"CRITICAL" },
  { id:"cant", label:"CANTONMENT", x:350, y:440, w:140, h:60, p:"HIGH" },
  { id:"mun", label:"MUNITIONS", x:780, y:200, w:80, h:50, p:"CRITICAL" },
  { id:"pol", label:"POL", x:700, y:380, w:60, h:40, p:"HIGH" },
  { id:"cmd", label:"CMD/HQ", x:420, y:360, w:80, h:40, p:"HIGH" },
  { id:"ops", label:"OPS/INTEL", x:550, y:380, w:80, h:40, p:"HIGH" },
  { id:"bx", label:"SUPPORT", x:280, y:500, w:80, h:40, p:"MOD" },
]

const NODES = [
  // Passive RF Sensor Clusters
  { id:"S01", x:200, y:120, t:"sensor" }, { id:"S02", x:380, y:85, t:"sensor" },
  { id:"S03", x:570, y:70, t:"sensor" },  { id:"S04", x:750, y:80, t:"sensor" },
  { id:"S05", x:855, y:180, t:"sensor" }, { id:"S06", x:865, y:340, t:"sensor" },
  { id:"S07", x:840, y:500, t:"sensor" }, { id:"S08", x:720, y:590, t:"sensor" },
  { id:"S09", x:540, y:625, t:"sensor" }, { id:"S10", x:360, y:615, t:"sensor" },
  { id:"S11", x:210, y:550, t:"sensor" }, { id:"S12", x:155, y:400, t:"sensor" },
  { id:"S13", x:150, y:240, t:"sensor" }, { id:"S14", x:430, y:270, t:"sensor" },
  { id:"S15", x:640, y:320, t:"sensor" }, { id:"S16", x:310, y:380, t:"sensor" },
  { id:"S17", x:600, y:500, t:"sensor" },
  // EA Nodes
  { id:"EA1", x:460, y:180, t:"ea" },  { id:"EA2", x:680, y:260, t:"ea" },
  { id:"EA3", x:350, y:510, t:"ea" },  { id:"EA4", x:760, y:440, t:"ea" },
  { id:"EA5", x:520, y:440, t:"ea" },
]

const RADARS = [
  { id:"R1", x:220, y:160, desc:"NW Perimeter" },
  { id:"R2", x:700, y:100, desc:"NE Perimeter" },
  { id:"R3", x:870, y:370, desc:"E Perimeter" },
  { id:"R4", x:700, y:580, desc:"SE Perimeter" },
  { id:"R5", x:250, y:520, desc:"SW Perimeter" },
  { id:"R6", x:500, y:310, desc:"Flight Line Interior" },
]

const C2 = { x:490, y:350 }

// ─── TOOLTIP CONTENT ──────────────────────────────────
const TIPS = {
  sensor: {
    title: "Passive RF Sensor Cluster",
    icon: "◉",
    color: "#00b4ff",
    role: "DETECT · CLASSIFY · GEOLOCATE",
    what: "A 3-element interferometric direction-finding array that passively listens for RF emissions from sUAS control links across 70 MHz – 6 GHz.",
    how: [
      "3x Ettus B205mini-i SDRs sample the same signal from 3 spatially separated antennas (3–5m triangular baseline)",
      "Phase-coherent receivers synchronized via GPS-disciplined 10 MHz reference clock compute instantaneous angle-of-arrival",
      "Local AoA vectors fuse with macro TDOA network across all 22 node locations for sub-second geolocation",
      "RF fingerprinting pipeline classifies platform type (DJI, ArduPilot, ExpressLRS, unknown) via spectral features",
      "Anomaly detection against learned RF baseline catches unknown/homebrew platforms that deviate from ambient"
    ],
    specs: [
      ["SDR", "3x Ettus B205mini-i (70 MHz–6 GHz)"],
      ["Compute", "NVIDIA Jetson Orin Nano Super (67 TOPS)"],
      ["Backhaul", "RFD900x mesh (NDAA compliant)"],
      ["Power", "200W solar + 100Ah LiFePO4"],
      ["Det. Range", "~2–3 km (Group 1 sUAS)"],
    ],
    count: "17 clusters · 51 DF sub-nodes"
  },
  ea: {
    title: "Electronic Attack + DF Cluster",
    icon: "▲",
    color: "#ff3c3c",
    role: "DETECT · REDIRECT · DEFEAT",
    what: "A dual-purpose node combining a 3-element DF array (identical to sensor nodes) with a high-power SDR transmitter for active electronic countermeasures against detected threats.",
    how: [
      "3-element DF array provides local bearing data + contributes to macro TDOA geolocation network",
      "USRP X310 with 2x UBX-160 daughterboards drives directional TX antennas toward threat bearing",
      "Protocol-aware command injection: spoofs RTH/land commands for known platforms (DJI OcuSync, MAVLink)",
      "Targeted barrage jamming: puts high-power noise precisely on the threat's control link frequencies",
      "GPS L1 spoofing: gradually walks the drone's position solution toward a redirect corridor away from protected assets",
      "All three EA mechanisms fire simultaneously — whichever takes effect first wins"
    ],
    specs: [
      ["DF Array", "3x B205mini-i + GPSDO"],
      ["EA TX", "Ettus X310 + 2x UBX-160"],
      ["PA", "10W @ 2.4 GHz / 5W @ 5.8 GHz"],
      ["Compute", "Jetson Orin NX 16 GB"],
      ["Power", "Hardwired AC + UPS"],
    ],
    count: "5 clusters · 15 DF sub-nodes · 5 TX"
  },
  radar: {
    title: "Echodyne EchoGuard Radar Tower",
    icon: "◆",
    color: "#00cc66",
    role: "DETECT · TRACK · CLASSIFY (ALL-WEATHER)",
    what: "Three K-band electronically scanned array (ESA) radars mounted on a 20 ft tower mast providing full 360° hemispherical coverage. Detects ALL aerial targets regardless of RF emissions, GPS usage, or lighting conditions — the 4th phenomenology that closes every remaining gap.",
    how: [
      "3x EchoGuard units each scan 120° azimuth x 80° elevation using thousands of electronically steered pencil beams",
      "Detects Group 1 sUAS at ~1 km via radar cross-section — works against RF-silent autonomous waypoint missions",
      "Doppler signature from spinning rotors enables classification even on hovering/stationary drones",
      "RadarHub fuses tracks across all 3 units per tower and hands off tracks between towers for continuous coverage",
      "High-fidelity track data (position + velocity + classification) feeds directly to C2 fusion engine via GigE API",
      "Radar-cued EA handoff: when radar detects a target, nearest EA node automatically slews and engages"
    ],
    specs: [
      ["Radar", "3x Echodyne EchoGuard ESA"],
      ["Band", "K-band (24.45–24.65 GHz)"],
      ["FOV", "120° Az x 80° El per unit"],
      ["Tracks", "20 simultaneous per unit"],
      ["SWaP", "1.25 kg/unit, IP67, <50W"],
    ],
    count: "6 towers · 18 radar units"
  },
  c2: {
    title: "C2 Fusion Server",
    icon: "■",
    color: "#ffcc00",
    role: "FUSE · DECIDE · COMMAND",
    what: "Central processing node that ingests data from all four sensor phenomenologies (RF, acoustic, EO/IR, radar), fuses tracks into a single common operating picture, runs the ML classification pipeline, and commands EA engagement.",
    how: [
      "Dell PowerEdge R660xs receives RF DF/TDOA tracks, acoustic bearings, EO/IR auto-tracker locks, and radar tracks",
      "Multi-modal sensor fusion engine correlates detections across phenomenologies into unified threat tracks",
      "ML classification model (PyTorch) assigns platform type and confidence score to each fused track",
      "Operator COP display shows all tracks, classifications, EA status, and engagement recommendations",
      "Automated EA trigger logic can engage without operator-in-the-loop for pre-authorized threat profiles",
      "All data logged for post-incident forensics and RF signature library building"
    ],
    specs: [
      ["Server", "Dell PowerEdge R660xs (Xeon, 64GB)"],
      ["GPU", "NVIDIA T1000 (ML inference)"],
      ["Network", "10 GbE + RFD900x mesh gateway"],
      ["UPS", "APC Smart-UPS 1500VA"],
      ["Software", "GNU Radio, PyTorch, Custom C2 UI"],
    ],
    count: "1 server (redundant)"
  },
}

// ─── HELPERS ──────────────────────────────────────────
const perimPath = PERIMETER.map(([x,y],i) => `${i===0?"M":"L"} ${x} ${y}`).join(" ") + " Z"
const rwAng = Math.atan2(RW.y2-RW.y1, RW.x2-RW.x1) * (180/Math.PI)

function meshLinks(nodes) {
  const out = []
  for (let i=0; i<nodes.length; i++)
    for (let j=i+1; j<nodes.length; j++)
      if (Math.hypot(nodes[i].x-nodes[j].x, nodes[i].y-nodes[j].y) < 220)
        out.push([i,j])
  return out
}
const links = meshLinks(NODES)

const pFill = p => p==="CRITICAL"?"rgba(255,60,60,0.22)":p==="HIGH"?"rgba(255,180,40,0.18)":"rgba(100,180,255,0.12)"
const pStroke = p => p==="CRITICAL"?"rgba(255,60,60,0.6)":p==="HIGH"?"rgba(255,180,40,0.5)":"rgba(100,180,255,0.35)"

// ─── COMPONENT ────────────────────────────────────────
export default function App() {
  const [hovered, setHovered] = useState(null) // { id, type, x, y }
  const [layers, setLayers] = useState({ rf:true, ea:true, radar:true, mesh:true, fac:true })
  const [pinned, setPinned] = useState(null)
  const svgRef = useRef(null)
  const toggle = k => setLayers(l => ({...l, [k]:!l[k]}))

  const active = pinned || hovered
  const tipData = active ? TIPS[active.type] : null

  const handleClick = (id, type, x, y) => {
    if (pinned && pinned.id === id) setPinned(null)
    else setPinned({ id, type, x, y })
  }

  const handleHover = (id, type, x, y) => setHovered({ id, type, x, y })
  const handleLeave = () => setHovered(null)

  return (
    <div style={{ background:"#060a10", minHeight:"100vh", fontFamily:"'IBM Plex Mono', monospace", color:"#b8c4d0" }}>
      {/* ─── HEADER ─── */}
      <header style={{ padding:"20px 28px 16px", borderBottom:"1px solid rgba(0,255,120,0.15)", display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"'Oxanium', sans-serif", fontSize:11, color:"#00ff88", letterSpacing:6, fontWeight:300 }}>DODAF SV-1 SYSTEMS INTERFACE DESCRIPTION</div>
          <h1 style={{ fontFamily:"'Oxanium', sans-serif", fontSize:22, fontWeight:700, color:"#e4ecf4", margin:"6px 0 0", letterSpacing:1.5 }}>MULTI-MODAL C-UAS DETECTION & REDIRECT</h1>
          <div style={{ fontSize:11, color:"#506070", marginTop:4 }}>Shaw AFB, Sumter SC&ensp;•&ensp;4-Phenomenology Architecture&ensp;•&ensp;All Nodes Interior to Installation Boundary</div>
        </div>
        <div style={{ fontSize:10, color:"#506070", textAlign:"right", lineHeight:1.7 }}>
          <div><span style={{ color:"#00ff88" }}>CLASSIFICATION:</span> UNCLASSIFIED // FOUO</div>
          <div style={{ fontFamily:"'Oxanium', sans-serif", fontSize:13, color:"#e4ecf4", fontWeight:600 }}>$956,945 TOTAL SYSTEM</div>
        </div>
      </header>

      <div style={{ display:"flex", gap:0 }}>
        {/* ─── MAP ─── */}
        <div style={{ flex:"1 1 0", padding:16, minWidth:0 }}>
          <svg ref={svgRef} viewBox="0 0 1000 700" style={{ width:"100%", height:"auto", background:"radial-gradient(ellipse at 50% 40%, #0e1520 0%, #080c14 100%)", borderRadius:8, border:"1px solid rgba(0,255,120,0.1)" }}>
            <defs>
              <radialGradient id="sg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(0,180,255,0.1)"/><stop offset="100%" stopColor="rgba(0,180,255,0)"/></radialGradient>
              <radialGradient id="eg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(255,60,60,0.08)"/><stop offset="100%" stopColor="rgba(255,60,60,0)"/></radialGradient>
              <radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(0,204,102,0.1)"/><stop offset="100%" stopColor="rgba(0,204,102,0)"/></radialGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="glow2"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,255,120,0.025)" strokeWidth="0.5"/></pattern>
            </defs>

            <rect width="1000" height="700" fill="url(#grid)"/>

            {/* Perimeter */}
            <path d={perimPath} fill="rgba(0,255,120,0.015)" stroke="rgba(0,255,120,0.4)" strokeWidth="1.5" strokeDasharray="10,5"/>
            <text x="132" y="135" fontSize="8" fill="rgba(0,255,120,0.5)" fontFamily="'Oxanium', sans-serif" letterSpacing="2">INSTALLATION BOUNDARY</text>

            {/* Runway */}
            <line x1={RW.x1} y1={RW.y1} x2={RW.x2} y2={RW.y2} stroke="rgba(200,200,200,0.2)" strokeWidth={RW.w}/>
            <line x1={RW.x1} y1={RW.y1} x2={RW.x2} y2={RW.y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="20,16"/>
            <text x={(RW.x1+RW.x2)/2-70} y={(RW.y1+RW.y2)/2-16} fontSize="9" fill="rgba(200,200,200,0.35)" fontFamily="'Oxanium', sans-serif" letterSpacing="2" transform={`rotate(${rwAng},${(RW.x1+RW.x2)/2-70},${(RW.y1+RW.y2)/2-16})`}>RUNWAY 04/22</text>

            {/* Facilities */}
            {layers.fac && FACILITIES.map(f => (
              <g key={f.id}>
                <rect x={f.x-f.w/2} y={f.y-f.h/2} width={f.w} height={f.h} fill={pFill(f.p)} stroke={pStroke(f.p)} strokeWidth="1" rx="3"/>
                <text x={f.x} y={f.y+4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="'Oxanium', sans-serif" fontWeight="600" letterSpacing="1">{f.label}</text>
              </g>
            ))}

            {/* Coverage layers */}
            {layers.rf && NODES.filter(n=>n.t==="sensor").map(n => <circle key={`c${n.id}`} cx={n.x} cy={n.y} r={160} fill="url(#sg)" stroke="rgba(0,180,255,0.08)" strokeWidth="0.5"/>)}
            {layers.ea && NODES.filter(n=>n.t==="ea").map(n => <circle key={`e${n.id}`} cx={n.x} cy={n.y} r={100} fill="url(#eg)" stroke="rgba(255,60,60,0.15)" strokeWidth="1" strokeDasharray="4,3"/>)}
            {layers.radar && RADARS.map(r => <circle key={`rv${r.id}`} cx={r.x} cy={r.y} r={130} fill="url(#rg)" stroke="rgba(0,204,102,0.15)" strokeWidth="1.5" strokeDasharray="6,4"/>)}

            {/* Mesh links */}
            {layers.mesh && links.map(([a,b],i) => <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke="rgba(0,255,120,0.08)" strokeWidth="0.7"/>)}
            {layers.mesh && [...NODES.filter(n=>n.t==="ea"),...RADARS].map(n => <line key={`c2${n.id}`} x1={n.x} y1={n.y} x2={C2.x} y2={C2.y} stroke="rgba(255,200,0,0.08)" strokeWidth="0.8" strokeDasharray="6,4"/>)}

            {/* C2 Server */}
            <g style={{cursor:"pointer"}} onMouseEnter={()=>handleHover("c2","c2",C2.x,C2.y)} onMouseLeave={handleLeave} onClick={()=>handleClick("c2","c2",C2.x,C2.y)}
              filter={active&&active.id==="c2"?"url(#glow)":undefined}>
              <rect x={C2.x-30} y={C2.y-16} width={60} height={32} fill={active&&active.id==="c2"?"rgba(255,200,0,0.3)":"rgba(255,200,0,0.12)"} stroke="rgba(255,200,0,0.7)" strokeWidth="1.5" rx="4"/>
              <text x={C2.x} y={C2.y+1} textAnchor="middle" fontSize="7" fill="rgba(255,200,0,0.9)" fontFamily="'Oxanium', sans-serif" fontWeight="700" letterSpacing="1">C2 SERVER</text>
              <text x={C2.x} y={C2.y+11} textAnchor="middle" fontSize="6" fill="rgba(255,200,0,0.5)" fontFamily="'IBM Plex Mono', monospace">FUSION</text>
            </g>

            {/* Radar towers */}
            {RADARS.map((r,i) => {
              const isA = active && active.id===r.id
              return (
                <g key={r.id} style={{cursor:"pointer"}} onMouseEnter={()=>handleHover(r.id,"radar",r.x,r.y)} onMouseLeave={handleLeave} onClick={()=>handleClick(r.id,"radar",r.x,r.y)}
                  filter={isA?"url(#glow)":undefined}>
                  <rect x={r.x-10} y={r.y-10} width={20} height={20} fill={isA?"#00cc66":"rgba(0,204,102,0.35)"} stroke="#00cc66" strokeWidth={isA?2.5:1.5} rx="3" transform={`rotate(45,${r.x},${r.y})`}/>
                  <text x={r.x} y={r.y+4} textAnchor="middle" fontSize="8" fill="#fff" fontFamily="'Oxanium', sans-serif" fontWeight="700">R</text>
                  <text x={r.x} y={r.y+26} textAnchor="middle" fontSize="7" fill={isA?"#fff":"rgba(0,204,102,0.7)"} fontFamily="'IBM Plex Mono', monospace">{r.id}</text>
                </g>
              )
            })}

            {/* Sensor & EA nodes */}
            {NODES.map((n,i) => {
              const isS = n.t==="sensor"
              const col = isS?"#00b4ff":"#ff3c3c"
              const isA = active && active.id===n.id
              const sz = isS ? 7 : 9
              return (
                <g key={n.id} style={{cursor:"pointer"}} onMouseEnter={()=>handleHover(n.id,n.t,n.x,n.y)} onMouseLeave={handleLeave} onClick={()=>handleClick(n.id,n.t,n.x,n.y)}
                  filter={isA?"url(#glow)":undefined}>
                  {/* DF triad indicators */}
                  <circle cx={n.x-7} cy={n.y+6} r={2.2} fill="none" stroke={`${col}${isA?"99":"44"}`} strokeWidth="0.8"/>
                  <circle cx={n.x+7} cy={n.y+6} r={2.2} fill="none" stroke={`${col}${isA?"99":"44"}`} strokeWidth="0.8"/>
                  <circle cx={n.x} cy={n.y-8} r={2.2} fill="none" stroke={`${col}${isA?"99":"44"}`} strokeWidth="0.8"/>
                  {/* Triad connecting lines */}
                  <line x1={n.x-7} y1={n.y+6} x2={n.x+7} y2={n.y+6} stroke={`${col}${isA?"44":"22"}`} strokeWidth="0.5"/>
                  <line x1={n.x+7} y1={n.y+6} x2={n.x} y2={n.y-8} stroke={`${col}${isA?"44":"22"}`} strokeWidth="0.5"/>
                  <line x1={n.x} y1={n.y-8} x2={n.x-7} y2={n.y+6} stroke={`${col}${isA?"44":"22"}`} strokeWidth="0.5"/>
                  {/* Main symbol */}
                  {isS ?
                    <circle cx={n.x} cy={n.y} r={sz} fill={isA?col:`${col}66`} stroke={col} strokeWidth={isA?2.5:1.5}/>
                    : <polygon points={`${n.x},${n.y-sz-2} ${n.x+sz+1},${n.y+sz-1} ${n.x-sz-1},${n.y+sz-1}`} fill={isA?col:`${col}66`} stroke={col} strokeWidth={isA?2.5:1.5}/>
                  }
                  <text x={n.x} y={n.y+(isS?22:26)} textAnchor="middle" fontSize="7" fill={isA?"#fff":`${col}88`} fontFamily="'IBM Plex Mono', monospace">{n.id}</text>
                </g>
              )
            })}

            {/* Scale & North */}
            <g transform="translate(40,665)">
              <line x1="0" y1="0" x2="90" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <line x1="0" y1="-4" x2="0" y2="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              <line x1="90" y1="-4" x2="90" y2="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              <text x="45" y="14" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="'IBM Plex Mono', monospace">~1 KM</text>
            </g>
            <g transform="translate(955,45)">
              <line x1="0" y1="18" x2="0" y2="-8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <polygon points="0,-12 -4,0 4,0" fill="rgba(255,255,255,0.4)"/>
              <text x="0" y="-18" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="'Oxanium', sans-serif" fontWeight="700">N</text>
            </g>
          </svg>
        </div>

        {/* ─── SIDE PANEL ─── */}
        <div style={{ flex:"0 0 340px", padding:"16px 20px 16px 4px", display:"flex", flexDirection:"column", gap:12, overflowY:"auto", maxHeight:"calc(100vh - 100px)" }}>

          {/* Layer controls */}
          <SideBlock title="LAYER CONTROLS">
            {[
              { k:"rf", label:"RF Sensor Coverage (2-3 km)", c:"#00b4ff" },
              { k:"ea", label:"EA Effective Range (1.2 km)", c:"#ff3c3c" },
              { k:"radar", label:"EchoGuard Radar (1 km)", c:"#00cc66" },
              { k:"mesh", label:"RFD900x Mesh Network", c:"#00ff88" },
              { k:"fac", label:"Facility Overlays", c:"#ffb428" },
            ].map(c => (
              <label key={c.k} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, cursor:"pointer", fontSize:11 }}>
                <div onClick={()=>toggle(c.k)} style={{ width:16, height:16, borderRadius:4, border:`2px solid ${c.c}`, background:layers[c.k]?`${c.c}30`:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
                  {layers[c.k] && <div style={{ width:8, height:8, borderRadius:2, background:c.c, transition:"all 0.2s" }}/>}
                </div>
                <span style={{ color: layers[c.k] ? "#c8d0d8" : "#506070" }}>{c.label}</span>
              </label>
            ))}
          </SideBlock>

          {/* Tooltip / Detail Card */}
          <div style={{
            background: tipData ? `linear-gradient(135deg, ${tipData.color}08, ${tipData.color}03)` : "rgba(255,255,255,0.02)",
            border: `1px solid ${tipData ? tipData.color+"40" : "rgba(0,255,120,0.1)"}`,
            borderRadius: 8, padding: 16, transition: "all 0.3s ease",
            minHeight: tipData ? "auto" : 120,
          }}>
            {tipData ? (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ fontSize:24, color:tipData.color }}>{tipData.icon}</span>
                  <div>
                    <div style={{ fontFamily:"'Oxanium', sans-serif", fontSize:14, fontWeight:700, color:"#e4ecf4" }}>{tipData.title}</div>
                    <div style={{ fontSize:9, color:tipData.color, letterSpacing:2, fontWeight:600, marginTop:2 }}>{tipData.role}</div>
                  </div>
                </div>

                <div style={{ fontSize:10, color:"#8898a8", lineHeight:1.7, marginBottom:14 }}>{tipData.what}</div>

                <div style={{ fontFamily:"'Oxanium', sans-serif", fontSize:9, color:"#00ff88", letterSpacing:2, marginBottom:8 }}>HOW IT WORKS IN THE KILL CHAIN</div>
                <div style={{ marginBottom:14 }}>
                  {tipData.how.map((step, i) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:6, fontSize:10, lineHeight:1.5 }}>
                      <span style={{ color:tipData.color, fontWeight:700, flexShrink:0, fontFamily:"'Oxanium', sans-serif" }}>{String(i+1).padStart(2,"0")}</span>
                      <span style={{ color:"#9aa8b6" }}>{step}</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontFamily:"'Oxanium', sans-serif", fontSize:9, color:"#00ff88", letterSpacing:2, marginBottom:8 }}>KEY SPECIFICATIONS</div>
                <div style={{ marginBottom:12 }}>
                  {tipData.specs.map(([k,v], i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:10 }}>
                      <span style={{ color:"#506070" }}>{k}</span>
                      <span style={{ color:"#c8d0d8", textAlign:"right" }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background:`${tipData.color}15`, borderRadius:4, padding:"6px 10px", fontSize:10, color:tipData.color, textAlign:"center", fontWeight:600 }}>
                  {tipData.count}
                </div>
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"30px 0" }}>
                <div style={{ fontSize:28, opacity:0.15, marginBottom:8 }}>◎</div>
                <div style={{ fontFamily:"'Oxanium', sans-serif", fontSize:11, color:"#405060", letterSpacing:1 }}>HOVER OR CLICK ANY NODE</div>
                <div style={{ fontSize:10, color:"#303a44", marginTop:4 }}>to view technology details & kill chain role</div>
              </div>
            )}
          </div>

          {/* System summary */}
          <SideBlock title="SYSTEM INVENTORY">
            {[
              ["◉", "#00b4ff", "RF Sensor Clusters", "17 (51 DF)"],
              ["▲", "#ff3c3c", "EA Nodes w/ DF", "5 (15 DF)"],
              ["◆", "#00cc66", "EchoGuard Radars", "18 (6 towers)"],
              ["◎", "#a070d0", "Acoustic Arrays", "12 (MEMS)"],
              ["◐", "#e0a030", "EO/IR Turrets", "6 (thermal)"],
              ["■", "#ffcc00", "C2 Servers", "1 (redundant)"],
            ].map(([sym,col,label,val],i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:col, fontSize:12, width:18, textAlign:"center" }}>{sym}</span>
                  <span style={{ fontSize:10 }}>{label}</span>
                </div>
                <span style={{ fontSize:10, color:"#e4ecf4", fontWeight:600 }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop:10, padding:"8px 0", borderTop:"1px solid rgba(0,255,120,0.15)", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"'Oxanium', sans-serif", fontSize:10, color:"#00ff88", letterSpacing:1 }}>TOTAL DF APERTURES</span>
              <span style={{ fontFamily:"'Oxanium', sans-serif", fontSize:13, color:"#e4ecf4", fontWeight:700 }}>66</span>
            </div>
          </SideBlock>

          {/* Legend */}
          <SideBlock title="4 SENSOR PHENOMENOLOGIES">
            {[
              ["RF", "#00b4ff", "Passive direction finding + TDOA multilateration. Detects any sUAS with an active control link."],
              ["ACOUSTIC", "#a070d0", "MEMS beamforming arrays detect propeller signatures. Works on RF-silent autonomous platforms."],
              ["EO/IR", "#e0a030", "Thermal + HD PTZ turrets with AI auto-tracking. Cued by acoustic or RF detections."],
              ["RADAR", "#00cc66", "K-band ESA. All-weather, all-lighting. Detects everything — closes every remaining gap."],
            ].map(([name,col,desc],i) => (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:col, flexShrink:0 }}/>
                  <span style={{ fontFamily:"'Oxanium', sans-serif", fontSize:10, color:col, fontWeight:700, letterSpacing:1 }}>{name}</span>
                </div>
                <div style={{ fontSize:9, color:"#607080", lineHeight:1.5, paddingLeft:16 }}>{desc}</div>
              </div>
            ))}
          </SideBlock>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding:"12px 28px", borderTop:"1px solid rgba(0,255,120,0.1)", fontSize:9, color:"#303a44", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <span>DoDAF SV-1 • Multi-Modal C-UAS Architecture • Shaw AFB, Sumter SC</span>
        <span>Positions approximate — requires site survey & RF propagation modeling</span>
      </footer>
    </div>
  )
}

function SideBlock({ title, children }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(0,255,120,0.1)", borderRadius:8, padding:14 }}>
      <div style={{ fontFamily:"'Oxanium', sans-serif", fontSize:9, color:"#00ff88", letterSpacing:3, marginBottom:10, fontWeight:500 }}>{title}</div>
      {children}
    </div>
  )
}
