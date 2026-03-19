import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { analyzeDrones, analyzeDrone, HARDENED_MODS, TOD_MODES, serializeScenario, deserializeScenario, generateBriefingHTML, generateCAPE, generatePPTX, EXTRACTION_PROMPT, validateExtracted, loadCustomDrones, saveCustomDrones, loadApiKey, saveApiKey, getDCInfo, runMonteCarlo, MC_DEFAULT_SIGMA, MC_SIGMA_LABELS, MC_SIGMA_GROUPS, getAllDroneNames, getDroneByName } from "./threatData";

const TC={CRITICAL:"#ff0000",ELEVATED:"#ff9900",LOW:"#00cc66"};
const TB={CRITICAL:"rgba(60,0,0,0.6)",ELEVATED:"rgba(60,42,0,0.5)",LOW:"rgba(13,40,24,0.4)"};
function Bar({v,color="#00ff88",w="100%"}){return<div style={{width:w,height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}><div style={{width:`${v}%`,height:"100%",background:color,borderRadius:3,transition:"width 0.3s"}}/></div>;}
function ScoreRow({label,v,color,mobile}){const c=color||(v>=80?"#00cc66":v>=60?"#88cc00":v>=40?"#cccc00":v>=20?"#ff9900":"#ff4444");return<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:mobile?6:4}}><span style={{fontSize:mobile?11:9,color:"#607080",width:mobile?90:70,flexShrink:0}}>{label}</span><div style={{flex:1}}><Bar v={v} color={c}/></div><span style={{fontSize:mobile?12:11,fontWeight:700,color:c,width:32,textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}>{v}%</span></div>;}
function ScoreCell({v}){const c=v>=80?"#00cc66":v>=60?"#88cc00":v>=40?"#cccc00":v>=20?"#ff9900":"#ff4444";return<div style={{display:"flex",alignItems:"center",gap:3,minWidth:60}}><span style={{fontSize:10,fontWeight:700,color:c,width:26,textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}>{v}%</span><Bar v={v} color={c} w={30}/></div>;}

function SysBlock({label,color,risk,tier,det,def,mobile}){return<div style={{padding:mobile?10:8,background:TB[tier],border:`1px solid ${TC[tier]}33`,borderRadius:6,textAlign:"center",flex:1,minWidth:mobile?80:60}}><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?7:6,color,letterSpacing:1,marginBottom:2}}>{label}</div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?22:18,fontWeight:700,color:TC[tier]}}>{risk}%</div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?9:8,fontWeight:700,color:TC[tier],letterSpacing:2}}>{tier}</div>{det!==undefined&&<div style={{fontSize:mobile?8:7,color:"#607080",marginTop:3}}>D:{det}% F:{def}%</div>}</div>;}

