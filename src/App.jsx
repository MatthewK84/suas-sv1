import { useState, useEffect } from "react";
import ThreatMatrix from "./ThreatMatrix";
import { getNodeEffectiveness } from "./threatData";

function useFonts() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Oxanium:wght@300;400;500;600;700&display=swap";
    l.rel = "stylesheet"; document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);
}

const PERIM = [
  [160,100],[380,75],[600,60],[780,70],[880,90],[940,130],
  [970,200],[970,320],[980,420],[1010,480],[1080,500],[1180,490],
  [1280,510],[1320,560],[1300,620],[1220,660],[1100,680],[980,670],
  [880,640],[780,620],[620,650],[440,660],[280,630],[170,560],
  [130,430],[120,290],[140,170],
];
const RW = { x1:220,y1:190,x2:740,y2:470,w:13 };
const FAC = [
  {id:"fl",l:"FLIGHT LINE",x:480,y:290,w:190,h:45,p:"C"},
  {id:"cant",l:"CANTONMENT",x:330,y:440,w:130,h:55,p:"H"},
  {id:"mun",l:"MUNITIONS",x:750,y:210,w:75,h:45,p:"C"},
  {id:"pol",l:"POL",x:670,y:380,w:55,h:35,p:"H"},
  {id:"cmd",l:"CMD/HQ",x:400,y:360,w:75,h:35,p:"H"},
  {id:"ops",l:"OPS/INTEL",x:520,y:375,w:75,h:35,p:"H"},
  {id:"bx",l:"BX/COMM",x:280,y:510,w:75,h:35,p:"M"},
  {id:"arc",l:"ARCENT/3RD ARMY HQ",x:1050,y:530,w:115,h:50,p:"C"},
  {id:"catm",l:"FIRING RANGE (CATM)",x:1220,y:560,w:95,h:40,p:"H"},
  {id:"fam",l:"FAM CAMP",x:1150,y:650,w:80,h:35,p:"M"},
  {id:"hsg",l:"HOUSING",x:850,y:600,w:80,h:35,p:"M"},
];
const N = [
  {id:"S01",x:185,y:140,t:"s"},{id:"S02",x:360,y:100,t:"s"},{id:"S03",x:540,y:85,t:"s"},
  {id:"S04",x:720,y:90,t:"s"},{id:"S05",x:880,y:140,t:"s"},{id:"S06",x:960,y:260,t:"s"},
  {id:"S07",x:960,y:400,t:"s"},{id:"S08",x:770,y:610,t:"s"},{id:"S09",x:540,y:645,t:"s"},
  {id:"S10",x:360,y:635,t:"s"},{id:"S11",x:200,y:565,t:"s"},{id:"S12",x:140,y:430,t:"s"},
  {id:"S13",x:135,y:270,t:"s"},
  {id:"S14",x:400,y:270,t:"s"},{id:"S15",x:600,y:320,t:"s"},{id:"S16",x:300,y:380,t:"s"},
  {id:"S17",x:570,y:500,t:"s"},
  {id:"S18",x:1010,y:450,t:"s"},{id:"S19",x:1100,y:500,t:"s"},{id:"S20",x:1250,y:520,t:"s"},
  {id:"S21",x:1310,y:580,t:"s"},{id:"S22",x:1250,y:660,t:"s"},{id:"S23",x:1100,y:680,t:"s"},
  {id:"S24",x:960,y:660,t:"s"},
  {id:"S25",x:1050,y:580,t:"s"},{id:"S26",x:1180,y:600,t:"s"},
  {id:"S27",x:880,y:540,t:"s"},{id:"S28",x:680,y:560,t:"s"},
  {id:"S29",x:450,y:180,t:"s"},{id:"S30",x:820,y:350,t:"s"},
  {id:"EA01",x:440,y:190,t:"e"},{id:"EA02",x:650,y:260,t:"e"},{id:"EA03",x:340,y:510,t:"e"},
  {id:"EA04",x:730,y:440,t:"e"},{id:"EA05",x:500,y:430,t:"e"},{id:"EA06",x:850,y:200,t:"e"},
  {id:"EA07",x:1020,y:560,t:"e"},{id:"EA08",x:1200,y:580,t:"e"},{id:"EA09",x:950,y:530,t:"e"},
  {id:"EA10",x:620,y:610,t:"e"},
];
const R = [
  {id:"R01",x:200,y:170,d:"NW Perimeter"},{id:"R02",x:680,y:100,d:"N Central"},
  {id:"R03",x:910,y:170,d:"NE Cantonment"},{id:"R04",x:960,y:380,d:"E Cantonment"},
  {id:"R05",x:680,y:600,d:"S Central"},{id:"R06",x:240,y:530,d:"SW Perimeter"},
  {id:"R07",x:470,y:300,d:"Flight Line Interior"},{id:"R08",x:1080,y:530,d:"ARCENT HQ"},
  {id:"R09",x:1270,y:590,d:"CATM/East Perimeter"},{id:"R10",x:870,y:580,d:"Connector Corridor"},
];
const AC = [
  {id:"A01",x:210,y:165},{id:"A02",x:390,y:115},{id:"A03",x:565,y:100},
  {id:"A04",x:740,y:105},{id:"A05",x:895,y:160},{id:"A06",x:945,y:290},
  {id:"A07",x:945,y:420},{id:"A08",x:750,y:595},{id:"A09",x:555,y:640},
  {id:"A10",x:380,y:630},{id:"A11",x:215,y:545},{id:"A12",x:148,y:395},
  {id:"A13",x:148,y:250},
  {id:"A14",x:430,y:255},{id:"A15",x:620,y:290},{id:"A16",x:780,y:240},
  {id:"A17",x:1030,y:470},{id:"A18",x:1130,y:510},{id:"A19",x:1280,y:540},
  {id:"A20",x:1290,y:640},{id:"A21",x:1120,y:670},
  {id:"A22",x:1060,y:560},{id:"A23",x:1170,y:620},
  {id:"A24",x:860,y:560},
];
const EO = [
  {id:"T01",x:420,y:305,d:"Flight Line West"},{id:"T02",x:560,y:310,d:"Flight Line East"},
  {id:"T03",x:770,y:185,d:"Munitions Storage"},{id:"T04",x:350,y:465,d:"Cantonment"},
  {id:"T05",x:230,y:200,d:"NW Approach"},{id:"T06",x:230,y:500,d:"SW Approach"},
  {id:"T07",x:870,y:160,d:"NE Approach"},{id:"T08",x:800,y:580,d:"SE Connector"},
  {id:"T09",x:1040,y:500,d:"ARCENT North"},{id:"T10",x:1080,y:620,d:"ARCENT South"},
  {id:"T11",x:1240,y:545,d:"CATM Approach"},{id:"T12",x:1160,y:660,d:"East Perimeter"},
];
const C2P = {x:460,y:350,l:"C2 PRIMARY"};
const C2S = {x:1060,y:600,l:"C2 SECONDARY"};

