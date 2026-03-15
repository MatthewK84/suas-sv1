import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ThreatMatrix, { CAPEView } from "./ThreatMatrix";
import { getNodeEffectiveness, loadGmapKey, saveGmapKey } from "./threatData";

function useFonts(){useEffect(()=>{const l=document.createElement("link");l.href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Oxanium:wght@300;400;500;600;700&display=swap";l.rel="stylesheet";document.head.appendChild(l);return()=>document.head.removeChild(l);},[]);}
function useMobile(bp=768){const[m,setM]=useState(typeof window!=="undefined"?window.innerWidth<bp:false);useEffect(()=>{const h=()=>setM(window.innerWidth<bp);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[bp]);return m;}

// ── Static geography ─────────────────────────────────────────────────────────
const PERIM=[[147,54],[441,32],[686,43],[930,64],[1126,86],[1249,129],[1347,214],[1371,321],[1371,450],[1347,579],[1298,686],[1175,729],[979,739],[783,729],[588,707],[441,686],[294,643],[171,536],[98,407],[73,279],[98,150]];
const RW={x1:397,y1:486,x2:955,y2:189,w:13};
const FAC=[{id:"fl",l:"FLIGHT LINE",x:637,y:364,w:200,h:40,p:"C"},{id:"cant",l:"CANTONMENT",x:465,y:568,w:130,h:50,p:"H"},{id:"mun",l:"MUNITIONS",x:881,y:171,w:80,h:40,p:"C"},{id:"pol",l:"POL",x:783,y:450,w:55,h:35,p:"H"},{id:"cmd",l:"CMD/HQ",x:588,y:504,w:75,h:35,p:"H"},{id:"ops",l:"OPS/INTEL",x:686,y:450,w:75,h:35,p:"H"},{id:"bx",l:"BX/COMM",x:441,y:621,w:75,h:35,p:"M"},{id:"arc",l:"ARCENT/3RD ARMY HQ",x:1102,y:600,w:115,h:45,p:"C"},{id:"catm",l:"FIRING RANGE (CATM)",x:1224,y:664,w:95,h:40,p:"H"},{id:"fam",l:"FAM CAMP",x:1077,y:707,w:80,h:35,p:"M"},{id:"hsg",l:"HOUSING",x:808,y:664,w:80,h:35,p:"M"}];
const pPath=PERIM.map(([x,y],i)=>`${i===0?"M":"L"} ${x} ${y}`).join(" ")+" Z";
const rwA=Math.atan2(RW.y2-RW.y1,RW.x2-RW.x1)*(180/Math.PI);
const pF=p=>p==="C"?"rgba(255,60,60,0.22)":p==="H"?"rgba(255,180,40,0.18)":"rgba(100,180,255,0.12)";
const pS=p=>p==="C"?"rgba(255,60,60,0.6)":p==="H"?"rgba(255,180,40,0.5)":"rgba(100,180,255,0.35)";

// ── Capability definitions ───────────────────────────────────────────────────
const CAPS={
  s:{name:"RF Sensor",icon:"◉",color:"#00b4ff",radius:140,cost:3864,max:30,desc:"3-element DF array · 2-3 km · Solar powered"},
  e:{name:"EA Node",icon:"▲",color:"#ff3c3c",radius:90,cost:17148,max:10,desc:"DF + TX · Protocol inject + Jam + GPS spoof"},
  r:{name:"Radar Tower",icon:"◆",color:"#00cc66",radius:120,cost:24085,max:10,desc:"3x EchoGuard ESA · K-band · 1 km"},
  ac:{name:"Acoustic",icon:"◎",color:"#a070d0",radius:45,cost:3200,max:24,desc:"16-MEMS array · 300-500m · RF-silent detect"},
  eo:{name:"EO/IR Turret",icon:"◐",color:"#e0a030",radius:0,cost:8000,max:12,desc:"SPI M1-D thermal + HD PTZ · AI track"},
  c2:{name:"C2 Server",icon:"■",color:"#ffcc00",radius:0,cost:58795,max:2,desc:"Fusion server · All phenomenologies · Auto EA"},
};
const TIPS={s:{title:"Passive RF Sensor Cluster",icon:"◉",color:"#00b4ff",what:"3-element interferometric DF array across 70 MHz to 6 GHz.",specs:[["SDR","3x Ettus B205mini-i"],["Compute","Jetson Orin Nano Super"],["Backhaul","RFD900x (NDAA)"],["Power","200W solar + 100Ah LiFePO4"],["Range","~2-3 km"]]},e:{title:"Electronic Attack + DF",icon:"▲",color:"#ff3c3c",what:"3-element DF array + high-power SDR TX for countermeasures.",specs:[["DF","3x B205mini-i + GPSDO"],["TX","X310 + 2x UBX-160"],["PA","10W@2.4 / 5W@5.8 GHz"],["Compute","Jetson Orin NX 16GB"],["Power","Hardwired AC + UPS"]]},r:{title:"EchoGuard Radar Tower",icon:"◆",color:"#00cc66",what:"3x K-band ESA radars on 20 ft tower for 360° coverage.",specs:[["Radar","3x EchoGuard ESA"],["Band","K-band"],["FOV","120°x80°/unit"],["Tracks","20 sim./unit"],["SWaP","1.25kg, IP67, <50W"]]},ac:{title:"Acoustic MEMS Array",icon:"◎",color:"#a070d0",what:"16-element MEMS mic array with beamforming for DOA.",specs:[["Mics","16x Knowles SPH0645"],["Acq","Teensy 4.1"],["Compute","Jetson Orin Nano Super"],["Power","100W solar + 30Ah"],["Range","~300-500m"]]},eo:{title:"EO/IR Tracking Turret",icon:"◐",color:"#e0a030",what:"Gyro-stabilized LWIR thermal + HD PTZ with AI tracking.",specs:[["Gimbal","SPI M1-D"],["Tracker","MVP/9960"],["Compute","Jetson Orin Nano Super"],["Mount","Pole, PoE++"],["Coverage","360° pan"]]},c2:{title:"C2 Fusion Server",icon:"■",color:"#ffcc00",what:"Ingests all phenomenologies, fuses tracks, commands EA.",specs:[["Server","2x Dell R660xs"],["GPU","2x NVIDIA T1000"],["Net","10 GbE + fiber"],["SW","GNU Radio, PyTorch"],["UPS","2x APC 1500VA"]]}};

// ── Default SV-1 layout ──────────────────────────────────────────────────────
const DEFAULT_NODES=[
  {id:"s_1",t:"s",x:196,y:86},{id:"s_2",t:"s",x:490,y:54},{id:"s_3",t:"s",x:783,y:64},{id:"s_4",t:"s",x:1053,y:86},{id:"s_5",t:"s",x:1298,y:150},{id:"s_6",t:"s",x:1359,y:279},{id:"s_7",t:"s",x:1359,y:429},{id:"s_8",t:"s",x:1322,y:589},{id:"s_9",t:"s",x:1175,y:707},{id:"s_10",t:"s",x:930,y:729},{id:"s_11",t:"s",x:686,y:718},{id:"s_12",t:"s",x:416,y:675},{id:"s_13",t:"s",x:196,y:536},{id:"s_14",t:"s",x:122,y:364},{id:"s_15",t:"s",x:110,y:214},{id:"s_16",t:"s",x:563,y:343},{id:"s_17",t:"s",x:808,y:364},{id:"s_18",t:"s",x:563,y:450},{id:"s_19",t:"s",x:734,y:514},{id:"s_20",t:"s",x:1224,y:536},{id:"s_21",t:"s",x:1273,y:664},{id:"s_22",t:"s",x:1077,y:707},{id:"s_23",t:"s",x:1028,y:621},{id:"s_24",t:"s",x:1126,y:557},{id:"s_25",t:"s",x:979,y:471},{id:"s_26",t:"s",x:1028,y:321},{id:"s_27",t:"s",x:686,y:236},{id:"s_28",t:"s",x:563,y:579},{id:"s_29",t:"s",x:734,y:621},{id:"s_30",t:"s",x:1151,y:257},
  {id:"e_1",t:"e",x:588,y:321},{id:"e_2",t:"e",x:808,y:343},{id:"e_3",t:"e",x:514,y:493},{id:"e_4",t:"e",x:783,y:429},{id:"e_5",t:"e",x:637,y:450},{id:"e_6",t:"e",x:906,y:193},{id:"e_7",t:"e",x:1077,y:579},{id:"e_8",t:"e",x:1200,y:621},{id:"e_9",t:"e",x:930,y:514},{id:"e_10",t:"e",x:783,y:643},
  {id:"r_1",t:"r",x:269,y:107},{id:"r_2",t:"r",x:808,y:64},{id:"r_3",t:"r",x:1249,y:150},{id:"r_4",t:"r",x:1347,y:321},{id:"r_5",t:"r",x:1249,y:664},{id:"r_6",t:"r",x:808,y:718},{id:"r_7",t:"r",x:612,y:343},{id:"r_8",t:"r",x:1102,y:579},{id:"r_9",t:"r",x:367,y:600},{id:"r_10",t:"r",x:930,y:471},
  {id:"ac_1",t:"ac",x:245,y:75},{id:"ac_2",t:"ac",x:563,y:43},{id:"ac_3",t:"ac",x:881,y:54},{id:"ac_4",t:"ac",x:1175,y:107},{id:"ac_5",t:"ac",x:1322,y:193},{id:"ac_6",t:"ac",x:1347,y:343},{id:"ac_7",t:"ac",x:1347,y:493},{id:"ac_8",t:"ac",x:1273,y:664},{id:"ac_9",t:"ac",x:1028,y:729},{id:"ac_10",t:"ac",x:734,y:718},{id:"ac_11",t:"ac",x:441,y:664},{id:"ac_12",t:"ac",x:196,y:514},{id:"ac_13",t:"ac",x:98,y:321},{id:"ac_14",t:"ac",x:122,y:150},{id:"ac_15",t:"ac",x:686,y:321},{id:"ac_16",t:"ac",x:930,y:364},{id:"ac_17",t:"ac",x:686,y:450},{id:"ac_18",t:"ac",x:881,y:493},{id:"ac_19",t:"ac",x:1175,y:557},{id:"ac_20",t:"ac",x:1126,y:643},{id:"ac_21",t:"ac",x:979,y:686},{id:"ac_22",t:"ac",x:930,y:600},{id:"ac_23",t:"ac",x:1053,y:236},{id:"ac_24",t:"ac",x:1102,y:429},
  {id:"eo_1",t:"eo",x:612,y:321},{id:"eo_2",t:"eo",x:783,y:343},{id:"eo_3",t:"eo",x:881,y:214},{id:"eo_4",t:"eo",x:539,y:493},{id:"eo_5",t:"eo",x:318,y:107},{id:"eo_6",t:"eo",x:465,y:664},{id:"eo_7",t:"eo",x:1224,y:129},{id:"eo_8",t:"eo",x:857,y:664},{id:"eo_9",t:"eo",x:1077,y:557},{id:"eo_10",t:"eo",x:1224,y:621},{id:"eo_11",t:"eo",x:1200,y:707},{id:"eo_12",t:"eo",x:808,y:600},
  {id:"c2_1",t:"c2",x:612,y:493},{id:"c2_2",t:"c2",x:1102,y:611},
];

const LAYOUT_KEY="shaw_cuas_layout";
function loadLayout(){try{const s=localStorage.getItem(LAYOUT_KEY);return s?JSON.parse(s):null;}catch(e){return null;}}
function saveLayout(nodes){try{localStorage.setItem(LAYOUT_KEY,JSON.stringify(nodes));}catch(e){}}
function screenToSVG(el,cx,cy){const r=el.getBoundingClientRect();return{x:Math.round((cx-r.left)/r.width*1420),y:Math.round((cy-r.top)/r.height*750)};}

export default function App(){
  useFonts();const mobile=useMobile();
  const[view,setView]=useState("map");const[threat,setThreat]=useState(null);
  const[ly,setLy]=useState({s:true,e:true,r:true,ac:true,eo:true,ms:!mobile,fc:true});
  const[nodes,setNodes]=useState(()=>loadLayout()||[...DEFAULT_NODES]);
  const[armed,setArmed]=useState(null);
  const[sel,setSel]=useState(null);
  const[dragging,setDragging]=useState(null);
  const svgRef=useRef(null);const nextId=useRef(1000);

  // Satellite
  const[sat,setSat]=useState(false);const[gmapReady,setGmapReady]=useState(false);
  const[gmapKey,setGmapKey]=useState(loadGmapKey);const[showGmapPrompt,setShowGmapPrompt]=useState(false);
  const[gmapKeyInput,setGmapKeyInput]=useState("");
  const gmapRef=useRef(null);const gmapInstance=useRef(null);
  useEffect(()=>{if(!sat||!gmapKey||window.google?.maps)return;if(document.querySelector('script[src*="maps.googleapis.com"]'))return;const s=document.createElement("script");s.src=`https://maps.googleapis.com/maps/api/js?key=${gmapKey}&callback=__gmapInit`;s.async=true;s.defer=true;window.__gmapInit=()=>{setGmapReady(true);delete window.__gmapInit;};s.onerror=()=>{setSat(false);};document.head.appendChild(s);},[sat,gmapKey]);
  useEffect(()=>{if(window.google?.maps)setGmapReady(true);},[]);
  useEffect(()=>{if(!sat||!gmapReady||!gmapRef.current||gmapInstance.current)return;gmapInstance.current=new window.google.maps.Map(gmapRef.current,{center:{lat:33.9695,lng:-80.4690},zoom:14.5,mapTypeId:"satellite",disableDefaultUI:true,gestureHandling:"none",tilt:0,rotateControl:false,keyboardShortcuts:false});},[sat,gmapReady]);
  const toggleSat=useCallback(()=>{if(!sat&&!gmapKey){setShowGmapPrompt(true);return;}setSat(s=>!s);},[sat,gmapKey]);
  const saveGmapKeyAndGo=()=>{if(gmapKeyInput.trim()){saveGmapKey(gmapKeyInput.trim());setGmapKey(gmapKeyInput.trim());setShowGmapPrompt(false);setSat(true);}};

  useEffect(()=>{saveLayout(nodes);},[nodes]);
  const counts=useMemo(()=>{const c={};Object.keys(CAPS).forEach(k=>{c[k]=nodes.filter(n=>n.t===k).length;});return c;},[nodes]);
  const totalCost=useMemo(()=>nodes.reduce((a,n)=>a+(CAPS[n.t]?.cost||0),0),[nodes]);
  const meshNodes=useMemo(()=>nodes.filter(n=>n.t==="s"||n.t==="e"),[nodes]);
  const mLinks=useMemo(()=>{const o=[];for(let i=0;i<meshNodes.length;i++)for(let j=i+1;j<meshNodes.length;j++)if(Math.hypot(meshNodes[i].x-meshNodes[j].x,meshNodes[i].y-meshNodes[j].y)<200)o.push([i,j]);return o;},[meshNodes]);
  const c2s=useMemo(()=>nodes.filter(n=>n.t==="c2"),[nodes]);

  const placeNode=useCallback((x,y)=>{
    if(!armed||counts[armed]>=(CAPS[armed]?.max||999))return;
    nextId.current++;
    setNodes(prev=>[...prev,{id:`${armed}_${nextId.current}`,t:armed,x,y}]);
    if(!mobile)setArmed(null);
  },[armed,counts,mobile]);

  const handleSvgClick=useCallback((e)=>{
    if(!svgRef.current)return;
    const pt=screenToSVG(svgRef.current,e.clientX,e.clientY);
    if(armed){placeNode(pt.x,pt.y);return;}
    setSel(null);
  },[armed,placeNode]);

  const handleNodeDown=useCallback((e,id)=>{
    e.stopPropagation();if(armed)return;setSel(id);setDragging(id);
  },[armed]);

  const handleMove=useCallback((e)=>{
    if(!dragging||!svgRef.current)return;
    const cx=e.touches?e.touches[0].clientX:e.clientX;
    const cy=e.touches?e.touches[0].clientY:e.clientY;
    const pt=screenToSVG(svgRef.current,cx,cy);
    setNodes(prev=>prev.map(n=>n.id===dragging?{...n,x:pt.x,y:pt.y}:n));
  },[dragging]);

  const handleUp=useCallback(()=>{setDragging(null);},[]);
  const deleteNode=useCallback((id)=>{setNodes(prev=>prev.filter(n=>n.id!==id));setSel(null);},[]);
  useEffect(()=>{const h=e=>{if((e.key==="Delete"||e.key==="Backspace")&&sel&&document.activeElement?.tagName!=="INPUT"){e.preventDefault();deleteNode(sel);}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[sel,deleteNode]);

  const tg=k=>setLy(l=>({...l,[k]:!l[k]}));
  const handleShowOnMap=(scored)=>{setThreat(scored);setView("map");};
  const selNode=sel?nodes.find(n=>n.id===sel):null;
  const selTip=selNode?TIPS[selNode.t]:null;
  const selCap=selNode?CAPS[selNode.t]:null;

  // ── Render node shape ──────────────────────────────────────────────────────
  function NodeShape({n}){
    const cap=CAPS[n.t];if(!cap||ly[n.t]===false)return null;
    const isSel=sel===n.id;const sz=mobile?12:9;
    return<g style={{cursor:armed?"crosshair":"grab"}} filter={isSel?"url(#gl)":undefined}
      onMouseDown={e=>handleNodeDown(e,n.id)} onTouchStart={e=>{e.stopPropagation();handleNodeDown(e,n.id);}}
      onClick={e=>{e.stopPropagation();if(!armed)setSel(n.id);}}>
      {/* DF sub-nodes for RF and EA */}
      {(n.t==="s"||n.t==="e")&&<><circle cx={n.x-6} cy={n.y+5} r={1.8} fill="none" stroke={`${cap.color}${isSel?"77":"22"}`} strokeWidth="0.6"/><circle cx={n.x+6} cy={n.y+5} r={1.8} fill="none" stroke={`${cap.color}${isSel?"77":"22"}`} strokeWidth="0.6"/><circle cx={n.x} cy={n.y-7} r={1.8} fill="none" stroke={`${cap.color}${isSel?"77":"22"}`} strokeWidth="0.6"/></>}
      {n.t==="s"&&<circle cx={n.x} cy={n.y} r={sz} fill={isSel?cap.color:`${cap.color}55`} stroke={cap.color} strokeWidth={isSel?2.5:1.3}/>}
      {n.t==="e"&&<polygon points={`${n.x},${n.y-sz-2} ${n.x+sz+1},${n.y+sz-1} ${n.x-sz-1},${n.y+sz-1}`} fill={isSel?cap.color:`${cap.color}55`} stroke={cap.color} strokeWidth={isSel?2.5:1.3}/>}
      {n.t==="r"&&<><rect x={n.x-sz} y={n.y-sz} width={sz*2} height={sz*2} fill={isSel?cap.color:`${cap.color}55`} stroke={cap.color} strokeWidth={isSel?2.5:1.5} rx="2" transform={`rotate(45,${n.x},${n.y})`}/><text x={n.x} y={n.y+3.5} textAnchor="middle" fontSize={mobile?"8":"6"} fill="#fff" fontFamily="Oxanium,sans-serif" fontWeight="700">R</text></>}
      {n.t==="ac"&&<><circle cx={n.x} cy={n.y} r={sz} fill="none" stroke={isSel?cap.color:`${cap.color}40`} strokeWidth="0.7"/><circle cx={n.x} cy={n.y} r={sz*1.4} fill="none" stroke={`${cap.color}15`} strokeWidth="0.5"/><circle cx={n.x} cy={n.y} r={sz*0.55} fill={isSel?cap.color:`${cap.color}55`}/></>}
      {n.t==="eo"&&<><circle cx={n.x} cy={n.y} r={sz} fill="none" stroke={isSel?cap.color:`${cap.color}55`} strokeWidth={isSel?2:1.2}/><circle cx={n.x} cy={n.y} r={sz*0.4} fill={isSel?cap.color:`${cap.color}55`}/></>}
      {n.t==="c2"&&<><rect x={n.x-16} y={n.y-9} width={32} height={18} fill={isSel?`${cap.color}40`:`${cap.color}15`} stroke={cap.color} strokeWidth={isSel?2:1.5} rx="3"/><text x={n.x} y={n.y+3} textAnchor="middle" fontSize="5.5" fill={cap.color} fontFamily="Oxanium,sans-serif" fontWeight="700">C2</text></>}
    </g>;
  }

  return(
    <div style={{background:"#060a10",minHeight:"100vh",fontFamily:"'IBM Plex Mono',monospace",color:"#b8c4d0",overflow:"hidden"}}>
      <header style={{padding:mobile?"10px 12px 8px":"16px 24px 12px",borderBottom:"1px solid rgba(0,255,120,0.15)",display:"flex",justifyContent:"space-between",alignItems:mobile?"center":"flex-end",flexWrap:"wrap",gap:mobile?6:12}}>
        <div style={{flex:1,minWidth:0}}>
          {!mobile&&<div style={{fontFamily:"'Oxanium',sans-serif",fontSize:10,color:"#00ff88",letterSpacing:5,fontWeight:300}}>DODAF SV-1 SYSTEMS INTERFACE DESCRIPTION</div>}
          <div style={{display:"flex",alignItems:"baseline",gap:mobile?10:16,margin:mobile?"0":"4px 0 0"}}>
            <h1 onClick={()=>setView("map")} style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?16:20,fontWeight:700,color:view==="map"?"#e4ecf4":"#506070",letterSpacing:1.5,cursor:"pointer"}}>SV-1 MAP</h1>
            <span style={{color:"#1a3a2a",fontSize:mobile?16:20}}>|</span>
            <h1 onClick={()=>setView("threat")} style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?16:20,fontWeight:700,color:view==="threat"?"#e4ecf4":"#506070",letterSpacing:1.5,cursor:"pointer"}}>THREATS</h1>
            <span style={{color:"#1a3a2a",fontSize:mobile?16:20}}>|</span>
            <h1 onClick={()=>setView("cape")} style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?16:20,fontWeight:700,color:view==="cape"?"#e4ecf4":"#506070",letterSpacing:1.5,cursor:"pointer"}}>CAPE</h1>
          </div>
          {!mobile&&<div style={{fontSize:10,color:"#506070",marginTop:3}}>Shaw AFB, Sumter SC · {nodes.length} nodes · ${totalCost.toLocaleString()}</div>}
        </div>
        <div style={{fontSize:mobile?9:10,color:"#506070",textAlign:"right",lineHeight:1.7}}>
          <div><span style={{color:"#00ff88"}}>CLASSIFICATION:</span> UNCLASSIFIED // FOUO</div>
          {!mobile&&<div style={{fontFamily:"'Oxanium',sans-serif",fontSize:12,color:"#e4ecf4",fontWeight:600}}>${totalCost.toLocaleString()} TOTAL SYSTEM</div>}
        </div>
      </header>

      {view==="threat"?<ThreatMatrix onShowOnMap={handleShowOnMap} mobile={mobile}/>:view==="cape"?<CAPEView mobile={mobile}/>:(
        <div style={{display:"flex",flexDirection:"column",height:`calc(100vh - ${mobile?52:90}px)`,overflow:"hidden"}} onMouseMove={handleMove} onMouseUp={handleUp} onTouchMove={handleMove} onTouchEnd={handleUp}>

          {armed&&<div style={{padding:"6px 16px",background:`${CAPS[armed].color}15`,borderBottom:`2px solid ${CAPS[armed].color}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{CAPS[armed].icon}</span>
              <span style={{fontFamily:"'Oxanium',sans-serif",fontSize:11,color:CAPS[armed].color,letterSpacing:2,fontWeight:700}}>PLACING: {CAPS[armed].name.toUpperCase()}</span>
              <span style={{fontSize:10,color:"#607080"}}>({counts[armed]||0}/{CAPS[armed].max})</span>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:9,color:"#607080"}}>{mobile?"Tap map to place":"Click map to place"}</span>
              <button onClick={()=>setArmed(null)} style={{padding:"4px 12px",borderRadius:4,border:"1px solid rgba(255,60,60,0.3)",background:"transparent",color:"#ff6666",fontSize:10,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",minHeight:mobile?36:undefined}}>CANCEL</button>
            </div>
          </div>}

          <div style={{display:"flex",flex:1,overflow:"hidden",flexDirection:mobile?"column":"row"}}>
            <div style={{flex:"1 1 0",padding:mobile?4:8,minWidth:0,overflow:mobile?"auto":"hidden",WebkitOverflowScrolling:"touch"}}>
              <div style={{position:"relative",width:mobile?"200%":undefined,minWidth:mobile?700:undefined}}>
                {sat&&gmapReady&&<div ref={gmapRef} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",borderRadius:6,zIndex:0}}/>}
                <svg ref={svgRef} viewBox="0 0 1420 750" onClick={handleSvgClick} style={{position:"relative",zIndex:1,width:"100%",cursor:armed?"crosshair":dragging?"grabbing":"default",background:sat&&gmapReady?"transparent":"radial-gradient(ellipse at 45% 40%,#0e1520,#080c14)",borderRadius:6,border:`1px solid ${armed?CAPS[armed].color+"66":"rgba(0,255,120,0.1)"}`,userSelect:"none"}}>
                  <defs><radialGradient id="sg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(0,180,255,0.08)"/><stop offset="100%" stopColor="rgba(0,180,255,0)"/></radialGradient><radialGradient id="eg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(255,60,60,0.07)"/><stop offset="100%" stopColor="rgba(255,60,60,0)"/></radialGradient><radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(0,204,102,0.08)"/><stop offset="100%" stopColor="rgba(0,204,102,0)"/></radialGradient><radialGradient id="ag" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(160,112,208,0.1)"/><stop offset="100%" stopColor="rgba(160,112,208,0)"/></radialGradient><filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><pattern id="gr" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,255,120,0.02)" strokeWidth="0.5"/></pattern></defs>
                  <rect width="1420" height="750" fill={sat&&gmapReady?"rgba(0,0,0,0.3)":"url(#gr)"}/>
                  <path d={pPath} fill="rgba(0,255,120,0.012)" stroke="rgba(0,255,120,0.4)" strokeWidth="1.5" strokeDasharray="10,5"/>
                  <line x1={RW.x1} y1={RW.y1} x2={RW.x2} y2={RW.y2} stroke="rgba(200,200,200,0.2)" strokeWidth={RW.w}/><line x1={RW.x1} y1={RW.y1} x2={RW.x2} y2={RW.y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="20,16"/>
                  <text x={(RW.x1+RW.x2)/2-65} y={(RW.y1+RW.y2)/2-15} fontSize="9" fill="rgba(200,200,200,0.3)" fontFamily="Oxanium,sans-serif" letterSpacing="2" transform={`rotate(${rwA},${(RW.x1+RW.x2)/2-65},${(RW.y1+RW.y2)/2-15})`}>RUNWAY 04/22</text>
                  {ly.ms&&c2s.length>=2&&<><line x1={c2s[0].x} y1={c2s[0].y} x2={c2s[1].x} y2={c2s[1].y} stroke="rgba(255,200,0,0.2)" strokeWidth="2" strokeDasharray="12,4"/><text x={(c2s[0].x+c2s[1].x)/2} y={(c2s[0].y+c2s[1].y)/2-8} textAnchor="middle" fontSize="6" fill="rgba(255,200,0,0.35)" fontFamily="Oxanium,sans-serif" letterSpacing="1">FIBER BACKBONE</text></>}
                  {ly.fc&&FAC.map(f=><g key={f.id}><rect x={f.x-f.w/2} y={f.y-f.h/2} width={f.w} height={f.h} fill={pF(f.p)} stroke={pS(f.p)} strokeWidth="1" rx="3"/>{f.l.split("\n").map((line,li)=><text key={li} x={f.x} y={f.y+li*10-(f.l.split("\n").length-1)*5+4} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.6)" fontFamily="Oxanium,sans-serif" fontWeight="600" letterSpacing="0.5">{line}</text>)}</g>)}
                  {/* Coverage radii */}
                  {ly.s&&nodes.filter(n=>n.t==="s").map(n=><circle key={`cv${n.id}`} cx={n.x} cy={n.y} r={140} fill="url(#sg)" stroke="rgba(0,180,255,0.06)" strokeWidth="0.5"/>)}
                  {ly.e&&nodes.filter(n=>n.t==="e").map(n=><circle key={`cv${n.id}`} cx={n.x} cy={n.y} r={90} fill="url(#eg)" stroke="rgba(255,60,60,0.12)" strokeWidth="1" strokeDasharray="4,3"/>)}
                  {ly.r&&nodes.filter(n=>n.t==="r").map(n=><circle key={`cv${n.id}`} cx={n.x} cy={n.y} r={120} fill="url(#rg)" stroke="rgba(0,204,102,0.12)" strokeWidth="1.5" strokeDasharray="6,4"/>)}
                  {ly.ac&&nodes.filter(n=>n.t==="ac").map(n=><circle key={`cv${n.id}`} cx={n.x} cy={n.y} r={45} fill="url(#ag)" stroke="rgba(160,112,208,0.15)" strokeWidth="1" strokeDasharray="3,3"/>)}
                  {/* Mesh */}
                  {ly.ms&&mLinks.map(([a,b],i)=><line key={`ml${i}`} x1={meshNodes[a].x} y1={meshNodes[a].y} x2={meshNodes[b].x} y2={meshNodes[b].y} stroke="rgba(0,255,120,0.06)" strokeWidth="0.6"/>)}
                  {ly.ms&&nodes.filter(n=>n.t==="e").map(n=>{const tgt=c2s.length?c2s.reduce((b,c)=>Math.hypot(c.x-n.x,c.y-n.y)<Math.hypot(b.x-n.x,b.y-n.y)?c:b,c2s[0]):null;return tgt?<line key={`ec${n.id}`} x1={n.x} y1={n.y} x2={tgt.x} y2={tgt.y} stroke="rgba(255,200,0,0.06)" strokeWidth="0.7" strokeDasharray="6,4"/>:null;})}
                  {/* Nodes */}
                  {nodes.map(n=><NodeShape key={n.id} n={n}/>)}
                  <g transform="translate(40,710)"><line x1="0" y1="0" x2="90" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/><line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(255,255,255,0.3)"/><line x1="90" y1="-3" x2="90" y2="3" stroke="rgba(255,255,255,0.3)"/><text x="45" y="12" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)">~1 KM</text></g>
                  <g transform="translate(1380,40)"><line x1="0" y1="16" x2="0" y2="-6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/><polygon points="0,-10 -4,0 4,0" fill="rgba(255,255,255,0.4)"/><text x="0" y="-15" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="Oxanium,sans-serif" fontWeight="700">N</text></g>
                </svg>
              </div>
            </div>

            {/* Desktop right panel */}
            {!mobile&&<div style={{flex:"0 0 310px",padding:"8px 12px",display:"flex",flexDirection:"column",gap:8,overflowY:"auto"}}>
              <Blk t="CAPABILITIES — CLICK TO PLACE">
                {Object.entries(CAPS).map(([k,c])=>{const ct=counts[k]||0;const full=ct>=c.max;const isA=armed===k;
                  return<div key={k} onClick={()=>{if(!full)setArmed(isA?null:k);}} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",marginBottom:3,borderRadius:6,cursor:full?"not-allowed":"pointer",background:isA?`${c.color}20`:"rgba(255,255,255,0.02)",border:`1px solid ${isA?c.color+"88":"rgba(255,255,255,0.04)"}`,opacity:full?0.4:1,transition:"all 0.15s"}}>
                    <span style={{fontSize:14,color:c.color,width:20,textAlign:"center"}}>{c.icon}</span>
                    <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:isA?"#e4ecf4":"#b8c4d0"}}>{c.name}</div><div style={{fontSize:7.5,color:"#506070",marginTop:1}}>{c.desc}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,color:c.color,fontFamily:"'IBM Plex Mono',monospace"}}>{ct}/{c.max}</div><div style={{fontSize:7,color:"#405060"}}>${c.cost.toLocaleString()}/ea</div></div>
                  </div>;})}
                <div style={{display:"flex",gap:6,marginTop:4}}>
                  <button onClick={()=>{if(confirm("Reset to default SV-1 layout?")){setNodes([...DEFAULT_NODES]);setSel(null);setArmed(null);}}} style={{flex:1,padding:"5px",borderRadius:4,border:"1px solid rgba(0,255,120,0.2)",background:"transparent",color:"#00ff88",fontSize:8,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1}}>LOAD DEFAULT</button>
                  <button onClick={()=>{if(confirm("Clear all?")){setNodes([]);setSel(null);setArmed(null);}}} style={{flex:1,padding:"5px",borderRadius:4,border:"1px solid rgba(255,60,60,0.2)",background:"transparent",color:"#ff6666",fontSize:8,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1}}>CLEAR ALL</button>
                </div>
              </Blk>
              <Blk t="LAYERS">
                {[{k:"s",l:"RF Coverage",c:"#00b4ff"},{k:"e",l:"EA Range",c:"#ff3c3c"},{k:"r",l:"Radar Coverage",c:"#00cc66"},{k:"ac",l:"Acoustic Range",c:"#a070d0"},{k:"eo",l:"EO/IR Turrets",c:"#e0a030"},{k:"ms",l:"Mesh + C2",c:"#00ff88"},{k:"fc",l:"Facilities",c:"#ffb428"}].map(c=><label key={c.k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,cursor:"pointer",fontSize:9.5}}><div onClick={()=>tg(c.k)} style={{width:13,height:13,borderRadius:3,border:`2px solid ${c.c}`,background:ly[c.k]?`${c.c}30`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{ly[c.k]&&<div style={{width:5,height:5,borderRadius:2,background:c.c}}/>}</div><span style={{color:ly[c.k]?"#c8d0d8":"#506070"}}>{c.l}</span></label>)}
                <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:3,marginTop:3}}><label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:9.5}}><div onClick={toggleSat} style={{width:13,height:13,borderRadius:3,border:"2px solid #88aacc",background:sat?"rgba(136,170,204,0.3)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sat&&<div style={{width:5,height:5,borderRadius:2,background:"#88aacc"}}/>}</div><span style={{color:sat?"#c8d0d8":"#506070"}}>Satellite</span></label></div>
              </Blk>
              {selNode&&selTip?<Blk t={`${selCap.icon} ${selCap.name.toUpperCase()}`}>
                <div style={{fontSize:9.5,color:"#8898a8",lineHeight:1.55,marginBottom:6}}>{selTip.what}</div>
                {selTip.specs.map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.03)",fontSize:9}}><span style={{color:"#506070"}}>{k}</span><span style={{color:"#c8d0d8"}}>{v}</span></div>)}
                <button onClick={()=>deleteNode(sel)} style={{width:"100%",marginTop:8,padding:"6px",borderRadius:4,border:"1px solid rgba(255,60,60,0.3)",background:"rgba(255,60,60,0.06)",color:"#ff6666",fontSize:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif"}}>DELETE NODE</button>
                <div style={{fontSize:7,color:"#405060",marginTop:3,textAlign:"center"}}>Drag to reposition · Delete key to remove</div>
              </Blk>:<Blk t="INVENTORY">
                {Object.entries(CAPS).map(([k,c])=><div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:c.color,fontSize:11,width:16,textAlign:"center"}}>{c.icon}</span><span style={{fontSize:9.5}}>{c.name}</span></div><span style={{fontSize:9.5,color:"#e4ecf4",fontWeight:600}}>{counts[k]||0}</span></div>)}
                <div style={{marginTop:4,padding:"3px 0",borderTop:"1px solid rgba(0,255,120,0.15)",display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"Oxanium,sans-serif",fontSize:8,color:"#00ff88",letterSpacing:1}}>TOTAL</span><span style={{fontFamily:"Oxanium,sans-serif",fontSize:11,color:"#e4ecf4",fontWeight:700}}>{nodes.length} nodes · ${totalCost.toLocaleString()}</span></div>
              </Blk>}
            </div>}

            {/* Mobile bottom */}
            {mobile&&<div style={{flexShrink:0,borderTop:"1px solid rgba(0,255,120,0.15)",background:"#060a10"}}>
              <div style={{display:"flex",gap:6,padding:"8px 8px 4px",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                {Object.entries(CAPS).map(([k,c])=>{const ct=counts[k]||0;const full=ct>=c.max;const isA=armed===k;
                  return<button key={k} onClick={()=>{if(!full)setArmed(isA?null:k);}} style={{flexShrink:0,padding:"6px 10px",borderRadius:8,border:`2px solid ${isA?c.color:"#1a2a1a"}`,background:isA?`${c.color}20`:"rgba(6,10,16,0.9)",color:isA?c.color:"#607080",fontSize:10,fontWeight:700,fontFamily:"'Oxanium',sans-serif",cursor:full?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:5,minHeight:44,opacity:full?0.4:1}}>
                    <span style={{fontSize:13}}>{c.icon}</span><span>{c.name}</span><span style={{fontSize:8,opacity:0.5}}>{ct}/{c.max}</span>
                  </button>;})}
              </div>
              <div style={{display:"flex",gap:6,padding:"4px 8px 8px",alignItems:"center"}}>
                {sel&&<button onClick={()=>deleteNode(sel)} style={{padding:"6px 14px",borderRadius:6,border:"1px solid rgba(255,60,60,0.3)",background:"rgba(255,60,60,0.06)",color:"#ff6666",fontSize:10,fontFamily:"'Oxanium',sans-serif",minHeight:40}}>DEL</button>}
                <button onClick={toggleSat} style={{padding:"6px 10px",borderRadius:6,border:`2px solid ${sat?"#88aacc":"#1a2a3a"}`,background:sat?"rgba(136,170,204,0.15)":"transparent",color:sat?"#88aacc":"#506070",fontSize:10,fontFamily:"'Oxanium',sans-serif",minHeight:40}}>SAT</button>
                <button onClick={()=>{if(confirm("Load default SV-1?")){setNodes([...DEFAULT_NODES]);setSel(null);setArmed(null);}}} style={{padding:"6px 10px",borderRadius:6,border:"1px solid rgba(0,255,120,0.15)",background:"transparent",color:"#00ff88",fontSize:9,fontFamily:"'Oxanium',sans-serif",minHeight:40}}>DEFAULT</button>
                <div style={{flex:1,textAlign:"right",fontSize:9,color:"#506070"}}><span style={{fontWeight:700,color:"#e4ecf4"}}>{nodes.length}</span> nodes · <span style={{color:"#e4ecf4"}}>${(totalCost/1000).toFixed(0)}K</span></div>
              </div>
            </div>}
          </div>

          {!mobile&&<footer style={{padding:"6px 24px",borderTop:"1px solid rgba(0,255,120,0.1)",fontSize:7.5,color:"#303a44",flexShrink:0}}><div style={{padding:"4px 8px",background:"rgba(204,136,0,0.06)",border:"1px solid rgba(204,136,0,0.15)",borderRadius:4,color:"#8a7040",lineHeight:1.5}}>DISCLAIMER: The interceptor drones and configurations listed in this document would require extensive real world testing against each platform dozens of times to portray exact defeat and detection scoring averages. Please speak with your resident c-sUAS and base defense experts before making any technology decisions.</div></footer>}
        </div>
      )}

      {showGmapPrompt&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowGmapPrompt(false)}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#0a0e14",border:"1px solid rgba(0,255,120,0.3)",borderRadius:12,padding:mobile?20:24,maxWidth:420,width:"100%"}}>
          <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:12,color:"#00ff88",letterSpacing:3,marginBottom:12}}>GOOGLE MAPS API KEY</div>
          <div style={{fontSize:mobile?11:10,color:"#8898a8",lineHeight:1.6,marginBottom:12}}>Enter a Maps JavaScript API key. Get one at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{color:"#00ff88"}}>console.cloud.google.com</a>.</div>
          <input value={gmapKeyInput} onChange={e=>setGmapKeyInput(e.target.value)} placeholder="AIza..." style={{width:"100%",padding:mobile?"12px":"10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(0,255,120,0.2)",borderRadius:6,color:"#e4ecf4",fontSize:mobile?14:12,fontFamily:"'IBM Plex Mono',monospace",boxSizing:"border-box",outline:"none"}} onKeyDown={e=>e.key==="Enter"&&saveGmapKeyAndGo()}/>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={saveGmapKeyAndGo} style={{flex:1,padding:mobile?"12px":"8px",borderRadius:6,border:"1px solid rgba(0,255,120,0.3)",background:"rgba(0,255,120,0.1)",color:"#00ff88",fontSize:mobile?12:10,fontFamily:"'Oxanium',sans-serif",fontWeight:700,letterSpacing:2,cursor:"pointer",minHeight:mobile?44:undefined}}>SAVE + ENABLE</button>
            <button onClick={()=>setShowGmapPrompt(false)} style={{padding:mobile?"12px 16px":"8px 14px",borderRadius:6,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#506070",fontSize:mobile?12:10,cursor:"pointer"}}>CANCEL</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
function Blk({t,children}){return<div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,255,120,0.1)",borderRadius:8,padding:10}}><div style={{fontFamily:"Oxanium,sans-serif",fontSize:7.5,color:"#00ff88",letterSpacing:3,marginBottom:6,fontWeight:500}}>{t}</div>{children}</div>;}