// ── DroneCompare Info Card ────────────────────────────────────────────────────
function DCInfoCard({d,mobile,style}){
  const dc=getDCInfo(d.n);
  if(!dc)return null;
  const [imgOk,setImgOk]=useState(true);
  return<div style={{background:"rgba(10,16,24,0.95)",border:"1px solid rgba(0,255,120,0.2)",borderRadius:8,overflow:"hidden",...style}}>
    {imgOk&&<div style={{background:"#111820",padding:"8px 0",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
      <img src={mobile?dc.imgLg:dc.img} alt={d.n} onError={()=>setImgOk(false)} style={{maxWidth:"100%",height:"auto",maxHeight:mobile?140:90,objectFit:"contain"}}/>
    </div>}
    <div style={{padding:mobile?"10px 12px":"6px 10px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:mobile?6:3,fontSize:mobile?10:8}}>
        {[["Weight",(d.w/1000).toFixed(1)+"kg"],["Speed",d.s+"m/s"],["Flight",d.ft+"min"],["Protocol",d.proto],["Platform",d.p],["Price",d.pr?"$"+d.pr.toLocaleString():"N/A"]].map(([k,v],i)=>
          <div key={i} style={{display:"flex",justifyContent:"space-between",gap:4,padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
            <span style={{color:"#506070"}}>{k}</span><span style={{color:"#b8c4d0",fontWeight:600,fontFamily:"'IBM Plex Mono',monospace"}}>{v}</span>
          </div>)}
      </div>
      <a href={dc.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{display:"block",marginTop:mobile?8:5,padding:mobile?"8px 0":"4px 0",textAlign:"center",fontSize:mobile?10:7.5,color:"#00ff88",textDecoration:"none",border:"1px solid rgba(0,255,120,0.2)",borderRadius:4,fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:600}}>VIEW ON DRONECOMPARE ↗</a>
      <div style={{fontSize:mobile?7:6,color:"#304050",textAlign:"center",marginTop:3}}>Data: DroneCompare (CC-BY-4.0)</div>
    </div>
  </div>;
}

// ── Hover Popup Wrapper (desktop only) ────────────────────────────────────────
function DCHoverWrap({d,children}){
  const [show,setShow]=useState(false);
  const [pos,setPos]=useState({x:0,y:0});
  const ref=useRef(null);
  const dc=getDCInfo(d.n);
  if(!dc)return children;
  const onEnter=()=>{
    if(ref.current){
      const r=ref.current.getBoundingClientRect();
      setPos({x:r.left,y:r.bottom+4});
    }
    setShow(true);
  };
  return<div ref={ref} onMouseEnter={onEnter} onMouseLeave={()=>setShow(false)} style={{display:"inline",cursor:"pointer",position:"relative"}}>
    {children}<span style={{fontSize:8,color:"#00ff88",marginLeft:4,opacity:0.5,verticalAlign:"middle"}}>ℹ</span>
    {show&&<div style={{position:"fixed",left:Math.min(pos.x,window.innerWidth-260),top:pos.y,width:240,zIndex:100,pointerEvents:"auto"}} onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <DCInfoCard d={d}/>
    </div>}
  </div>;
}

function ThreatCard({d,onTap,isSel,showCompare,mobile}){return<div onClick={()=>onTap(d)} style={{padding:"12px 14px",background:isSel?"rgba(0,255,120,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${isSel?"rgba(0,255,120,0.3)":"rgba(255,255,255,0.04)"}`,borderRadius:8,marginBottom:8,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
    <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:"#e4ecf4",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.custom&&<span style={{fontSize:9,background:"rgba(100,100,255,0.2)",color:"#aaaaff",padding:"1px 5px",borderRadius:3,marginRight:6}}>C</span>}{mobile?d.n:<DCHoverWrap d={d}>{d.n}</DCHoverWrap>}</div><div style={{fontSize:10,color:"#607080",marginTop:2}}>{d.m} · {(d.w/1000).toFixed(1)}kg · {d.proto}</div></div>
    {!showCompare&&<div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:700,color:TC[d.rt],fontFamily:"'Oxanium',sans-serif"}}>{d.or}%</div><div style={{fontSize:9,fontWeight:700,color:TC[d.rt],background:TB[d.rt],padding:"2px 6px",borderRadius:3,letterSpacing:1,fontFamily:"'Oxanium',sans-serif"}}>{d.rt}</div></div>}
  </div>
  {showCompare&&<div style={{display:"flex",gap:6,marginBottom:8}}><SysBlock label="SV-1" color="#00cc66" risk={d.or} tier={d.rt} mobile/><SysBlock label="SUADS" color="#2266cc" risk={d.sRisk} tier={d.sTier} mobile/><SysBlock label="NINJA" color="#cc8800" risk={d.nRisk} tier={d.nTier} mobile/></div>}
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}><ScoreRow label="RF" v={d.rd} mobile/><ScoreRow label="Proto Inj" v={d.pi} mobile/><ScoreRow label="Acoustic" v={d.ad} mobile/><ScoreRow label="Jamming" v={d.jm} mobile/><ScoreRow label="Radar" v={d.rad} mobile/><ScoreRow label="GPS Spf" v={d.gs} mobile/></div>
</div>;}

function DetailContent({sel,mods,tod,onShowOnMap,onClose,onDelete,mobile}){
  const activeMods=Object.keys(mods).filter(k=>mods[k]);
  return<div style={{padding:mobile?20:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?9:8,color:sel.custom?"#aaaaff":"#00ff88",letterSpacing:3}}>{sel.custom?"CUSTOM THREAT":"THREAT PROFILE"}</div><h2 style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?18:14,color:"#e4ecf4",margin:"4px 0",fontWeight:700}}>{sel.n}</h2></div><button onClick={onClose} style={{background:"none",border:"none",color:"#506070",fontSize:mobile?24:16,cursor:"pointer",padding:8,minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div>
    {onShowOnMap&&<button onClick={()=>onShowOnMap(sel)} style={{width:"100%",padding:"10px 0",marginBottom:8,borderRadius:6,border:"1px solid rgba(0,255,120,0.3)",background:"rgba(0,255,120,0.06)",color:"#00ff88",fontSize:mobile?12:10,fontFamily:"'Oxanium',sans-serif",fontWeight:700,letterSpacing:2,cursor:"pointer",minHeight:44}}>◎ SHOW ON MAP</button>}
    {sel.custom&&onDelete&&<button onClick={()=>{onDelete(sel.n);onClose();}} style={{width:"100%",padding:"8px 0",marginBottom:12,borderRadius:6,border:"1px solid rgba(255,60,60,0.3)",background:"rgba(255,60,60,0.06)",color:"#ff6666",fontSize:mobile?11:9,fontFamily:"'Oxanium',sans-serif",fontWeight:600,cursor:"pointer",minHeight:mobile?40:32}}>DELETE CUSTOM</button>}
    <DCInfoCard d={sel} mobile={mobile} style={{marginBottom:10}}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,margin:"8px 0",fontSize:mobile?11:9}}>
      {[["Manufacturer",sel.m],["Category",sel.c],["Platform",sel.p],["Weight",(sel.w/1000).toFixed(1)+"kg"],["Protocol",sel.proto],["RTK",sel.rtk?"YES":"NO"],["Cellular",sel.cell?"YES":"NO"],["Encrypted",sel.enc?"YES":"NO"],["Autonomous",sel.auto?"YES":"NO"],["Waypoints",sel.wp?"YES":"NO"]].map(([k,v],i)=><div key={i} style={{padding:"5px 7px",background:"rgba(255,255,255,0.02)",borderRadius:4}}><div style={{color:"#405060",fontSize:mobile?8:7,letterSpacing:1,fontFamily:"'Oxanium',sans-serif"}}>{k.toUpperCase()}</div><div style={{color:"#b8c4d0",fontWeight:600,marginTop:1}}>{v}</div></div>)}
    </div>
    {activeMods.length>0&&<div style={{padding:"6px 8px",background:"rgba(255,60,60,0.06)",border:"1px solid rgba(255,60,60,0.2)",borderRadius:4,marginBottom:10}}><div style={{fontSize:mobile?8:7,color:"#ff6666",letterSpacing:2,fontFamily:"'Oxanium',sans-serif",fontWeight:600,marginBottom:3}}>MODIFICATIONS</div>{activeMods.map(k=><div key={k} style={{fontSize:mobile?10:8,color:"#ff9999"}}>{HARDENED_MODS[k].icon} {HARDENED_MODS[k].label}</div>)}</div>}

    {/* Three-way risk comparison */}
    <div style={{display:"flex",gap:6,margin:"12px 0"}}><SysBlock label="SV-1" color="#00cc66" risk={sel.or} tier={sel.rt} det={sel.cd} def={sel.cdf} mobile={mobile}/><SysBlock label="RD-SUADS" color="#2266cc" risk={sel.sRisk} tier={sel.sTier} det={sel.sDet} def={sel.sDefeat} mobile={mobile}/><SysBlock label="NINJA" color="#cc8800" risk={sel.nRisk} tier={sel.nTier} det={sel.nRF} def={sel.nDefeat} mobile={mobile}/></div>

    {/* SV-1 Detail */}
    <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?9:8,color:"#00ff88",letterSpacing:2,margin:"10px 0 6px"}}>SV-1 DETECTION (4 PHENOMENOLOGIES)</div>
    {[["RF (DF+TDOA)",sel.rd,"#00b4ff"],["Acoustic (MEMS)",sel.ad,"#a070d0"],["Radar (ESA)",sel.rad,"#00cc66"],["EO/IR (Thermal)",sel.ed,"#e0a030"]].map(([l,v,c],i)=><ScoreRow key={i} label={l} v={v} color={c} mobile={mobile}/>)}
    <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?9:8,color:"#ff3c3c",letterSpacing:2,margin:"10px 0 6px"}}>SV-1 DEFEAT (3 MECHANISMS)</div>
    {[["Proto Inject",sel.pi,"#ff6666"],["Jamming",sel.jm,"#ff9944"],["GPS Spoof",sel.gs,"#ffcc00"]].map(([l,v,c],i)=><ScoreRow key={i} label={l} v={v} color={c} mobile={mobile}/>)}

    {/* RD-SUADS Detail */}
    <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?9:8,color:"#2266cc",letterSpacing:2,margin:"14px 0 6px"}}>RD-SUADS (RF DET + C2/GNSS JAM)</div>
    <ScoreRow label="RF (MEDUSA)" v={sel.sRF} color="#2266cc" mobile={mobile}/>
    <ScoreRow label="C2 Jamming" v={sel.sJam} color="#4488dd" mobile={mobile}/>
    <ScoreRow label="GNSS Denial" v={sel.sGNSS} color="#4488dd" mobile={mobile}/>

    {/* NINJA Detail */}
    <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?9:8,color:"#cc8800",letterSpacing:2,margin:"14px 0 6px"}}>NINJA Gen2 (RF DET + PROTO MANIP)</div>
    <ScoreRow label="RF Detection" v={sel.nRF} color="#cc8800" mobile={mobile}/>
    <ScoreRow label="Proto Defeat" v={sel.nDefeat} color="#cc8800" mobile={mobile}/>

    {/* Gap notes */}
    <div style={{marginTop:12,fontSize:mobile?10:8,color:"#405060",lineHeight:1.5}}>
      {sel.pi<30&&<p style={{color:"#ff6666",marginBottom:4}}>⚠ SV-1 protocol injection fails against {sel.proto}</p>}
      {sel.jm<40&&<p style={{color:"#ff9944",marginBottom:4}}>⚠ SV-1 jamming limited against {sel.proto}{sel.cell?" + cellular":""}</p>}
      {sel.nDefeat<20&&<p style={{color:"#cc8800",marginBottom:4}}>⚠ NINJA defeat near zero: {sel.proto} not in protocol library</p>}
      {sel.sJam<45&&<p style={{color:"#2266cc",marginBottom:4}}>⚠ SUADS C2 jam weakened by {sel.proto} robust FHSS{sel.cell?" + cellular":""}</p>}
    </div>

    {/* DRONESMOKE Interceptors */}
    <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?9:8,color:"#00cc88",letterSpacing:2,margin:"16px 0 6px"}}>DRONESMOKE INTERCEPTORS (FPV PILOT)</div>
    <div style={{display:"flex",gap:6,margin:"6px 0"}}><SysBlock label="REDDI" color="#00cc88" risk={sel.iREff} tier={sel.iRTier} det={sel.iFPV} def={sel.iRStr} mobile={mobile}/><SysBlock label="SICA" color="#00aa77" risk={sel.iSEff} tier={sel.iSTier} det={sel.iFPV} def={sel.iSStr} mobile={mobile}/><SysBlock label="WASP" color="#009966" risk={sel.iWEff} tier={sel.iWTier} det={sel.iFPV} def={sel.iWStr} mobile={mobile}/></div>
    <div style={{fontSize:mobile?8:7,color:"#506070",marginTop:4,lineHeight:1.4}}>D = FPV pilot visual acquisition · F = physical strike on vulnerable components</div>
    <ScoreRow label="FPV Visual Det" v={sel.iFPV} color="#00ddaa" mobile={mobile}/>
    <ScoreRow label="REDDI (283mph)" v={sel.iRStr} color="#00cc88" mobile={mobile}/>
    <ScoreRow label="SICA (170mph 10G)" v={sel.iSStr} color="#00aa77" mobile={mobile}/>
    <ScoreRow label="WASP (200mph 5G)" v={sel.iWStr} color="#009966" mobile={mobile}/>

    {/* Wolf Block 3 — AI seeker, separate detection model */}
    <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?9:8,color:"#b8960a",letterSpacing:2,margin:"16px 0 6px"}}>WOLF BLOCK 3 (AI SEEKER · AUTONOMOUS)</div>
    <div style={{display:"flex",gap:6,margin:"6px 0"}}><SysBlock label="WOLF" color="#b8960a" risk={sel.iWolfEff} tier={sel.iWolfTier} det={sel.iWolfDet} def={sel.iWolfStr} mobile={mobile}/></div>
    <div style={{fontSize:mobile?8:7,color:"#506070",marginTop:4,lineHeight:1.4}}>D = AI seeker (dual EO/IR + YOLO) · F = PN-guided physical strike</div>
    <ScoreRow label="AI Seeker Det" v={sel.iWolfDet} color="#b8960a" mobile={mobile}/>
    <ScoreRow label="PN Strike (175mph)" v={sel.iWolfStr} color="#b8960a" mobile={mobile}/>
    <div style={{marginTop:6,fontSize:mobile?10:8,color:"#405060",lineHeight:1.5}}>
      {sel.iFPV<35&&<p style={{color:"#00ddaa",marginBottom:4}}>⚠ FPV pilot acquisition difficult: {(sel.w/1000).toFixed(1)}kg target hard to visually acquire</p>}
      {sel.iRStr<45&&sel.w<500&&<p style={{color:"#00cc88",marginBottom:4}}>⚠ REDDI strike limited: {(sel.w/1000).toFixed(1)}kg target — small prop area at 283 mph closure</p>}
      {sel.iSStr<45&&sel.s>25&&<p style={{color:"#00aa77",marginBottom:4}}>⚠ SICA closure marginal: target at {sel.s}m/s vs SICA 76m/s</p>}
      {sel.iWStr<45&&sel.w<500&&<p style={{color:"#009966",marginBottom:4}}>⚠ WASP 5G limits terminal correction against {(sel.w/1000).toFixed(1)}kg agile target</p>}
    </div>
  </div>;
}