const TIPS = {
  s:{title:"Passive RF Sensor Cluster",icon:"◉",color:"#00b4ff",role:"DETECT · CLASSIFY · GEOLOCATE",what:"3-element interferometric direction-finding array passively listening for sUAS RF emissions across 70 MHz – 6 GHz. Catches everything from DJI to homebrew builds via anomaly detection against the learned RF baseline.",how:["3x Ettus B205mini-i SDRs on triangular mast (3–5m baseline) with GPS-disciplined 10 MHz phase sync","Instantaneous angle-of-arrival via phase interferometry — bearing in milliseconds from a single node","Local AoA vectors fuse with macro TDOA multilateration across all 40 node locations for sub-second geolocation","RF fingerprinting classifies platform type (modulation, bandwidth, hopping pattern); anomaly detection catches unknowns","ML model outputs confidence-ranked platform ID to C2 fusion engine for operator display and EA cueing"],specs:[["SDR","3x Ettus B205mini-i"],["Compute","Jetson Orin Nano Super (67 TOPS)"],["Backhaul","RFD900x (NDAA compliant)"],["Power","200W solar + 100Ah LiFePO4"],["Range","~2–3 km detection"]],count:"30 clusters · 90 DF sub-nodes"},
  e:{title:"Electronic Attack + DF Cluster",icon:"▲",color:"#ff3c3c",role:"DETECT · REDIRECT · DEFEAT",what:"Dual-purpose: 3-element DF array + high-power SDR transmitter for active electronic countermeasures. Uses own DF bearing to steer directional TX antennas toward threats.",how:["3-element DF array contributes to macro TDOA geolocation across all 40 node locations","USRP X310 + 2x UBX-160 drives directional panel antennas toward threat bearing from DF array","Protocol injection: spoofs RTH/land for known platforms (DJI OcuSync, MAVLink)","Targeted jamming: high-power noise on exact control link frequencies → forces autopilot failsafe","GPS L1 spoofing: gradually walks position solution toward redirect corridor (~2-3 m/sec offset)","All three mechanisms fire simultaneously — 30-90 second detect-to-redirect timeline"],specs:[["DF Array","3x B205mini-i + GPSDO"],["EA TX","Ettus X310 + 2x UBX-160"],["PA","10W @ 2.4 GHz / 5W @ 5.8 GHz"],["Compute","Jetson Orin NX 16 GB"],["Power","Hardwired AC + UPS"]],count:"10 clusters · 30 DF sub-nodes · 10 TX"},
  r:{title:"Echodyne EchoGuard Radar Tower",icon:"◆",color:"#00cc66",role:"DETECT · TRACK · CLASSIFY (ALL-WEATHER)",what:"3x K-band ESA radars on 20 ft tower for 360° hemispherical coverage. Detects ALL aerial targets regardless of RF emissions, GPS usage, or lighting.",how:["3x EchoGuard scan 120° Az x 80° El each using thousands of electronically steered pencil beams","Detects Group 1 sUAS at ~1 km — works against fully autonomous RF-silent platforms","Doppler from spinning rotors enables in-radar classification on hovering drones at 250-500m","RadarHub fuses tracks across 3 units per tower; EchoWare handles smart inter-tower handoffs","4D track data (position + velocity + classification + RCS) feeds C2 fusion via GigE TCP/IP API","Radar-cued EA: nearest EA node auto-slews TX antennas to radar-provided bearing and engages"],specs:[["Radar","3x Echodyne EchoGuard ESA"],["Band","K-band (24.45–24.65 GHz)"],["FOV","120° Az x 80° El per unit"],["Tracks","20 simultaneous per unit"],["SWaP","1.25 kg/unit, IP67, <50W"]],count:"10 towers · 30 radar units"},
  ac:{title:"Acoustic MEMS Sensor Array",icon:"◎",color:"#a070d0",role:"DETECT · CLASSIFY (RF-SILENT THREATS)",what:"16-element MEMS microphone array with digital beamforming for DOA estimation of sUAS propeller acoustic signatures. Detects autonomous drones on GPS waypoint missions with no active RF link.",how:["16x Knowles SPH0645LM4H-B MEMS microphones in circular array","Teensy 4.1 performs 16-channel TDM acquisition; Jetson Orin Nano runs acoustic beamforming for DOA","CNN classifier discriminates sUAS propeller harmonics from background noise","BPF harmonics unique to each motor/prop combination enable platform classification","DOA bearings feed C2 fusion and cue nearest EO/IR turret","Detection range ~300-500m for Group 1 sUAS depending on ambient noise"],specs:[["Microphones","16x Knowles SPH0645LM4H-B I2S"],["Acquisition","Teensy 4.1 (16-ch TDM)"],["Compute","Jetson Orin Nano Super (67 TOPS)"],["Power","100W solar + 30Ah LiFePO4"],["Range","~300-500m (ambient dependent)"]],count:"24 arrays across installation"},
  eo:{title:"EO/IR Thermal Tracking Turret",icon:"◐",color:"#e0a030",role:"TRACK · CONFIRM · IDENTIFY",what:"Gyro-stabilized dual-sensor PTZ gimbal with LWIR thermal imaging and HD visible zoom, plus AI-powered auto-tracking. Cued by acoustic, RF, or radar detections.",how:["SPI M1-D gimbal provides stabilized LWIR thermal + HD visible zoom with full 360° pan and ±135° tilt","AI auto-tracker module (MVP/9960) locks onto target and maintains tracking without operator input","Jetson Orin Nano runs lightweight CNN for aerial object classification","Turret slews to bearing provided by acoustic DOA, RF AoA, or radar track — acquires target in <3 sec","Continuous track data feeds C2 fusion for composite threat assessment","IR illuminator extends night range; thermal works in complete darkness and through light fog"],specs:[["Gimbal","SPI M1-D (LWIR + HD Zoom)"],["AI Tracker","MVP/9960 auto-track module"],["Compute","Jetson Orin Nano Super"],["Mount","Heavy-duty pole mount, PoE++"],["Coverage","360° pan, cued by sensors"]],count:"12 turrets at HVT locations"},
  c2:{title:"C2 Fusion Server",icon:"■",color:"#ffcc00",role:"FUSE · DECIDE · COMMAND",what:"Central processing that ingests all four sensor phenomenologies, fuses tracks into unified COP, runs ML classification, and commands EA engagement.",how:["Primary (cantonment) + Secondary (ARCENT East) linked via 1 km fiber backbone","Multi-modal fusion correlates RF DF/TDOA + acoustic DOA + EO/IR + radar 4D tracks","ML classifier assigns platform type, threat level, and recommended EA response","Operator COP shows all tracks, classifications, sensor health, EA status","Auto EA trigger logic for pre-authorized threat profiles within geofenced zones","All data logged for post-incident forensics and model retraining"],specs:[["Server","2x Dell PowerEdge R660xs"],["GPU","2x NVIDIA T1000"],["Network","10 GbE + fiber + RFD900x"],["Software","GNU Radio, PyTorch, Custom C2"],["UPS","2x APC Smart-UPS 1500VA"]],count:"2 servers (Primary + Secondary)"},
};