export default function ThreatMatrix({onShowOnMap,mobile}){
  const [filter,setFilter]=useState("All");
  const [sort,setSort]=useState("or");
  const [sortDir,setSortDir]=useState(-1);
  const [sel,setSel]=useState(null);
  const [search,setSearch]=useState("");
  const [mods,setMods]=useState({});
  const [tod,setTod]=useState("day");
  const [showMods,setShowMods]=useState(false);
  const [showCompare,setShowCompare]=useState(true);
  const [showInterceptor,setShowInterceptor]=useState(false);
  const [scenarioName,setScenarioName]=useState("");
  const [copied,setCopied]=useState(false);
  const [customDrones,setCustomDrones]=useState(()=>loadCustomDrones());
  const [apiKey,setApiKey]=useState(()=>loadApiKey());
  const [showUpload,setShowUpload]=useState(false);
  const [analyzing,setAnalyzing]=useState(false);
  const [analyzeError,setAnalyzeError]=useState(null);
  const [dragOver,setDragOver]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const fileRef=useRef(null);const camRef=useRef(null);

  useEffect(()=>{if(window.location.hash){const sc=deserializeScenario(window.location.hash);if(sc.mods)setMods(sc.mods);if(sc.tod)setTod(sc.tod);if(sc.name)setScenarioName(sc.name);}},[]);

  const toggleMod=(k)=>setMods(m=>({...m,[k]:!m[k]}));
  const activeMods=Object.keys(mods).filter(k=>mods[k]);
  const DATA=useMemo(()=>analyzeDrones(mods,tod,customDrones),[mods,tod,customDrones]);
  const cats=useMemo(()=>["All",...(customDrones.length?["Custom"]:[]),...[...new Set(DATA.map(d=>d.c))].sort()],[DATA,customDrones]);
  const filtered=useMemo(()=>{let r=DATA.filter(d=>{if(filter==="Custom")return d.custom;if(filter!=="All"&&d.c!==filter)return false;if(search&&!d.n.toLowerCase().includes(search.toLowerCase())&&!d.m.toLowerCase().includes(search.toLowerCase()))return false;return true;});r.sort((a,b)=>(a[sort]>b[sort]?1:a[sort]<b[sort]?-1:0)*sortDir);return r;},[DATA,filter,sort,sortDir,search]);
  const tiers=useMemo(()=>{const t={CRITICAL:0,ELEVATED:0,LOW:0};filtered.forEach(d=>t[d.rt]++);return t;},[filtered]);
  const doSort=(k)=>{if(sort===k)setSortDir(d=>d*-1);else{setSort(k);setSortDir(-1);}};
  const deleteCustom=(name)=>{const u=customDrones.filter(d=>d.n!==name);setCustomDrones(u);saveCustomDrones(u);};
  const saveScen=useCallback(()=>{const hash=serializeScenario(mods,tod,sel?.n,scenarioName);window.location.hash=hash;navigator.clipboard.writeText(window.location.href).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}).catch(()=>{});},[mods,tod,sel,scenarioName]);
  const exportPDF=useCallback(()=>{const html=generateBriefingHTML(DATA,mods,tod,scenarioName);const w=window.open("","_blank");if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),500);}},[DATA,mods,tod,scenarioName]);
  const exportPPTX=useCallback((theme)=>{generatePPTX(DATA,mods,tod,scenarioName,theme).catch(e=>alert("PPTX export failed: "+e.message));},[DATA,mods,tod,scenarioName]);

  const analyzeFile=useCallback(async(file)=>{if(!apiKey){setShowSettings(true);setAnalyzeError("Enter API key in ⚙ Settings");return;}setAnalyzing(true);setAnalyzeError(null);try{const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=()=>rej(new Error("Read failed"));r.readAsDataURL(file);});const isImage=file.type.startsWith("image/");const mediaType=isImage?file.type:"application/pdf";const contentBlock=isImage?{type:"image",source:{type:"base64",media_type:mediaType,data:base64}}:{type:"document",source:{type:"base64",media_type:mediaType,data:base64}};const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,messages:[{role:"user",content:[contentBlock,{type:"text",text:EXTRACTION_PROMPT}]}]})});if(!resp.ok){const err=await resp.json().catch(()=>({}));throw new Error(err.error?.message||`API ${resp.status}`);}const data=await resp.json();const text=data.content?.map(b=>b.text||"").join("")||"";const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());const drone=validateExtracted(parsed);if(customDrones.some(d=>d.n===drone.n))drone.n+=` (${new Date().toLocaleTimeString()})`;const updated=[...customDrones,drone];setCustomDrones(updated);saveCustomDrones(updated);setShowUpload(false);setSel({...analyzeDrone(drone,mods,tod),custom:true});}catch(e){setAnalyzeError(e.message||"Failed");}finally{setAnalyzing(false);}},[apiKey,customDrones,mods,tod]);
  const handleFiles=(files)=>{if(files&&files[0])analyzeFile(files[0]);};

  const SH=({k,children,bg})=><th onClick={()=>doSort(k)} style={{padding:"8px 2px",cursor:"pointer",userSelect:"none",fontSize:7,fontWeight:600,letterSpacing:0.5,color:sort===k?"#00ff88":"#506070",borderBottom:"1px solid rgba(0,255,120,0.2)",textAlign:"left",whiteSpace:"nowrap",position:"sticky",top:0,background:bg||"#0a0e14",zIndex:2,fontFamily:"'IBM Plex Mono',monospace"}}>{children}{sort===k?(sortDir>0?"▲":"▼"):""}</th>;

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
      <div style={{borderBottom:"1px solid rgba(0,255,120,0.08)",padding:mobile?"10px 12px":"10px 20px"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(0,255,120,0.15)",borderRadius:4,padding:mobile?"8px 12px":"5px 10px",color:"#e4ecf4",fontSize:mobile?14:11,fontFamily:"'IBM Plex Mono',monospace",flex:mobile?"1 1 100%":"0 0 140px",outline:"none",minHeight:mobile?44:undefined}}/>
          <button onClick={()=>setShowCompare(!showCompare)} style={{padding:mobile?"8px 10px":"3px 10px",borderRadius:3,border:`1px solid ${showCompare?"rgba(100,100,255,0.5)":"rgba(255,255,255,0.1)"}`,background:showCompare?"rgba(100,100,255,0.12)":"transparent",color:showCompare?"#8888ff":"#607080",fontSize:mobile?11:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:700,minHeight:mobile?44:undefined,whiteSpace:"nowrap"}}>{showCompare?"3-WAY ✓":"3-WAY"}</button>
          <button onClick={()=>setShowInterceptor(!showInterceptor)} style={{padding:mobile?"8px 10px":"3px 10px",borderRadius:3,border:`1px solid ${showInterceptor?"rgba(0,200,150,0.5)":"rgba(255,255,255,0.1)"}`,background:showInterceptor?"rgba(0,200,150,0.12)":"transparent",color:showInterceptor?"#00cc88":"#607080",fontSize:mobile?11:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:700,minHeight:mobile?44:undefined,whiteSpace:"nowrap"}}>{showInterceptor?"INTCPT ✓":"INTCPT"}</button>
          <button onClick={()=>setShowUpload(!showUpload)} style={{padding:mobile?"8px 10px":"3px 8px",borderRadius:3,border:"1px solid rgba(100,200,255,0.4)",background:"rgba(100,200,255,0.08)",color:"#66bbff",fontSize:mobile?11:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:700,minHeight:mobile?44:undefined,whiteSpace:"nowrap"}}>+PDF</button>
          <button onClick={()=>setShowMods(!showMods)} style={{padding:mobile?"8px 10px":"3px 8px",borderRadius:3,border:"1px solid "+(activeMods.length?"rgba(255,60,60,0.5)":"rgba(255,255,255,0.1)"),background:activeMods.length?"rgba(255,60,60,0.12)":"transparent",color:activeMods.length?"#ff6666":"#607080",fontSize:mobile?11:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:600,minHeight:mobile?44:undefined,whiteSpace:"nowrap"}}>{activeMods.length?`⚠(${activeMods.length})`:"MODS"}</button>
          <button onClick={exportPDF} style={{padding:mobile?"8px 8px":"3px 8px",borderRadius:3,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#8888cc",fontSize:mobile?11:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:600,minHeight:mobile?44:undefined}}>PDF</button>
          <button onClick={()=>exportPPTX("dark")} style={{padding:mobile?"8px 8px":"3px 8px",borderRadius:3,border:"1px solid rgba(180,120,255,0.3)",background:"transparent",color:"#aa88ee",fontSize:mobile?11:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:600,minHeight:mobile?44:undefined}}>PPTX ◗</button>
          <button onClick={()=>exportPPTX("light")} style={{padding:mobile?"8px 8px":"3px 8px",borderRadius:3,border:"1px solid rgba(180,120,255,0.3)",background:"transparent",color:"#aa88ee",fontSize:mobile?11:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:600,minHeight:mobile?44:undefined}}>PPTX ◖</button>
          <button onClick={saveScen} style={{padding:mobile?"8px 8px":"3px 8px",borderRadius:3,border:"1px solid "+(copied?"rgba(0,255,120,0.5)":"rgba(255,255,255,0.1)"),background:copied?"rgba(0,255,120,0.1)":"transparent",color:copied?"#00ff88":"#607080",fontSize:mobile?11:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontWeight:600,minHeight:mobile?44:undefined,transition:"all 0.3s"}}>{copied?"✓":"SHARE"}</button>
          <button onClick={()=>setShowSettings(!showSettings)} style={{padding:mobile?"8px 6px":"3px 6px",borderRadius:3,border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"#405060",fontSize:mobile?14:11,cursor:"pointer",minHeight:mobile?44:undefined}}>⚙</button>
        </div>
        {showSettings&&<div style={{padding:"8px 0 12px",borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:8}}><div style={{fontSize:9,color:"#607080",marginBottom:4,fontFamily:"'Oxanium',sans-serif",letterSpacing:1}}>API KEY</div><input type="password" value={apiKey} onChange={e=>{setApiKey(e.target.value);saveApiKey(e.target.value);}} placeholder="sk-ant-..." style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:4,padding:"5px 10px",color:"#e4ecf4",fontSize:10,fontFamily:"'IBM Plex Mono',monospace",outline:"none"}}/>{customDrones.length>0&&<button onClick={()=>{if(confirm(`Delete ${customDrones.length} custom drones?`)){setCustomDrones([]);saveCustomDrones([]);}}} style={{marginTop:6,padding:"3px 10px",borderRadius:3,border:"1px solid rgba(255,60,60,0.3)",background:"transparent",color:"#ff6666",fontSize:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif"}}>Clear {customDrones.length} Custom</button>}</div>}
        {showUpload&&<div style={{marginBottom:12}}>{!apiKey&&<div style={{padding:"6px 10px",background:"rgba(255,200,0,0.08)",border:"1px solid rgba(255,200,0,0.3)",borderRadius:6,marginBottom:8,fontSize:10,color:"#ffcc44"}}>Set API key in ⚙ first</div>}<div onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files);}} onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} style={{border:`2px dashed ${dragOver?"rgba(100,200,255,0.6)":"rgba(100,200,255,0.2)"}`,borderRadius:8,padding:"20px",textAlign:"center",background:dragOver?"rgba(100,200,255,0.06)":"rgba(100,200,255,0.02)",cursor:"pointer"}} onClick={()=>fileRef.current?.click()}>{analyzing?<div style={{fontSize:11,color:"#66bbff",fontFamily:"'Oxanium',sans-serif",fontWeight:700}}>⏳ ANALYZING...</div>:<div><div style={{fontSize:14,marginBottom:4}}>📄</div><div style={{fontSize:11,color:"#66bbff",fontFamily:"'Oxanium',sans-serif",fontWeight:600}}>{mobile?"TAP TO UPLOAD":"DROP PDF / IMAGE"}</div></div>}</div><input ref={fileRef} type="file" accept="application/pdf,image/*" style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>{mobile&&<div style={{display:"flex",gap:8,marginTop:8}}><button onClick={()=>fileRef.current?.click()} style={{flex:1,padding:"10px",borderRadius:6,border:"1px solid rgba(100,200,255,0.3)",background:"rgba(100,200,255,0.06)",color:"#66bbff",fontSize:12,fontFamily:"'Oxanium',sans-serif",fontWeight:600,cursor:"pointer",minHeight:44}}>📁 FILES</button><button onClick={()=>camRef.current?.click()} style={{flex:1,padding:"10px",borderRadius:6,border:"1px solid rgba(100,200,255,0.3)",background:"rgba(100,200,255,0.06)",color:"#66bbff",fontSize:12,fontFamily:"'Oxanium',sans-serif",fontWeight:600,cursor:"pointer",minHeight:44}}>📷 CAMERA</button><input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/></div>}{analyzeError&&<div style={{padding:"6px 10px",background:"rgba(255,60,60,0.08)",border:"1px solid rgba(255,60,60,0.3)",borderRadius:6,marginTop:8,fontSize:10,color:"#ff6666"}}>{analyzeError}</div>}</div>}
        <div style={{display:"flex",gap:4,marginBottom:8,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>{Object.entries(TOD_MODES).map(([k,v])=><button key={k} onClick={()=>setTod(k)} style={{padding:mobile?"6px 12px":"3px 10px",borderRadius:3,border:"1px solid "+(tod===k?"rgba(100,100,255,0.4)":"rgba(255,255,255,0.06)"),background:tod===k?"rgba(100,100,255,0.1)":"transparent",color:tod===k?"#aaaaff":"#506070",fontSize:mobile?11:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:tod===k?600:400,whiteSpace:"nowrap",minHeight:mobile?40:undefined,flexShrink:0}}>{v.icon} {v.label}</button>)}</div>
        <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>{cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:mobile?"6px 14px":"3px 10px",borderRadius:3,border:"1px solid "+(filter===c?"rgba(0,255,120,0.4)":"rgba(255,255,255,0.08)"),background:filter===c?"rgba(0,255,120,0.1)":"transparent",color:filter===c?"#00ff88":"#506070",fontSize:mobile?12:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:filter===c?600:400,whiteSpace:"nowrap",minHeight:mobile?40:undefined,flexShrink:0}}>{c}</button>)}</div>
        <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>{["CRITICAL","ELEVATED","LOW"].filter(t=>tiers[t]>0).map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,borderRadius:2,background:TC[t]}}/><span style={{fontSize:9,color:TC[t],fontWeight:700,fontFamily:"'Oxanium',sans-serif"}}>{t}</span><span style={{fontSize:11,color:"#e4ecf4",fontWeight:700}}>{tiers[t]}</span></div>)}</div>
        {showMods&&<input value={scenarioName} onChange={e=>setScenarioName(e.target.value)} placeholder="Scenario name..." style={{width:"100%",marginTop:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4,padding:"5px 10px",color:"#e4ecf4",fontSize:10,fontFamily:"'IBM Plex Mono',monospace",outline:"none"}}/>}
      </div>
      {showMods&&<div style={{padding:mobile?"8px 12px 12px":"0 20px 12px",display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(240px,1fr))",gap:8,borderBottom:"1px solid rgba(0,255,120,0.08)"}}>{Object.entries(HARDENED_MODS).map(([k,v])=><div key={k} onClick={()=>toggleMod(k)} style={{display:"flex",gap:10,padding:"8px 10px",borderRadius:4,border:`1px solid ${mods[k]?"rgba(255,60,60,0.4)":"rgba(255,255,255,0.06)"}`,background:mods[k]?"rgba(255,60,60,0.06)":"rgba(255,255,255,0.015)",cursor:"pointer",minHeight:mobile?48:undefined}}><div style={{width:20,height:20,borderRadius:3,border:`2px solid ${mods[k]?"#ff4444":"#303a44"}`,background:mods[k]?"rgba(255,60,60,0.3)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{mods[k]&&<div style={{width:8,height:8,borderRadius:2,background:"#ff4444"}}/>}</div><div><div style={{fontSize:mobile?12:10,fontWeight:600,color:mods[k]?"#ff6666":"#8898a8"}}>{v.icon} {v.label}</div><div style={{fontSize:mobile?10:8,color:"#506070",marginTop:2}}>{v.desc}</div></div></div>)}</div>}

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {mobile?(
          <div style={{flex:1,overflow:"auto",padding:"8px 12px",WebkitOverflowScrolling:"touch"}}>
            {filtered.map((d,i)=><ThreatCard key={d.n+i} d={d} onTap={dd=>setSel(sel&&sel.n===dd.n?null:dd)} isSel={sel&&sel.n===d.n} showCompare={showCompare} mobile={mobile}/>)}
            {!filtered.length&&<div style={{textAlign:"center",padding:40,color:"#405060"}}>No match</div>}
          </div>
        ):(
          <div style={{flex:1,overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:9,fontFamily:"'IBM Plex Mono',monospace"}}>
              <thead><tr>
                <SH k="n">PLATFORM</SH><SH k="m">MFR</SH><SH k="proto">PROTO</SH>
                <SH k="rd">RF</SH><SH k="ad">ACU</SH><SH k="rad">RAD</SH><SH k="ed">EO</SH>
                <SH k="pi">INJ</SH><SH k="jm">JAM</SH><SH k="gs">GPS</SH>
                <SH k="or" bg="#001a08">SV-1</SH>
                {showCompare&&<><SH k="sRisk" bg="#0a1a33">SUADS</SH><SH k="nRisk" bg="#1a1100">NINJA</SH></>}
                {showInterceptor&&<><SH k="iREff" bg="#0a1a1a">REDDI</SH><SH k="iSEff" bg="#0a1a1a">SICA</SH><SH k="iWEff" bg="#0a1a1a">WASP</SH><SH k="iWolfEff" bg="#0a1a1a">WOLF</SH></>}
              </tr></thead>
              <tbody>{filtered.map((d,i)=>{const isSel=sel&&sel.n===d.n;return(<tr key={d.n+i} onClick={()=>setSel(isSel?null:d)} style={{cursor:"pointer",background:isSel?"rgba(0,255,120,0.08)":i%2===0?"rgba(255,255,255,0.01)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.03)"}} onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="rgba(0,255,120,0.04)";}} onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background=i%2===0?"rgba(255,255,255,0.01)":"transparent";}}>
                <td style={{padding:"5px 2px",fontWeight:600,color:"#e4ecf4",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.custom&&<span style={{fontSize:7,background:"rgba(100,100,255,0.2)",color:"#aaf",padding:"0 3px",borderRadius:2,marginRight:3}}>C</span>}{d.n}</td>
                <td style={{padding:"5px 2px",color:"#607080",fontSize:8}}>{d.m}</td>
                <td style={{padding:"5px 2px",color:"#88aacc",fontSize:7}}>{d.proto}</td>
                <td style={{padding:"3px 1px"}}><ScoreCell v={d.rd}/></td>
                <td style={{padding:"3px 1px"}}><ScoreCell v={d.ad}/></td>
                <td style={{padding:"3px 1px"}}><ScoreCell v={d.rad}/></td>
                <td style={{padding:"3px 1px"}}><ScoreCell v={d.ed}/></td>
                <td style={{padding:"3px 1px"}}><ScoreCell v={d.pi}/></td>
                <td style={{padding:"3px 1px"}}><ScoreCell v={d.jm}/></td>
                <td style={{padding:"3px 1px"}}><ScoreCell v={d.gs}/></td>
                <td style={{padding:"5px 2px",borderLeft:"2px solid rgba(0,255,120,0.1)"}}><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11,fontWeight:700,color:TC[d.rt],fontFamily:"'Oxanium',sans-serif"}}>{d.or}%</span><span style={{fontSize:6,fontWeight:700,color:TC[d.rt],background:TB[d.rt],padding:"1px 3px",borderRadius:2,fontFamily:"'Oxanium',sans-serif"}}>{d.rt}</span></div></td>
                {showCompare&&<>
                  <td style={{padding:"5px 2px",borderLeft:"2px solid rgba(34,102,204,0.15)"}}><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11,fontWeight:700,color:TC[d.sTier],fontFamily:"'Oxanium',sans-serif"}}>{d.sRisk}%</span><span style={{fontSize:6,fontWeight:700,color:TC[d.sTier],background:TB[d.sTier],padding:"1px 3px",borderRadius:2,fontFamily:"'Oxanium',sans-serif"}}>{d.sTier}</span></div></td>
                  <td style={{padding:"5px 2px",borderLeft:"2px solid rgba(204,136,0,0.15)"}}><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11,fontWeight:700,color:TC[d.nTier],fontFamily:"'Oxanium',sans-serif"}}>{d.nRisk}%</span><span style={{fontSize:6,fontWeight:700,color:TC[d.nTier],background:TB[d.nTier],padding:"1px 3px",borderRadius:2,fontFamily:"'Oxanium',sans-serif"}}>{d.nTier}</span></div></td>
                </>}
                {showInterceptor&&<>
                  <td style={{padding:"5px 2px",borderLeft:"2px solid rgba(0,200,150,0.15)"}}><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11,fontWeight:700,color:TC[d.iRTier],fontFamily:"'Oxanium',sans-serif"}}>{d.iREff}%</span><span style={{fontSize:6,fontWeight:700,color:TC[d.iRTier],background:TB[d.iRTier],padding:"1px 3px",borderRadius:2,fontFamily:"'Oxanium',sans-serif"}}>{d.iRTier}</span></div></td>
                  <td style={{padding:"5px 2px",borderLeft:"2px solid rgba(0,200,150,0.1)"}}><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11,fontWeight:700,color:TC[d.iSTier],fontFamily:"'Oxanium',sans-serif"}}>{d.iSEff}%</span><span style={{fontSize:6,fontWeight:700,color:TC[d.iSTier],background:TB[d.iSTier],padding:"1px 3px",borderRadius:2,fontFamily:"'Oxanium',sans-serif"}}>{d.iSTier}</span></div></td>
                  <td style={{padding:"5px 2px",borderLeft:"2px solid rgba(0,200,150,0.1)"}}><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11,fontWeight:700,color:TC[d.iWTier],fontFamily:"'Oxanium',sans-serif"}}>{d.iWEff}%</span><span style={{fontSize:6,fontWeight:700,color:TC[d.iWTier],background:TB[d.iWTier],padding:"1px 3px",borderRadius:2,fontFamily:"'Oxanium',sans-serif"}}>{d.iWTier}</span></div></td>
                  <td style={{padding:"5px 2px",borderLeft:"2px solid rgba(180,140,0,0.15)"}}><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11,fontWeight:700,color:TC[d.iWolfTier],fontFamily:"'Oxanium',sans-serif"}}>{d.iWolfEff}%</span><span style={{fontSize:6,fontWeight:700,color:TC[d.iWolfTier],background:TB[d.iWolfTier],padding:"1px 3px",borderRadius:2,fontFamily:"'Oxanium',sans-serif"}}>{d.iWolfTier}</span></div></td>
                </>}
              </tr>);})}</tbody>
            </table>
          </div>
        )}
        {sel&&!mobile&&<div style={{width:340,borderLeft:"1px solid rgba(0,255,120,0.15)",overflow:"auto",background:"rgba(0,10,5,0.5)",flexShrink:0}}><DetailContent sel={sel} mods={mods} tod={tod} onShowOnMap={onShowOnMap} onClose={()=>setSel(null)} onDelete={deleteCustom} mobile={false}/></div>}
      </div>
      {sel&&mobile&&<div style={{position:"absolute",bottom:0,left:0,right:0,maxHeight:"75vh",overflow:"auto",background:"#0a0e14",borderTop:"2px solid rgba(0,255,120,0.3)",borderRadius:"16px 16px 0 0",boxShadow:"0 -8px 40px rgba(0,0,0,0.6)",zIndex:10,WebkitOverflowScrolling:"touch"}}><div style={{width:40,height:4,borderRadius:2,background:"rgba(255,255,255,0.15)",margin:"10px auto 0"}}/><DetailContent sel={sel} mods={mods} tod={tod} onShowOnMap={onShowOnMap} onClose={()=>setSel(null)} onDelete={deleteCustom} mobile={true}/></div>}
    </div>
  );
}

// ── CAPE View (standalone tab) ────────────────────────────────────────────────
const CC={sv1:"#2EAE7A",ninja:"#C4793D",suads:"#4A7FB5",reddi:"#3A8F7D",sica:"#6B946E"};

export function CAPEView({mobile}){
  const DATA=useMemo(()=>analyzeDrones({}),[]);
  const CAPE=useMemo(()=>generateCAPE(DATA),[DATA]);
  const sorted=useMemo(()=>[...CAPE.systems].sort((a,b)=>b.eff[2]-a.eff[2]),[CAPE]);
  const[hover,setHover]=useState(null);
  const[visible,setVisible]=useState(()=>{const v={};sorted.forEach(s=>{v[s.id]=true;});return v;});
  const toggleSys=(id)=>setVisible(v=>({...v,[id]:!v[id]}));

  const maxCost=6500000;
  const chartH=380;const chartTop=50;const chartBot=chartTop+chartH;
  const chartL=120;const chartR=740;
  const costY=c=>chartBot-(c/maxCost)*chartH;
  const xAt=li=>chartL+li*((chartR-chartL)/2);

  const allPts=useMemo(()=>{
    const pts=[];
    sorted.forEach((s,si)=>{
      [1,2,3].forEach((lvl,li)=>{
        const cost=s.baseCost*lvl;
        pts.push({id:s.id,si,li,lvl,x:xAt(li),y:costY(cost),cost,eff:s.eff[li],label:s.label,color:CC[s.id]||s.color,scale:s.scale,baseCost:s.baseCost});
      });
    });
    // De-overlap labels per column
    [0,1,2].forEach(li=>{
      const col=pts.filter(p=>p.li===li).sort((a,b)=>a.y-b.y);
      col.forEach(p=>{p.labelY=p.y-24;});
      const minGap=22;
      for(let pass=0;pass<6;pass++){
        for(let i=1;i<col.length;i++){
          const gap=col[i].labelY-col[i-1].labelY;
          if(gap<minGap){const sh=(minGap-gap)/2+1;col[i-1].labelY-=sh;col[i].labelY+=sh;}
        }
      }
    });
    return pts;
  },[sorted,CAPE]);

  const sysPts=useMemo(()=>{const m={};allPts.forEach(p=>{if(!m[p.id])m[p.id]=[];m[p.id].push(p);});return m;},[allPts]);

  const secStyle={background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:mobile?12:16,marginTop:16};
  const secHead={fontFamily:"'Oxanium',sans-serif",fontSize:11,color:"#8898a8",letterSpacing:3,fontWeight:600,marginBottom:10,textTransform:"uppercase"};

  return(
    <div style={{flex:1,overflow:"auto",padding:mobile?"12px":"24px 36px",WebkitOverflowScrolling:"touch",height:`calc(100vh - ${mobile?52:90}px)`,background:"#060a10"}}>
      <div style={{maxWidth:1000}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:9,color:"#506070",letterSpacing:4,fontWeight:300,marginBottom:2}}>SHAW AFB C-UAS · INVESTMENT ANALYSIS</div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?16:20,fontWeight:700,color:"#d0d8e0",letterSpacing:1,marginBottom:20}}>Cost Assessment and Program Evaluation</div>

        {/* ── Toggle row ────────────────────────────────────────────── */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {sorted.map(s=>{const c=CC[s.id]||s.color;const on=visible[s.id];return<button key={s.id} onClick={()=>toggleSys(s.id)} style={{padding:"5px 12px",borderRadius:4,border:`1px solid ${on?c+"88":"rgba(255,255,255,0.08)"}`,background:on?c+"14":"transparent",color:on?c:"#405060",fontSize:9,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",letterSpacing:1,fontWeight:600,transition:"all 0.2s"}}>{s.label}{on?" ✓":""}</button>;})}
        </div>

        {/* ── Chart ─────────────────────────────────────────────────── */}
        <div style={{position:"relative",...secStyle,padding:0,overflow:"hidden"}}>
          <svg viewBox="0 0 800 480" style={{width:"100%",display:"block"}}>
            {/* Grid */}
            {[0,1,2,3,4,5,6].map(i=><line key={`g${i}`} x1={chartL} y1={chartTop+i*(chartH/6)} x2={chartR} y2={chartTop+i*(chartH/6)} stroke="rgba(255,255,255,0.035)" strokeWidth="0.5"/>)}
            {[0,1,2].map(i=><line key={`v${i}`} x1={xAt(i)} y1={chartTop-5} x2={xAt(i)} y2={chartBot+5} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>)}

            {/* Y-axis */}
            {["$6M","$5M","$4M","$3M","$2M","$1M","$0"].map((l,i)=><text key={l} x={chartL-12} y={chartTop+4+i*(chartH/6)} textAnchor="end" fontSize="8" fill="#405060" fontFamily="'IBM Plex Mono',monospace">{l}</text>)}
            <text x="30" y={(chartTop+chartBot)/2} textAnchor="middle" fontSize="8" fill="#405060" fontFamily="'Oxanium',sans-serif" letterSpacing="2" transform={`rotate(-90,30,${(chartTop+chartBot)/2})`}>TOTAL COST</text>

            {/* X-axis */}
            {["1x Baseline","2x Investment","3x Investment"].map((l,i)=><text key={l} x={xAt(i)} y={chartBot+30} textAnchor="middle" fontSize="9" fill="#8898a8" fontFamily="'Oxanium',sans-serif" fontWeight="600" letterSpacing="1">{l}</text>)}

            {/* Optimal zone */}
            <rect x={xAt(1)-15} y={costY(CAPE.optimal.cost)-25} width={xAt(1)-chartL+30} height="50" rx="6" fill="rgba(46,174,122,0.05)" stroke="rgba(46,174,122,0.15)" strokeWidth="1" strokeDasharray="6,4"/>

            {/* System lines (only visible ones) */}
            {sorted.filter(s=>visible[s.id]).map(s=>{
              const c=CC[s.id]||s.color;
              const pts=sysPts[s.id]||[];
              const pathD=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
              return<g key={s.id}>
                <path d={pathD} fill="none" stroke={c} strokeWidth="4" strokeLinejoin="round" opacity="0.08"/>
                <path d={pathD} fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" opacity="0.9"/>
              </g>;
            })}

            {/* Data points (only visible systems) */}
            {allPts.filter(p=>visible[p.id]).map((p,i)=>{
              const isHov=hover&&hover.id===p.id&&hover.lvl===p.lvl;
              return<g key={i} style={{cursor:"pointer"}} onMouseEnter={()=>setHover(p)} onMouseLeave={()=>setHover(null)} onClick={()=>setHover(hover&&hover.id===p.id&&hover.lvl===p.lvl?null:p)}>
                {Math.abs(p.labelY-(p.y-24))>4&&<line x1={p.x} y1={p.labelY+15} x2={p.x} y2={p.y-7} stroke={p.color} strokeWidth="0.5" opacity="0.2" strokeDasharray="2,2"/>}
                <rect x={p.x-16} y={p.labelY} width="32" height="14" rx="3" fill={isHov?p.color:"#080c14"} stroke={p.color} strokeWidth={isHov?1.5:0.7} opacity={isHov?1:0.85}/>
                <text x={p.x} y={p.labelY+10.5} textAnchor="middle" fontSize="8" fill={isHov?"#080c14":p.color} fontWeight="700" fontFamily="'IBM Plex Mono',monospace">{p.eff}%</text>
                <circle cx={p.x} cy={p.y} r={isHov?7:5} fill="#080c14" stroke={p.color} strokeWidth={isHov?2.5:1.5}/>
                <circle cx={p.x} cy={p.y} r={isHov?3:2} fill={p.color}/>
              </g>;
            })}

            {/* Optimal marker */}
            {(()=>{const oCost=CAPE.optimal.cost;const y=costY(oCost);const x=xAt(1);return<g>
              <line x1={x-25} y1={y} x2={x+25} y2={y} stroke="#2EAE7A" strokeWidth="1" strokeDasharray="4,3" opacity="0.6"/>
              <circle cx={x} cy={y} r="8" fill="none" stroke="#2EAE7A" strokeWidth="1.5" strokeDasharray="3,2"/>
              <circle cx={x} cy={y} r="3" fill="#2EAE7A"/>
              <rect x={x+14} y={y-14} width="135" height="28" rx="4" fill="rgba(8,12,20,0.92)" stroke="rgba(46,174,122,0.35)" strokeWidth="1"/>
              <text x={x+22} y={y-1} fontSize="8" fill="#2EAE7A" fontWeight="700" fontFamily="'Oxanium',sans-serif" letterSpacing="1">OPTIMAL INVESTMENT</text>
              <text x={x+22} y={y+10} fontSize="7" fill="#6aaa90" fontFamily="'IBM Plex Mono',monospace">${(oCost/1000000).toFixed(2)}M · {CAPE.optimal.eff}% combined</text>
            </g>;})()}

            {/* Legend */}
            {sorted.map((s,i)=>{const c=CC[s.id]||s.color;const on=visible[s.id];return<g key={`l${s.id}`} opacity={on?1:0.25}>
              <line x1={chartL+8} y1={chartTop+2+i*15} x2={chartL+24} y2={chartTop+2+i*15} stroke={c} strokeWidth="2"/>
              <circle cx={chartL+16} cy={chartTop+2+i*15} r="2.5" fill={c}/>
              <text x={chartL+30} y={chartTop+5+i*15} fontSize="7" fill={on?"#8898a8":"#303840"} fontFamily="'IBM Plex Mono',monospace">{s.label} ({s.eff[2]}%)</text>
            </g>;})}
          </svg>

          {/* Hover card */}
          {hover&&<div style={{position:"absolute",top:16,right:16,pointerEvents:"none",zIndex:20,padding:"14px 18px",background:"rgba(8,12,20,0.96)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",minWidth:220}}>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:11,fontWeight:700,color:hover.color,letterSpacing:1,marginBottom:8,borderBottom:`1px solid ${hover.color}33`,paddingBottom:6}}>{hover.label}</div>
            <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"4px 14px",fontSize:10,fontFamily:"'IBM Plex Mono',monospace"}}>
              <span style={{color:"#506070"}}>Level</span><span style={{color:"#c0c8d0",fontWeight:600}}>{hover.lvl}x Investment</span>
              <span style={{color:"#506070"}}>Cost</span><span style={{color:"#c0c8d0",fontWeight:600}}>${hover.cost>=1e6?(hover.cost/1e6).toFixed(2)+"M":(hover.cost/1000).toFixed(0)+"K"}</span>
              <span style={{color:"#506070"}}>Effectiveness</span><span style={{color:hover.eff>=81?"#2EAE7A":hover.eff>=61?"#C4A03D":"#B85C4A",fontWeight:700,fontSize:12}}>{hover.eff}%</span>
              <span style={{color:"#506070"}}>Cost/1%</span><span style={{color:"#c0c8d0"}}>${Math.round(hover.cost/hover.eff).toLocaleString()}</span>
            </div>
            {hover.li>0&&<div style={{marginTop:8,paddingTop:6,borderTop:"1px solid rgba(255,255,255,0.06)",fontSize:9,color:"#506070"}}>+{hover.eff-(allPts.find(pp=>pp.id===hover.id&&pp.li===hover.li-1)?.eff||0)}% from {hover.lvl-1}x · ${(hover.baseCost/1e6).toFixed(2)}M incremental</div>}
          </div>}
        </div>

        {/* ── Baseline Costs ───────────────────────────────────────── */}
        <div style={secStyle}>
          <div style={secHead}>Baseline System Costs (1x)</div>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":`repeat(${sorted.length},1fr)`,gap:10}}>
            {sorted.map(s=>{const c=CC[s.id]||s.color;return<div key={s.id} style={{padding:"10px 12px",background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:6,borderLeft:`3px solid ${c}`}}>
              <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:8,color:c,letterSpacing:1,fontWeight:600}}>{s.label.toUpperCase()}</div>
              <div style={{fontSize:16,fontWeight:700,color:"#d0d8e0",margin:"4px 0",fontFamily:"'IBM Plex Mono',monospace"}}>{s.baseCost>=1e6?"$"+(s.baseCost/1e6).toFixed(2)+"M":"$"+(s.baseCost/1000).toFixed(0)+"K"}</div>
              <div style={{fontSize:8,color:"#607080"}}>{s.eff[0]}% eff · ${Math.round(s.baseCost/s.eff[0]).toLocaleString()}/1%</div>
              <div style={{fontSize:7,color:"#405060",marginTop:2}}>{s.scale}</div>
            </div>;})}
          </div>
        </div>

        {/* ── Investment Scaling ────────────────────────────────────── */}
        <div style={secStyle}>
          <div style={secHead}>Investment Scaling</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,fontFamily:"'IBM Plex Mono',monospace"}}>
            <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <th style={{padding:"8px 6px",textAlign:"left",color:"#506070",fontSize:7,letterSpacing:1,fontFamily:"'Oxanium',sans-serif"}}>SYSTEM</th>
              {["1x Baseline","2x","3x"].map(l=><th key={l} style={{padding:"8px 6px",textAlign:"center",color:"#506070",fontSize:7,letterSpacing:1,fontFamily:"'Oxanium',sans-serif"}} colSpan={2}>{l}</th>)}
            </tr></thead>
            <tbody>{sorted.map((s,i)=>{const c=CC[s.id]||s.color;return<tr key={s.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
              <td style={{padding:"6px",fontWeight:600,color:c,fontSize:9}}>{s.label}</td>
              {[0,1,2].map(lvl=><>{
                }<td key={`c${lvl}`} style={{padding:"6px",textAlign:"right",color:"#607080",fontSize:8}}>${(s.baseCost*(lvl+1)/1e6).toFixed(2)}M</td>
                <td key={`e${lvl}`} style={{padding:"6px",textAlign:"center",fontWeight:700,fontSize:10,color:s.eff[lvl]>=81?"#2EAE7A":s.eff[lvl]>=61?"#C4A03D":"#B85C4A"}}>{s.eff[lvl]}%{lvl>0&&<span style={{fontSize:7,color:"#405060",marginLeft:4}}>+{s.eff[lvl]-s.eff[lvl-1]}</span>}</td></>)}
            </tr>;})}</tbody>
          </table>
        </div>

        {/* ── Recommendation ───────────────────────────────────────── */}
        <div style={{...secStyle,borderColor:"rgba(46,174,122,0.25)",background:"rgba(46,174,122,0.03)"}}>
          <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:12,fontWeight:700,color:"#2EAE7A",letterSpacing:1,marginBottom:8}}>Recommended: {CAPE.optimal.label}</div>
          <div style={{display:"flex",gap:24,flexWrap:"wrap",marginBottom:10}}>
            {[["Total Cost",`$${(CAPE.optimal.cost/1e6).toFixed(2)}M`,"#d0d8e0"],["Combined Eff",`${CAPE.optimal.eff}%`,"#2EAE7A"],["Cost/1%",`$${Math.round(CAPE.optimal.cost/CAPE.optimal.eff).toLocaleString()}`,"#d0d8e0"]].map(([k,v,c])=><div key={k}>
              <div style={{fontSize:7,color:"#506070",letterSpacing:1,fontFamily:"'Oxanium',sans-serif"}}>{k.toUpperCase()}</div>
              <div style={{fontSize:16,fontWeight:700,color:c,fontFamily:"'IBM Plex Mono',monospace",marginTop:2}}>{v}</div>
            </div>)}
          </div>
          <div style={{fontSize:9,color:"#708090",lineHeight:1.65}}>{CAPE.optimal.rationale}</div>
        </div>

        {/* ── Disclaimer ───────────────────────────────────────────── */}
        <div style={{...secStyle,borderColor:"rgba(180,140,60,0.15)",background:"rgba(180,140,60,0.02)",marginBottom:24}}>
          <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:7,fontWeight:600,color:"#8a7a50",letterSpacing:2,marginBottom:4}}>DISCLAIMER</div>
          <div style={{fontSize:9,color:"#6a6a5a",lineHeight:1.5}}>The interceptor drones and configurations listed in this document would require extensive real world testing against each platform dozens of times to portray exact defeat and detection scoring averages. Please speak with your resident c-sUAS and base defense experts before making any technology decisions.</div>
          <div style={{fontSize:7,color:"#505040",marginTop:4,lineHeight:1.4}}>Radar detection model calibrated against AERIS-10 open-source X-band phased array radar specifications (10.5 GHz PLFM, 8x16/32x16 arrays). Reference: github.com/NawfalMotii79/PLFM_RADAR</div>
        </div>
      </div>
    </div>
  );
}