const pPath = PERIM.map(([x,y],i)=>`${i===0?"M":"L"} ${x} ${y}`).join(" ")+" Z";
const rwA = Math.atan2(RW.y2-RW.y1,RW.x2-RW.x1)*(180/Math.PI);
const mLinks=(()=>{const o=[];for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++)if(Math.hypot(N[i].x-N[j].x,N[i].y-N[j].y)<200)o.push([i,j]);return o;})();
const pF=p=>p==="C"?"rgba(255,60,60,0.22)":p==="H"?"rgba(255,180,40,0.18)":"rgba(100,180,255,0.12)";
const pS=p=>p==="C"?"rgba(255,60,60,0.6)":p==="H"?"rgba(255,180,40,0.5)":"rgba(100,180,255,0.35)";

// Color for effectiveness overlay — green=high, red=low
function effColor(v, alpha=0.35) {
  if (v >= 70) return `rgba(0,204,102,${alpha})`;
  if (v >= 50) return `rgba(200,200,0,${alpha})`;
  if (v >= 30) return `rgba(255,150,0,${alpha})`;
  return `rgba(255,60,60,${alpha})`;
}

export default function App() {
  useFonts();
  const [view,setView]=useState("map");
  const [threat,setThreat]=useState(null); // selected threat for map overlay
  const [act,setAct]=useState(null);
  const [pin,setPin]=useState(null);
  const [ly,setLy]=useState({rf:true,ea:true,rd:true,ac:true,eo:true,ms:true,fc:true});
  const cur=pin||act;
  const tip=cur?TIPS[cur.t]:null;
  const hv=(id,t)=>setAct({id,t});
  const lv=()=>setAct(null);
  const cl=(id,t)=>setPin(pin&&pin.id===id?null:{id,t});
  const isA=id=>cur&&cur.id===id;
  const tg=k=>setLy(l=>({...l,[k]:!l[k]}));

  const handleShowOnMap = (scored) => {
    setThreat(scored);
    setView("map");
  };

  const eff = threat ? getNodeEffectiveness(threat) : null;
  const TC = {CRITICAL:"#ff0000",HIGH:"#ff4444",ELEVATED:"#ff9900",MODERATE:"#cccc00",LOW:"#00cc66"};

  return (
    <div style={{background:"#060a10",minHeight:"100vh",fontFamily:"'IBM Plex Mono',monospace",color:"#b8c4d0"}}>
      <header style={{padding:"16px 24px 12px",borderBottom:"1px solid rgba(0,255,120,0.15)",display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:10,color:"#00ff88",letterSpacing:5,fontWeight:300}}>DODAF SV-1 SYSTEMS INTERFACE DESCRIPTION</div>
          <div style={{display:"flex",alignItems:"baseline",gap:16,margin:"4px 0 0"}}>
            <h1 onClick={()=>setView("map")} style={{fontFamily:"'Oxanium',sans-serif",fontSize:20,fontWeight:700,color:view==="map"?"#e4ecf4":"#506070",letterSpacing:1.5,cursor:"pointer",transition:"color 0.2s"}}>SV-1 MAP</h1>
            <span style={{color:"#1a3a2a",fontSize:20}}>|</span>
            <h1 onClick={()=>setView("threat")} style={{fontFamily:"'Oxanium',sans-serif",fontSize:20,fontWeight:700,color:view==="threat"?"#e4ecf4":"#506070",letterSpacing:1.5,cursor:"pointer",transition:"color 0.2s"}}>THREAT MATRIX</h1>
          </div>
          <div style={{fontSize:10,color:"#506070",marginTop:3}}>Shaw AFB, Sumter SC&ensp;•&ensp;Main Cantonment + ARCENT East&ensp;•&ensp;4 Phenomenologies&ensp;•&ensp;All Nodes Interior</div>
        </div>
        <div style={{fontSize:10,color:"#506070",textAlign:"right",lineHeight:1.7}}>
          <div><span style={{color:"#00ff88"}}>CLASSIFICATION:</span> UNCLASSIFIED // FOUO</div>
          <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:12,color:"#e4ecf4",fontWeight:600}}>$1,643,758 TOTAL SYSTEM</div>
        </div>
      </header>

      {view==="threat" ? (
        <ThreatMatrix onShowOnMap={handleShowOnMap} />
      ) : (
        <>
          {/* Threat overlay banner */}
          {threat && eff && (
            <div style={{padding:"8px 24px",background:"linear-gradient(90deg,rgba(255,60,60,0.08),rgba(255,60,60,0.02))",borderBottom:"1px solid rgba(255,60,60,0.2)",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:TC[threat.rt],boxShadow:`0 0 8px ${TC[threat.rt]}`}}/>
                <span style={{fontFamily:"'Oxanium',sans-serif",fontSize:12,fontWeight:700,color:"#e4ecf4"}}>{threat.n}</span>
                <span style={{fontSize:9,color:TC[threat.rt],fontWeight:700,fontFamily:"'Oxanium',sans-serif",background:`${TC[threat.rt]}20`,padding:"1px 6px",borderRadius:3}}>{threat.rt} {threat.or}%</span>
              </div>
              <div style={{display:"flex",gap:12,fontSize:9}}>
                {[["RF",eff.rfSensor,"#00b4ff"],["ACU",eff.acoustic,"#a070d0"],["RAD",eff.radar,"#00cc66"],["EO/IR",eff.eoir,"#e0a030"],["EA",eff.eaNode,"#ff3c3c"]].map(([l,v,c])=>
                  <span key={l} style={{color:effColor(v,1)}}><span style={{color:"#506070"}}>{l}</span> {v}%</span>
                )}
              </div>
              <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <button onClick={()=>setView("threat")} style={{padding:"3px 10px",borderRadius:3,border:"1px solid rgba(0,255,120,0.3)",background:"transparent",color:"#00ff88",fontSize:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1}}>← MATRIX</button>
                <button onClick={()=>setThreat(null)} style={{padding:"3px 10px",borderRadius:3,border:"1px solid rgba(255,60,60,0.3)",background:"transparent",color:"#ff6666",fontSize:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1}}>✕ CLEAR</button>
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:0}}>
            <div style={{flex:"1 1 0",padding:12,minWidth:0}}>
              <svg viewBox="0 0 1420 750" style={{width:"100%",background:"radial-gradient(ellipse at 45% 40%,#0e1520,#080c14)",borderRadius:6,border:"1px solid rgba(0,255,120,0.1)"}}>
                <defs>
                  <radialGradient id="sg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(0,180,255,0.08)"/><stop offset="100%" stopColor="rgba(0,180,255,0)"/></radialGradient>
                  <radialGradient id="eg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(255,60,60,0.07)"/><stop offset="100%" stopColor="rgba(255,60,60,0)"/></radialGradient>
                  <radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(0,204,102,0.08)"/><stop offset="100%" stopColor="rgba(0,204,102,0)"/></radialGradient>
                  <radialGradient id="ag" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(160,112,208,0.1)"/><stop offset="100%" stopColor="rgba(160,112,208,0)"/></radialGradient>
                  <filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <pattern id="gr" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,255,120,0.02)" strokeWidth="0.5"/></pattern>
                </defs>
                <rect width="1420" height="750" fill="url(#gr)"/>
                <path d={pPath} fill="rgba(0,255,120,0.012)" stroke="rgba(0,255,120,0.4)" strokeWidth="1.5" strokeDasharray="10,5"/>
                <text x="125" y="148" fontSize="7" fill="rgba(0,255,120,0.45)" fontFamily="Oxanium,sans-serif" letterSpacing="2">INSTALLATION BOUNDARY</text>
                <text x="460" y="52" fontSize="9" fill="rgba(0,255,120,0.25)" fontFamily="Oxanium,sans-serif" letterSpacing="3" textAnchor="middle">MAIN CANTONMENT</text>
                <text x="1120" y="470" fontSize="9" fill="rgba(0,255,120,0.25)" fontFamily="Oxanium,sans-serif" letterSpacing="3" textAnchor="middle">ARCENT EAST</text>

                <line x1={RW.x1} y1={RW.y1} x2={RW.x2} y2={RW.y2} stroke="rgba(200,200,200,0.2)" strokeWidth={RW.w}/>
                <line x1={RW.x1} y1={RW.y1} x2={RW.x2} y2={RW.y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="20,16"/>
                <text x={(RW.x1+RW.x2)/2-65} y={(RW.y1+RW.y2)/2-15} fontSize="9" fill="rgba(200,200,200,0.3)" fontFamily="Oxanium,sans-serif" letterSpacing="2" transform={`rotate(${rwA},${(RW.x1+RW.x2)/2-65},${(RW.y1+RW.y2)/2-15})`}>RUNWAY 04/22</text>

                <line x1={C2P.x} y1={C2P.y} x2={C2S.x} y2={C2S.y} stroke="rgba(255,200,0,0.2)" strokeWidth="2" strokeDasharray="12,4"/>
                <text x={(C2P.x+C2S.x)/2} y={(C2P.y+C2S.y)/2-8} textAnchor="middle" fontSize="6" fill="rgba(255,200,0,0.35)" fontFamily="Oxanium,sans-serif" letterSpacing="1">FIBER BACKBONE</text>

                {ly.fc && FAC.map(f=><g key={f.id}><rect x={f.x-f.w/2} y={f.y-f.h/2} width={f.w} height={f.h} fill={pF(f.p)} stroke={pS(f.p)} strokeWidth="1" rx="3"/>{f.l.split("\n").map((line,li)=><text key={li} x={f.x} y={f.y+li*10-(f.l.split("\n").length-1)*5+4} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.6)" fontFamily="Oxanium,sans-serif" fontWeight="600" letterSpacing="0.5">{line}</text>)}</g>)}

                {/* Threat-aware coverage overlays */}
                {ly.rf && N.filter(n=>n.t==="s").map(n=><circle key={`c${n.id}`} cx={n.x} cy={n.y} r={eff?100+eff.rfSensor*0.4:140} fill={eff?effColor(eff.rfSensor,0.06):"url(#sg)"} stroke={eff?effColor(eff.rfSensor,0.2):"rgba(0,180,255,0.06)"} strokeWidth={eff?1.2:0.5}/>)}
                {ly.ea && N.filter(n=>n.t==="e").map(n=><circle key={`e${n.id}`} cx={n.x} cy={n.y} r={eff?60+eff.eaNode*0.3:90} fill={eff?effColor(eff.eaNode,0.05):"url(#eg)"} stroke={eff?effColor(eff.eaNode,0.25):"rgba(255,60,60,0.12)"} strokeWidth={eff?1.5:1} strokeDasharray="4,3"/>)}
                {ly.rd && R.map(r=><circle key={`rv${r.id}`} cx={r.x} cy={r.y} r={eff?80+eff.radar*0.4:120} fill={eff?effColor(eff.radar,0.06):"url(#rg)"} stroke={eff?effColor(eff.radar,0.2):"rgba(0,204,102,0.12)"} strokeWidth={eff?1.5:1.5} strokeDasharray="6,4"/>)}
                {ly.ac && AC.map(a=><circle key={`av${a.id}`} cx={a.x} cy={a.y} r={eff?25+eff.acoustic*0.25:45} fill={eff?effColor(eff.acoustic,0.08):"url(#ag)"} stroke={eff?effColor(eff.acoustic,0.25):"rgba(160,112,208,0.15)"} strokeWidth={eff?1.2:1} strokeDasharray="3,3"/>)}

                {ly.ms && mLinks.map(([a,b],i)=><line key={i} x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y} stroke="rgba(0,255,120,0.06)" strokeWidth="0.6"/>)}
                {ly.ms && N.filter(n=>n.t==="e").map(n=>{const tgt=n.x<900?C2P:C2S;return <line key={`c${n.id}`} x1={n.x} y1={n.y} x2={tgt.x} y2={tgt.y} stroke="rgba(255,200,0,0.06)" strokeWidth="0.7" strokeDasharray="6,4"/>})}
                {ly.ms && R.map(r=>{const tgt=r.x<900?C2P:C2S;return <line key={`cr${r.id}`} x1={r.x} y1={r.y} x2={tgt.x} y2={tgt.y} stroke="rgba(255,200,0,0.06)" strokeWidth="0.7" strokeDasharray="6,4"/>})}

                {[C2P,C2S].map((c2,i)=>(
                  <g key={c2.l} style={{cursor:"pointer"}} onMouseEnter={()=>hv(`c2${i}`,"c2")} onMouseLeave={lv} onClick={()=>cl(`c2${i}`,"c2")} filter={isA(`c2${i}`)?"url(#gl)":undefined}>
                    <rect x={c2.x-35} y={c2.y-16} width={70} height={32} fill={isA(`c2${i}`)?"rgba(255,200,0,0.3)":"rgba(255,200,0,0.1)"} stroke="rgba(255,200,0,0.6)" strokeWidth="1.5" rx="4"/>
                    <text x={c2.x} y={c2.y} textAnchor="middle" fontSize="6" fill="rgba(255,200,0,0.9)" fontFamily="Oxanium,sans-serif" fontWeight="700" letterSpacing="0.5">{c2.l}</text>
                    <text x={c2.x} y={c2.y+10} textAnchor="middle" fontSize="5.5" fill="rgba(255,200,0,0.45)">FUSION</text>
                  </g>
                ))}

                {ly.eo && EO.map(t=>(
                  <g key={t.id} style={{cursor:"pointer"}} onMouseEnter={()=>hv(t.id,"eo")} onMouseLeave={lv} onClick={()=>cl(t.id,"eo")} filter={isA(t.id)?"url(#gl)":undefined}>
                    <circle cx={t.x} cy={t.y} r={8} fill="none" stroke={isA(t.id)?"#e0a030":eff?effColor(eff.eoir,0.6):"rgba(224,160,48,0.4)"} strokeWidth={isA(t.id)?2:1.2}/>
                    <circle cx={t.x} cy={t.y} r={3.5} fill={isA(t.id)?"#e0a030":eff?effColor(eff.eoir,0.7):"rgba(224,160,48,0.5)"}/>
                    <line x1={t.x} y1={t.y-8} x2={t.x} y2={t.y-14} stroke={isA(t.id)?"#e0a030":"rgba(224,160,48,0.3)"} strokeWidth="1.5"/>
                    {eff && <text x={t.x} y={t.y-17} textAnchor="middle" fontSize="6" fill={effColor(eff.eoir,1)} fontWeight="700">{eff.eoir}%</text>}
                    <text x={t.x} y={t.y+20} textAnchor="middle" fontSize="5.5" fill={isA(t.id)?"#fff":"rgba(224,160,48,0.45)"}>{t.id}</text>
                  </g>
                ))}

                {ly.ac && AC.map(a=>(
                  <g key={a.id} style={{cursor:"pointer"}} onMouseEnter={()=>hv(a.id,"ac")} onMouseLeave={lv} onClick={()=>cl(a.id,"ac")} filter={isA(a.id)?"url(#gl)":undefined}>
                    <circle cx={a.x} cy={a.y} r={7} fill="none" stroke={isA(a.id)?"rgba(160,112,208,0.6)":"rgba(160,112,208,0.2)"} strokeWidth="0.7"/>
                    <circle cx={a.x} cy={a.y} r={11} fill="none" stroke={isA(a.id)?"rgba(160,112,208,0.4)":"rgba(160,112,208,0.12)"} strokeWidth="0.5"/>
                    <circle cx={a.x} cy={a.y} r={4} fill={isA(a.id)?"#a070d0":eff?effColor(eff.acoustic,0.7):"rgba(160,112,208,0.45)"}/>
                    <text x={a.x} y={a.y+20} textAnchor="middle" fontSize="5" fill={isA(a.id)?"#fff":"rgba(160,112,208,0.35)"}>{a.id}</text>
                  </g>
                ))}

                {R.map(r=>(
                  <g key={r.id} style={{cursor:"pointer"}} onMouseEnter={()=>hv(r.id,"r")} onMouseLeave={lv} onClick={()=>cl(r.id,"r")} filter={isA(r.id)?"url(#gl)":undefined}>
                    <rect x={r.x-9} y={r.y-9} width={18} height={18} fill={isA(r.id)?"#00cc66":eff?effColor(eff.radar,0.5):"rgba(0,204,102,0.3)"} stroke={eff?effColor(eff.radar,1):"#00cc66"} strokeWidth={isA(r.id)?2.5:1.5} rx="2" transform={`rotate(45,${r.x},${r.y})`}/>
                    <text x={r.x} y={r.y+4} textAnchor="middle" fontSize="7" fill="#fff" fontFamily="Oxanium,sans-serif" fontWeight="700">R</text>
                    {eff && <text x={r.x} y={r.y-18} textAnchor="middle" fontSize="6" fill={effColor(eff.radar,1)} fontWeight="700">{eff.radar}%</text>}
                    <text x={r.x} y={r.y+24} textAnchor="middle" fontSize="6" fill={isA(r.id)?"#fff":"rgba(0,204,102,0.5)"}>{r.id}</text>
                  </g>
                ))}

                {N.map(n=>{const s=n.t==="s";const co=s?"#00b4ff":"#ff3c3c";const sz=s?6:8;const a=isA(n.id);const nEff=eff?(s?eff.rfSensor:eff.eaNode):null;const nCol=nEff!==null?effColor(nEff,0.8):co;return(
                  <g key={n.id} style={{cursor:"pointer"}} onMouseEnter={()=>hv(n.id,n.t)} onMouseLeave={lv} onClick={()=>cl(n.id,n.t)} filter={a?"url(#gl)":undefined}>
                    <circle cx={n.x-6} cy={n.y+5} r={1.8} fill="none" stroke={`${co}${a?"77":"22"}`} strokeWidth="0.6"/>
                    <circle cx={n.x+6} cy={n.y+5} r={1.8} fill="none" stroke={`${co}${a?"77":"22"}`} strokeWidth="0.6"/>
                    <circle cx={n.x} cy={n.y-7} r={1.8} fill="none" stroke={`${co}${a?"77":"22"}`} strokeWidth="0.6"/>
                    {s?<circle cx={n.x} cy={n.y} r={sz} fill={a?co:nEff!==null?effColor(nEff,0.6):`${co}55`} stroke={nCol} strokeWidth={a?2.5:1.3}/>
                      :<polygon points={`${n.x},${n.y-sz-2} ${n.x+sz+1},${n.y+sz-1} ${n.x-sz-1},${n.y+sz-1}`} fill={a?co:nEff!==null?effColor(nEff,0.6):`${co}55`} stroke={nCol} strokeWidth={a?2.5:1.3}/>}
                    {nEff!==null && !s && <text x={n.x} y={n.y-14} textAnchor="middle" fontSize="6" fill={effColor(nEff,1)} fontWeight="700">{nEff}%</text>}
                    <text x={n.x} y={n.y+(s?19:23)} textAnchor="middle" fontSize="5.5" fill={a?"#fff":`${co}55`}>{n.id}</text>
                  </g>
                )})}

                <g transform="translate(40,710)"><line x1="0" y1="0" x2="90" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/><line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(255,255,255,0.3)"/><line x1="90" y1="-3" x2="90" y2="3" stroke="rgba(255,255,255,0.3)"/><text x="45" y="12" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)">~1 KM</text></g>
                <g transform="translate(1380,40)"><line x1="0" y1="16" x2="0" y2="-6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/><polygon points="0,-10 -4,0 4,0" fill="rgba(255,255,255,0.4)"/><text x="0" y="-15" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="Oxanium,sans-serif" fontWeight="700">N</text></g>
              </svg>
            </div>

            <div style={{flex:"0 0 310px",padding:"12px 16px 12px 4px",display:"flex",flexDirection:"column",gap:10,overflowY:"auto",maxHeight:"calc(100vh - 90px)"}}>
              <Blk t="LAYER CONTROLS">
                {[
                  {k:"rf",l:"RF Sensor Coverage (2-3 km)",c:"#00b4ff"},
                  {k:"ea",l:"EA Effective Range (1.2 km)",c:"#ff3c3c"},
                  {k:"rd",l:"EchoGuard Radar (1 km)",c:"#00cc66"},
                  {k:"ac",l:"Acoustic Arrays (300-500m)",c:"#a070d0"},
                  {k:"eo",l:"EO/IR Tracking Turrets",c:"#e0a030"},
                  {k:"ms",l:"Mesh + C2 Links",c:"#00ff88"},
                  {k:"fc",l:"Facility Overlays",c:"#ffb428"},
                ].map(c=>(
                  <label key={c.k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:5,cursor:"pointer",fontSize:10}}>
                    <div onClick={()=>tg(c.k)} style={{width:14,height:14,borderRadius:3,border:`2px solid ${c.c}`,background:ly[c.k]?`${c.c}30`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {ly[c.k]&&<div style={{width:6,height:6,borderRadius:2,background:c.c}}/>}
                    </div>
                    <span style={{color:ly[c.k]?"#c8d0d8":"#506070"}}>{c.l}</span>
                  </label>
                ))}
              </Blk>

              <div style={{background:tip?`linear-gradient(135deg,${tip.color}08,${tip.color}03)`:"rgba(255,255,255,0.02)",border:`1px solid ${tip?tip.color+"40":"rgba(0,255,120,0.1)"}`,borderRadius:8,padding:13,transition:"all 0.3s",minHeight:tip?"auto":90}}>
                {tip?(<div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:20,color:tip.color}}>{tip.icon}</span>
                    <div>
                      <div style={{fontFamily:"Oxanium,sans-serif",fontSize:12,fontWeight:700,color:"#e4ecf4"}}>{tip.title}</div>
                      <div style={{fontSize:7.5,color:tip.color,letterSpacing:2,fontWeight:600,marginTop:1}}>{tip.role}</div>
                    </div>
                  </div>
                  <div style={{fontSize:9.5,color:"#8898a8",lineHeight:1.55,marginBottom:10}}>{tip.what}</div>
                  <div style={{fontFamily:"Oxanium,sans-serif",fontSize:7.5,color:"#00ff88",letterSpacing:2,marginBottom:5}}>HOW IT WORKS</div>
                  {tip.how.map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:6,marginBottom:4,fontSize:9,lineHeight:1.45}}>
                      <span style={{color:tip.color,fontWeight:700,flexShrink:0,fontFamily:"Oxanium,sans-serif"}}>{String(i+1).padStart(2,"0")}</span>
                      <span style={{color:"#9aa8b6"}}>{s}</span>
                    </div>
                  ))}
                  <div style={{fontFamily:"Oxanium,sans-serif",fontSize:7.5,color:"#00ff88",letterSpacing:2,margin:"8px 0 4px"}}>KEY SPECS</div>
                  {tip.specs.map(([k,v],i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.03)",fontSize:9.5}}>
                      <span style={{color:"#506070"}}>{k}</span><span style={{color:"#c8d0d8"}}>{v}</span>
                    </div>
                  ))}
                  <div style={{background:`${tip.color}15`,borderRadius:4,padding:"4px 8px",fontSize:9.5,color:tip.color,textAlign:"center",fontWeight:600,marginTop:8}}>{tip.count}</div>
                </div>):(<div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{fontSize:24,opacity:0.12,marginBottom:5}}>◎</div>
                  <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,color:"#405060",letterSpacing:1}}>HOVER OR CLICK ANY NODE</div>
                  <div style={{fontSize:9,color:"#303a44",marginTop:2}}>view technology details & kill chain role</div>
                </div>)}
              </div>

              <Blk t="SYSTEM INVENTORY">
                {[["◉","#00b4ff","RF Sensor Clusters","30 (90 DF)"],["▲","#ff3c3c","EA Nodes w/ DF","10 (30 DF)"],["◆","#00cc66","EchoGuard Radars","30 (10 towers)"],["◎","#a070d0","Acoustic Arrays","24 (MEMS)"],["◐","#e0a030","EO/IR Turrets","12 (thermal)"],["■","#ffcc00","C2 Servers","2 (Pri+Sec)"]].map(([sym,col,l,v],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:col,fontSize:11,width:16,textAlign:"center"}}>{sym}</span><span style={{fontSize:9.5}}>{l}</span></div>
                    <span style={{fontSize:9.5,color:"#e4ecf4",fontWeight:600}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:8,padding:"5px 0",borderTop:"1px solid rgba(0,255,120,0.15)",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,color:"#00ff88",letterSpacing:1}}>TOTAL DF APERTURES</span>
                  <span style={{fontFamily:"Oxanium,sans-serif",fontSize:12,color:"#e4ecf4",fontWeight:700}}>120</span>
                </div>
              </Blk>

              <Blk t="4 SENSOR PHENOMENOLOGIES">
                {[["RF","#00b4ff","Passive DF + TDOA. Catches any sUAS with active control link."],["ACOUSTIC","#a070d0","MEMS beamforming detects propeller signatures. Works RF-silent."],["EO/IR","#e0a030","Thermal + HD PTZ with AI tracking. Cued by acoustic/RF/radar."],["RADAR","#00cc66","K-band ESA. All-weather. Detects everything including GPS-denied."]].map(([n,c,d],i)=>(
                  <div key={i} style={{marginBottom:7}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:1}}><div style={{width:6,height:6,borderRadius:2,background:c}}/><span style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,color:c,fontWeight:700,letterSpacing:1}}>{n}</span></div>
                    <div style={{fontSize:8.5,color:"#607080",lineHeight:1.4,paddingLeft:12}}>{d}</div>
                  </div>
                ))}
              </Blk>
            </div>
          </div>

          <footer style={{padding:"10px 24px",borderTop:"1px solid rgba(0,255,120,0.1)",fontSize:8,color:"#303a44",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <span>DoDAF SV-1 • Full Shaw AFB C-UAS Architecture • Main Cantonment + ARCENT East</span>
            <span>40 RF/EA locations · 120 DF apertures · 30 radars · 24 acoustic · 12 EO/IR · 2 C2 servers</span>
          </footer>
        </>
      )}
    </div>
  );
}

function Blk({t,children}) {
  return <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,255,120,0.1)",borderRadius:8,padding:11}}>
    <div style={{fontFamily:"Oxanium,sans-serif",fontSize:7.5,color:"#00ff88",letterSpacing:3,marginBottom:7,fontWeight:500}}>{t}</div>
    {children}
  </div>;
}