// ── Monte Carlo Simulation Panel ──────────────────────────────────────────────
function MCHistogram({sv1,ninja,suads,iterations,mobile}){
  const w=mobile?320:700;const h=mobile?160:200;
  const pad={t:10,r:10,b:28,l:36};
  const cw=w-pad.l-pad.r;const ch=h-pad.t-pad.b;
  const bw=cw/20;
  const maxBin=Math.max(...sv1.bins,...ninja.bins,...suads.bins);
  const scaleY=v=>ch-(v/maxBin)*ch;
  const systems=[{bins:ninja.bins,color:"#cc8800",opacity:0.35},{bins:suads.bins,color:"#2266cc",opacity:0.4},{bins:sv1.bins,color:"#00cc66",opacity:0.5}];
  return(
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
      {[0,0.25,0.5,0.75,1].map((f,i)=>(
        <g key={i}>
          <line x1={pad.l} y1={pad.t+ch*f} x2={w-pad.r} y2={pad.t+ch*f} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
          <text x={pad.l-4} y={pad.t+ch*f+3} textAnchor="end" fontSize="7" fill="#506070" fontFamily="'IBM Plex Mono',monospace">
            {Math.round(maxBin*(1-f)/iterations*100)}%
          </text>
        </g>
      ))}
      {[0,20,40,60,80,100].map(v=>(
        <text key={v} x={pad.l+v/5*bw} y={h-4} textAnchor="middle" fontSize="7" fill="#506070" fontFamily="'IBM Plex Mono',monospace">{v}%</text>
      ))}
      {[61,81].map(v=>{
        const x=pad.l+v/5*bw;
        return <line key={v} x1={x} y1={pad.t} x2={x} y2={pad.t+ch} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="3,3"/>;
      })}
      {systems.map(({bins,color,opacity})=>(
        bins.map((count,i)=>{
          if(count===0)return null;
          const barH=(count/maxBin)*ch;
          return <rect key={`${color}-${i}`} x={pad.l+i*bw+1} y={pad.t+ch-barH} width={bw-2} height={barH} fill={color} opacity={opacity} rx="1"/>;
        })
      ))}
      {[{stats:sv1,color:"#00cc66"},{stats:suads,color:"#2266cc"},{stats:ninja,color:"#cc8800"}].map(({stats,color})=>{
        const x=pad.l+(stats.p50/5)*bw;
        return <line key={color} x1={x} y1={pad.t} x2={x} y2={pad.t+ch} stroke={color} strokeWidth="1.5" strokeDasharray="4,2" opacity="0.8"/>;
      })}
    </svg>
  );
}

function MCMiniHist({bins,color,iterations}){
  const w=200;const h=30;
  const bw=w/20;
  const maxBin=Math.max(...bins,1);
  return(
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
      {bins.map((count,i)=>{
        if(count===0)return null;
        const barH=(count/maxBin)*h;
        return <rect key={i} x={i*bw+0.5} y={h-barH} width={bw-1} height={barH} fill={color} opacity="0.5" rx="0.5"/>;
      })}
    </svg>
  );
}

export function MonteCarloPanel({mobile}){
  const [droneName,setDroneName]=useState(()=>"DJI Mavic 4 Pro");
  const [customDrones]=useState(()=>loadCustomDrones());
  const [mods,setMods]=useState({});
  const [tod,setTod]=useState("day");
  const [iterations,setIterations]=useState(5000);
  const [sigma,setSigma]=useState({...MC_DEFAULT_SIGMA});
  const [showSigma,setShowSigma]=useState(false);
  const [showThreat,setShowThreat]=useState(false);
  const [threatDist,setThreatDist]=useState([]);
  const [weightSigma,setWeightSigma]=useState(0);
  const [results,setResults]=useState(null);
  const [running,setRunning]=useState(false);
  const [elapsed,setElapsed]=useState(0);

  const allDrones=useMemo(()=>getAllDroneNames(customDrones),[customDrones]);

  const runSim=useCallback(()=>{
    setRunning(true);
    setTimeout(()=>{
      const t0=performance.now();
      const drone=getDroneByName(droneName,customDrones);
      const res=runMonteCarlo(drone,mods,tod,{iterations,sigma,threatDist:threatDist.length?threatDist:null,weightSigma});
      setElapsed(Math.round(performance.now()-t0));
      setResults(res);
      setRunning(false);
    },16);
  },[droneName,customDrones,mods,tod,iterations,sigma,threatDist,weightSigma]);

  const updateSigma=(key,val)=>setSigma(s=>({...s,[key]:val}));
  const addThreatAlt=()=>{
    const remaining=1-threatDist.reduce((s,t)=>s+t.prob,0);
    if(remaining<=0.01)return;
    setThreatDist(d=>[...d,{proto:"Custom ISM",prob:Math.round(remaining*100)/100}]);
  };
  const removeThreatAlt=(idx)=>setThreatDist(d=>d.filter((_,i)=>i!==idx));
  const updateThreatAlt=(idx,field,val)=>setThreatDist(d=>d.map((t,i)=>i===idx?{...t,[field]:val}:t));

  const ox="'Oxanium',sans-serif";const mono="'IBM Plex Mono',monospace";

  const SectionHead=({label,open,onToggle})=>(
    <div onClick={onToggle} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,255,120,0.1)",borderRadius:6,cursor:"pointer",marginBottom:8}}>
      <span style={{fontFamily:ox,fontSize:mobile?11:10,color:"#00ff88",letterSpacing:2,fontWeight:600}}>{label}</span>
      <span style={{color:"#506070",fontSize:14,transform:open?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>▾</span>
    </div>
  );

  return(
    <div style={{height:`calc(100vh - ${mobile?52:90}px)`,overflow:"auto",WebkitOverflowScrolling:"touch",padding:mobile?12:24}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:ox,fontSize:mobile?8:9,color:"#00ff88",letterSpacing:4,fontWeight:300,marginBottom:4}}>UNCERTAINTY QUANTIFICATION</div>
          <div style={{fontFamily:ox,fontSize:mobile?18:22,color:"#e4ecf4",fontWeight:700}}>MONTE CARLO SIMULATION</div>
          <div style={{fontSize:mobile?10:11,color:"#506070",marginTop:4}}>Sensor variance + threat parameter uncertainty across SV-1, RD-SUADS, and NINJA</div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr 1fr",gap:12,marginBottom:16}}>
          <div style={{padding:12,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,255,120,0.1)",borderRadius:8}}>
            <div style={{fontFamily:ox,fontSize:8,color:"#607080",letterSpacing:2,marginBottom:6}}>TARGET PLATFORM</div>
            <select value={droneName} onChange={e=>setDroneName(e.target.value)}
              style={{width:"100%",padding:"8px 10px",background:"#0a0e14",color:"#e4ecf4",border:"1px solid rgba(0,255,120,0.2)",borderRadius:4,fontFamily:mono,fontSize:mobile?12:11,outline:"none"}}>
              {allDrones.map(d=><option key={d.n} value={d.n}>{d.n} ({d.proto})</option>)}
            </select>
          </div>
          <div style={{padding:12,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,255,120,0.1)",borderRadius:8}}>
            <div style={{fontFamily:ox,fontSize:8,color:"#607080",letterSpacing:2,marginBottom:6}}>ENVIRONMENT</div>
            <select value={tod} onChange={e=>setTod(e.target.value)}
              style={{width:"100%",padding:"8px 10px",background:"#0a0e14",color:"#e4ecf4",border:"1px solid rgba(0,255,120,0.2)",borderRadius:4,fontFamily:mono,fontSize:mobile?12:11,marginBottom:8,outline:"none"}}>
              {Object.entries(TOD_MODES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {Object.entries(HARDENED_MODS).map(([k,v])=>(
                <button key={k} onClick={()=>setMods(m=>({...m,[k]:!m[k]}))}
                  style={{padding:"3px 8px",borderRadius:4,border:`1px solid ${mods[k]?"rgba(255,60,60,0.5)":"rgba(255,255,255,0.1)"}`,background:mods[k]?"rgba(255,60,60,0.15)":"transparent",color:mods[k]?"#ff6666":"#607080",fontFamily:mono,fontSize:mobile?10:9,cursor:"pointer"}}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{padding:12,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,255,120,0.1)",borderRadius:8}}>
            <div style={{fontFamily:ox,fontSize:8,color:"#607080",letterSpacing:2,marginBottom:6}}>ITERATIONS</div>
            <div style={{fontFamily:ox,fontSize:mobile?28:32,color:"#e4ecf4",fontWeight:700,marginBottom:4}}>{iterations.toLocaleString()}</div>
            <input type="range" min={1000} max={50000} step={1000} value={iterations} onChange={e=>setIterations(Number(e.target.value))}
              style={{width:"100%",accentColor:"#00ff88"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#506070",fontFamily:mono}}><span>1,000</span><span>50,000</span></div>
            <button onClick={runSim} disabled={running}
              style={{width:"100%",marginTop:10,padding:"10px 0",borderRadius:6,border:"1px solid rgba(0,255,120,0.4)",background:running?"rgba(0,255,120,0.05)":"rgba(0,255,120,0.12)",color:"#00ff88",fontFamily:ox,fontSize:mobile?13:12,fontWeight:700,letterSpacing:3,cursor:running?"wait":"pointer",minHeight:44}}>
              {running?"RUNNING...":"RUN SIMULATION"}
            </button>
          </div>
        </div>

        <SectionHead label="SENSOR PERFORMANCE VARIANCE (σ)" open={showSigma} onToggle={()=>setShowSigma(!showSigma)}/>
        {showSigma&&(
          <div style={{padding:16,background:"rgba(255,255,255,0.01)",border:"1px solid rgba(0,255,120,0.06)",borderRadius:8,marginBottom:16,marginTop:-4}}>
            {Object.entries(MC_SIGMA_GROUPS).map(([group,keys])=>(
              <div key={group} style={{marginBottom:12}}>
                <div style={{fontFamily:ox,fontSize:8,color:group.includes("SV-1")?"#00cc66":group.includes("NINJA")?"#cc8800":"#2266cc",letterSpacing:2,marginBottom:6}}>{group.toUpperCase()}</div>
                {keys.map(k=>(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:mobile?10:9,color:"#607080",width:mobile?120:140,flexShrink:0}}>{MC_SIGMA_LABELS[k]}</span>
                    <input type="range" min={0} max={20} step={1} value={sigma[k]} onChange={e=>updateSigma(k,Number(e.target.value))}
                      style={{flex:1,accentColor:group.includes("SV-1")?"#00cc66":group.includes("NINJA")?"#cc8800":"#2266cc"}}/>
                    <span style={{fontFamily:mono,fontSize:mobile?11:10,color:"#e4ecf4",width:28,textAlign:"right",fontWeight:600}}>±{sigma[k]}</span>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={()=>setSigma({...MC_DEFAULT_SIGMA})}
              style={{padding:"4px 12px",borderRadius:4,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#607080",fontFamily:mono,fontSize:9,cursor:"pointer",marginTop:4}}>Reset Defaults</button>
          </div>
        )}

        <SectionHead label="THREAT PARAMETER UNCERTAINTY" open={showThreat} onToggle={()=>setShowThreat(!showThreat)}/>
        {showThreat&&(
          <div style={{padding:16,background:"rgba(255,255,255,0.01)",border:"1px solid rgba(0,255,120,0.06)",borderRadius:8,marginBottom:16,marginTop:-4}}>
            <div style={{fontSize:mobile?10:9,color:"#607080",marginBottom:10}}>
              Define alternative protocol identities. Remaining probability stays on the selected platform's default protocol.
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:mobile?10:9,color:"#607080",width:100}}>Weight σ (grams)</span>
              <input type="range" min={0} max={200} step={5} value={weightSigma} onChange={e=>setWeightSigma(Number(e.target.value))}
                style={{flex:1,accentColor:"#ff9900"}}/>
              <span style={{fontFamily:mono,fontSize:10,color:"#e4ecf4",width:40,textAlign:"right"}}>±{weightSigma}g</span>
            </div>
            {threatDist.map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <select value={t.proto} onChange={e=>updateThreatAlt(i,"proto",e.target.value)}
                  style={{flex:1,padding:"6px 8px",background:"#0a0e14",color:"#e4ecf4",border:"1px solid rgba(255,150,0,0.3)",borderRadius:4,fontFamily:mono,fontSize:mobile?11:10,outline:"none"}}>
                  {["WiFi","Enhanced WiFi","OcuSync 4+","OcuSync 4","OcuSync 3+","OcuSync 3","OcuSync 2","OcuSync (gen 1)","Lightbridge","Lightbridge 2","SkyLink 2","SkyLink 3","Skydio Link","Microhard","Custom ISM","Futaba S-FHSS","Doodle Labs Mesh"].map(p=>
                    <option key={p} value={p}>{p}</option>
                  )}
                </select>
                <input type="number" min={0.01} max={1} step={0.01} value={t.prob}
                  onChange={e=>updateThreatAlt(i,"prob",Math.min(1,Math.max(0.01,Number(e.target.value))))}
                  style={{width:60,padding:"6px",background:"#0a0e14",color:"#ff9900",border:"1px solid rgba(255,150,0,0.3)",borderRadius:4,fontFamily:mono,fontSize:10,textAlign:"center",outline:"none"}}/>
                <button onClick={()=>removeThreatAlt(i)} style={{background:"none",border:"none",color:"#ff4444",fontSize:16,cursor:"pointer",padding:"4px 8px"}}>✕</button>
              </div>
            ))}
            {threatDist.reduce((s,t)=>s+t.prob,0)<0.99&&(
              <button onClick={addThreatAlt}
                style={{padding:"6px 14px",borderRadius:4,border:"1px solid rgba(255,150,0,0.3)",background:"rgba(255,150,0,0.06)",color:"#ff9900",fontFamily:mono,fontSize:mobile?10:9,cursor:"pointer"}}>
                + Add Protocol Alternative
              </button>
            )}
            {threatDist.length>0&&(
              <div style={{marginTop:8,fontSize:9,color:"#607080",fontFamily:mono}}>
                Base protocol retains {Math.round((1-threatDist.reduce((s,t)=>s+t.prob,0))*100)}% probability
              </div>
            )}
          </div>
        )}

        {results&&(
          <div style={{marginTop:8}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:6}}>
              <div>
                <span style={{fontFamily:ox,fontSize:mobile?8:9,color:"#00ff88",letterSpacing:3}}>RESULTS</span>
                <span style={{fontFamily:mono,fontSize:mobile?10:11,color:"#e4ecf4",fontWeight:700,marginLeft:10}}>{results.drone.n}</span>
              </div>
              <span style={{fontFamily:mono,fontSize:9,color:"#506070"}}>{results.iterations.toLocaleString()} iterations in {elapsed}ms</span>
            </div>

            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              {[["SV-1","#00cc66",results.sv1],["RD-SUADS","#2266cc",results.suads],["NINJA","#cc8800",results.ninja]].map(([label,color,stats])=>(
                <div key={label} style={{padding:12,background:"rgba(255,255,255,0.02)",border:`1px solid ${color}33`,borderRadius:8}}>
                  <div style={{fontFamily:ox,fontSize:8,color,letterSpacing:2,marginBottom:8}}>{label} EFFECTIVENESS</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                    <span style={{fontFamily:ox,fontSize:mobile?28:32,fontWeight:700,color:"#e4ecf4"}}>{stats.mean}%</span>
                    <span style={{fontFamily:mono,fontSize:10,color:"#607080"}}>±{stats.sd}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginTop:8,fontSize:mobile?10:9,fontFamily:mono}}>
                    <div style={{color:"#506070"}}>P5: <span style={{color:"#e4ecf4",fontWeight:600}}>{stats.p5}%</span></div>
                    <div style={{color:"#506070"}}>P95: <span style={{color:"#e4ecf4",fontWeight:600}}>{stats.p95}%</span></div>
                    <div style={{color:"#506070"}}>P25: <span style={{color:"#e4ecf4",fontWeight:600}}>{stats.p25}%</span></div>
                    <div style={{color:"#506070"}}>P75: <span style={{color:"#e4ecf4",fontWeight:600}}>{stats.p75}%</span></div>
                    <div style={{color:"#506070"}}>Median: <span style={{color:"#e4ecf4",fontWeight:600}}>{stats.p50}%</span></div>
                    <div style={{color:"#506070"}}>Range: <span style={{color:"#e4ecf4",fontWeight:600}}>{stats.min}-{stats.max}%</span></div>
                  </div>
                  <div style={{marginTop:10}}>
                    <div style={{fontFamily:ox,fontSize:7,color:"#506070",letterSpacing:1.5,marginBottom:4}}>TIER PROBABILITY</div>
                    <div style={{display:"flex",height:6,borderRadius:3,overflow:"hidden"}}>
                      {["LOW","ELEVATED","CRITICAL"].map(t=>(
                        stats.tiers[t]>0?<div key={t} style={{width:`${stats.tiers[t]}%`,background:TC[t],minWidth:stats.tiers[t]>0?1:0}} title={`${t}: ${stats.tiers[t]}%`}/>:null
                      ))}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
                      {["LOW","ELEVATED","CRITICAL"].map(t=>(
                        stats.tiers[t]>0&&<span key={t} style={{fontSize:8,fontFamily:mono,color:TC[t]}}>{t[0]}:{stats.tiers[t]}%</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{padding:16,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,255,120,0.08)",borderRadius:8,marginBottom:16}}>
              <div style={{fontFamily:ox,fontSize:9,color:"#00ff88",letterSpacing:3,marginBottom:12}}>EFFECTIVENESS DISTRIBUTION</div>
              <MCHistogram sv1={results.sv1} ninja={results.ninja} suads={results.suads} iterations={results.iterations} mobile={mobile}/>
              <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:10}}>
                {[["SV-1","#00cc66"],["RD-SUADS","#2266cc"],["NINJA","#cc8800"]].map(([l,c])=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:10,height:3,borderRadius:1,background:c}}/>
                    <span style={{fontFamily:ox,fontSize:8,color:c,letterSpacing:1}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:10,marginBottom:16}}>
              {[["SV-1 DETECTION",results.sv1.det,"#00cc66"],["SV-1 DEFEAT",results.sv1.def,"#00cc66"]].map(([label,stats,color])=>(
                <div key={label} style={{padding:12,background:"rgba(255,255,255,0.02)",border:`1px solid ${color}22`,borderRadius:8}}>
                  <div style={{fontFamily:ox,fontSize:8,color,letterSpacing:2,marginBottom:6}}>{label}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                    <span style={{fontFamily:ox,fontSize:22,fontWeight:700,color:"#e4ecf4"}}>{stats.mean}%</span>
                    <span style={{fontFamily:mono,fontSize:9,color:"#607080"}}>P5:{stats.p5}% P95:{stats.p95}%</span>
                  </div>
                  <div style={{marginTop:6}}><MCMiniHist bins={stats.bins} color={color} iterations={results.iterations}/></div>
                </div>
              ))}
            </div>

            <div style={{padding:14,background:"rgba(255,60,60,0.04)",border:"1px solid rgba(255,60,60,0.15)",borderRadius:8}}>
              <div style={{fontFamily:ox,fontSize:9,color:"#ff6666",letterSpacing:3,marginBottom:8}}>WORST-CASE ANALYSIS (P5)</div>
              <div style={{fontSize:mobile?11:10,color:"#b8c4d0",lineHeight:1.8}}>
                {(()=>{
                  const sv1P5=results.sv1.p5;const nP5=results.ninja.p5;const sP5=results.suads.p5;
                  const tierOf=e=>e>=81?"LOW":e>=61?"ELEVATED":"CRITICAL";
                  const sv1T=tierOf(sv1P5);const nT=tierOf(nP5);const sT=tierOf(sP5);
                  return <>
                    At the 5th percentile (1-in-20 worst engagement), {results.drone.n} drops SV-1 to{" "}
                    <span style={{color:TC[sv1T],fontWeight:700}}>{sv1P5}% effectiveness ({sv1T})</span>,
                    RD-SUADS to{" "}
                    <span style={{color:TC[sT],fontWeight:700}}>{sP5}% ({sT})</span>,
                    and NINJA to{" "}
                    <span style={{color:TC[nT],fontWeight:700}}>{nP5}% ({nT})</span>.
                    {sv1T!=="LOW"&&<> SV-1 breaches the LOW tier floor under worst-case sensor degradation for this platform.</>}
                    {sv1T==="LOW"&&<> SV-1 holds LOW tier even under worst-case sensor degradation.</>}
                  </>;
                })()}
              </div>
            </div>
          </div>
        )}

        {!results&&!running&&(
          <div style={{textAlign:"center",padding:mobile?"40px 20px":"60px 20px",color:"#304050"}}>
            <div style={{fontFamily:ox,fontSize:mobile?36:48,fontWeight:700,opacity:0.3,marginBottom:12}}>⟐</div>
            <div style={{fontFamily:ox,fontSize:mobile?12:14,letterSpacing:3,marginBottom:8}}>SELECT PLATFORM AND RUN</div>
            <div style={{fontSize:mobile?10:11,maxWidth:400,margin:"0 auto",lineHeight:1.6}}>
              Configure sensor variance and threat uncertainty, then run the simulation to see effectiveness distributions across all three systems.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
