import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { analyzeDrones, analyzeDrone, HARDENED_MODS, TOD_MODES, serializeScenario, deserializeScenario, generateBriefingHTML, generateCAPE, EXTRACTION_PROMPT, validateExtracted, loadCustomDrones, saveCustomDrones, loadApiKey, saveApiKey } from "./threatData";

const TC={CRITICAL:"#ff0000",ELEVATED:"#ff9900",LOW:"#00cc66"};
const TB={CRITICAL:"rgba(60,0,0,0.6)",ELEVATED:"rgba(60,42,0,0.5)",LOW:"rgba(13,40,24,0.4)"};
function Bar({v,color="#00ff88",w="100%"}){return<div style={{width:w,height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}><div style={{width:`${v}%`,height:"100%",background:color,borderRadius:3,transition:"width 0.3s"}}/></div>;}
function ScoreRow({label,v,color,mobile}){const c=color||(v>=80?"#00cc66":v>=60?"#88cc00":v>=40?"#cccc00":v>=20?"#ff9900":"#ff4444");return<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:mobile?6:4}}><span style={{fontSize:mobile?11:9,color:"#607080",width:mobile?90:70,flexShrink:0}}>{label}</span><div style={{flex:1}}><Bar v={v} color={c}/></div><span style={{fontSize:mobile?12:11,fontWeight:700,color:c,width:32,textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}>{v}%</span></div>;}
function ScoreCell({v}){const c=v>=80?"#00cc66":v>=60?"#88cc00":v>=40?"#cccc00":v>=20?"#ff9900":"#ff4444";return<div style={{display:"flex",alignItems:"center",gap:3,minWidth:60}}><span style={{fontSize:10,fontWeight:700,color:c,width:26,textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}>{v}%</span><Bar v={v} color={c} w={30}/></div>;}

function SysBlock({label,color,risk,tier,det,def,mobile}){return<div style={{padding:mobile?10:8,background:TB[tier],border:`1px solid ${TC[tier]}33`,borderRadius:6,textAlign:"center",flex:1,minWidth:mobile?80:60}}><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?7:6,color,letterSpacing:1,marginBottom:2}}>{label}</div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?22:18,fontWeight:700,color:TC[tier]}}>{risk}%</div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?9:8,fontWeight:700,color:TC[tier],letterSpacing:2}}>{tier}</div>{det!==undefined&&<div style={{fontSize:mobile?8:7,color:"#607080",marginTop:3}}>D:{det}% F:{def}%</div>}</div>;}

function ThreatCard({d,onTap,isSel,showCompare}){return<div onClick={()=>onTap(d)} style={{padding:"12px 14px",background:isSel?"rgba(0,255,120,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${isSel?"rgba(0,255,120,0.3)":"rgba(255,255,255,0.04)"}`,borderRadius:8,marginBottom:8,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
    <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:"#e4ecf4",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.custom&&<span style={{fontSize:9,background:"rgba(100,100,255,0.2)",color:"#aaaaff",padding:"1px 5px",borderRadius:3,marginRight:6}}>C</span>}{d.n}</div><div style={{fontSize:10,color:"#607080",marginTop:2}}>{d.m} · {(d.w/1000).toFixed(1)}kg · {d.proto}</div></div>
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
            {filtered.map((d,i)=><ThreatCard key={d.n+i} d={d} onTap={dd=>setSel(sel&&sel.n===dd.n?null:dd)} isSel={sel&&sel.n===d.n} showCompare={showCompare}/>)}
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
const CC={sv1:"#00ff88",ninja:"#ff6644",suads:"#4488ff",reddi:"#00ddaa",sica:"#44ccaa"};

export function CAPEView({mobile}){
  const DATA=useMemo(()=>analyzeDrones({}),[]);
  const CAPE=useMemo(()=>generateCAPE(DATA),[DATA]);
  // Sort systems by 3x effectiveness descending
  const sorted=useMemo(()=>[...CAPE.systems].sort((a,b)=>b.eff[2]-a.eff[2]),[CAPE]);
  const maxCost=6000000;
  const costY=(c)=>340-(c/maxCost)*290;

  return(
    <div style={{flex:1,overflow:"auto",padding:mobile?"12px":"20px 32px",WebkitOverflowScrolling:"touch",height:`calc(100vh - ${mobile?52:90}px)`,background:"#060a10"}}>
      <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:10,color:"#00ff88",letterSpacing:5,fontWeight:300,marginBottom:4}}>SHAW AFB C-UAS</div>
      <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:mobile?16:22,fontWeight:700,color:"#e4ecf4",letterSpacing:2,marginBottom:16}}>COST ASSESSMENT AND PROGRAM EVALUATION</div>

      {/* Main Chart */}
      <svg viewBox="0 0 820 420" style={{width:"100%",maxWidth:960,background:"linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.005))",borderRadius:10,border:"1px solid rgba(0,255,120,0.08)",padding:8}}>
        {/* Grid lines */}
        {[0,1,2,3,4,5,6].map(i=><line key={`g${i}`} x1="100" y1={50+i*48.3} x2="760" y2={50+i*48.3} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>)}
        {[0,1,2].map(i=><line key={`v${i}`} x1={180+i*260} y1="35" x2={180+i*260} y2="365" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="4,4"/>)}

        {/* Y-axis labels */}
        {["$6M","$5M","$4M","$3M","$2M","$1M","$0"].map((l,i)=><text key={l} x="90" y={54+i*48.3} textAnchor="end" fontSize="9" fill="#506070" fontFamily="'IBM Plex Mono',monospace">{l}</text>)}
        <text x="14" y="210" textAnchor="middle" fontSize="9" fill="#506070" fontFamily="'Oxanium',sans-serif" letterSpacing="2" transform="rotate(-90,14,210)">TOTAL COST</text>

        {/* X-axis labels */}
        {["1x BASELINE","2x INVESTMENT","3x INVESTMENT"].map((l,i)=><text key={l} x={180+i*260} y={395} textAnchor="middle" fontSize="10" fill="#e4ecf4" fontFamily="'Oxanium',sans-serif" fontWeight="700" letterSpacing="2">{l}</text>)}

        {/* Optimal zone highlight */}
        <rect x="390" y={costY(CAPE.optimal.cost)-22} width="180" height="44" rx="6" fill="rgba(0,255,136,0.06)" stroke="rgba(0,255,136,0.25)" strokeWidth="1.5" strokeDasharray="6,3"/>

        {/* System lines — sorted by final effectiveness */}
        {sorted.map((s,si)=>{
          const c=CC[s.id]||s.color;
          const pts=[1,2,3].map((lvl,i)=>({x:180+i*260,y:costY(s.baseCost*lvl),cost:s.baseCost*lvl,eff:s.eff[i],lvl}));
          const pathD=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
          return<g key={s.id}>
            {/* Line glow */}
            <path d={pathD} fill="none" stroke={c} strokeWidth="5" strokeLinejoin="round" opacity="0.15"/>
            <path d={pathD} fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
            {pts.map((p,i)=><g key={i}>
              <circle cx={p.x} cy={p.y} r="7" fill="#060a10" stroke={c} strokeWidth="2.5"/>
              <circle cx={p.x} cy={p.y} r="3" fill={c}/>
              <title>{`${s.label}\n${p.lvl}x: $${p.cost.toLocaleString()}\nEffectiveness: ${p.eff}%`}</title>
              {/* Effectiveness labels */}
              <rect x={p.x-14} y={p.y-22} width="28" height="14" rx="3" fill="#060a10" stroke={c} strokeWidth="0.8"/>
              <text x={p.x} y={p.y-12} textAnchor="middle" fontSize="8" fill={c} fontWeight="700" fontFamily="'IBM Plex Mono',monospace">{p.eff}%</text>
            </g>)}
          </g>;
        })}

        {/* Optimal point */}
        {(()=>{const oCost=CAPE.optimal.cost;const y=costY(oCost);const x=440;return<g>
          <line x1={x-30} y1={y} x2={x+30} y2={y} stroke="#00ff88" strokeWidth="1.5" strokeDasharray="4,3"/>
          <polygon points={`${x},${y-14} ${x+4},${y-4} ${x+13},${y-4} ${x+6},${y+2} ${x+8},${y+13} ${x},${y+7} ${x-8},${y+13} ${x-6},${y+2} ${x-13},${y-4} ${x-4},${y-4}`} fill="#00ff88" stroke="#060a10" strokeWidth="1"/>
          <rect x={x+18} y={y-12} width="130" height="24" rx="4" fill="rgba(0,255,136,0.12)" stroke="rgba(0,255,136,0.4)" strokeWidth="1"/>
          <text x={x+24} y={y-1} fontSize="8" fill="#00ff88" fontWeight="700" fontFamily="'Oxanium',sans-serif" letterSpacing="1">★ OPTIMAL POINT</text>
          <text x={x+24} y={y+9} fontSize="7" fill="#88ccaa" fontFamily="'IBM Plex Mono',monospace">${(oCost/1000000).toFixed(2)}M · {CAPE.optimal.eff}%</text>
          <title>{`${CAPE.optimal.label}\nCost: $${CAPE.optimal.cost.toLocaleString()}\nCombined: ${CAPE.optimal.eff}%`}</title>
        </g>;})()}

        {/* Legend — stacked by effectiveness */}
        {sorted.map((s,i)=>{const c=CC[s.id]||s.color;return<g key={`l${s.id}`}>
          <line x1="110" y1={50+i*18} x2="132" y2={50+i*18} stroke={c} strokeWidth="2.5"/>
          <circle cx="121" cy={50+i*18} r="3.5" fill={c}/>
          <text x="138" y={50+i*18+3.5} fontSize="8" fill={c} fontWeight="600" fontFamily="'IBM Plex Mono',monospace">{s.label} ({s.eff[2]}%)</text>
        </g>;})}

        {/* Diminishing returns annotation */}
        <text x="700" y="48" textAnchor="middle" fontSize="7" fill="#506070" fontFamily="'Oxanium',sans-serif" letterSpacing="1">DIMINISHING RETURNS →</text>
        <line x1="650" y1="44" x2="740" y2="44" stroke="#506070" strokeWidth="0.5" markerEnd="url(#arr)"/>
        <defs><marker id="arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#506070"/></marker></defs>
      </svg>

      {/* Baseline cost cards */}
      <div style={{marginTop:20}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:10,color:"#00ff88",letterSpacing:3,marginBottom:8}}>BASELINE SYSTEM COSTS (1x)</div>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":`repeat(${sorted.length},1fr)`,gap:10}}>
          {sorted.map(s=>{const c=CC[s.id]||s.color;return<div key={s.id} style={{padding:"10px 12px",background:`linear-gradient(135deg,${c}08,${c}03)`,border:`1px solid ${c}44`,borderRadius:8}}>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:9,color:c,letterSpacing:1.5,fontWeight:700}}>{s.label.toUpperCase()}</div>
            <div style={{fontSize:18,fontWeight:700,color:"#e4ecf4",margin:"6px 0",fontFamily:"'IBM Plex Mono',monospace"}}>{s.baseCost>=1000000?"$"+(s.baseCost/1000000).toFixed(2)+"M":"$"+(s.baseCost/1000).toFixed(0)+"K"}</div>
            <div style={{fontSize:9,color:"#8898a8"}}>{s.eff[0]}% eff · ${Math.round(s.baseCost/s.eff[0]).toLocaleString()}/1%</div>
            <div style={{fontSize:8,color:"#506070",marginTop:3}}>{s.scale}</div>
          </div>;})}
        </div>
      </div>

      {/* Investment scaling table */}
      <div style={{marginTop:20}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:10,color:"#00ff88",letterSpacing:3,marginBottom:8}}>INVESTMENT SCALING</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,fontFamily:"'IBM Plex Mono',monospace"}}>
          <thead><tr style={{borderBottom:"2px solid rgba(0,255,120,0.15)"}}>
            <th style={{padding:"8px 6px",textAlign:"left",color:"#607080",fontSize:8,letterSpacing:1}}>SYSTEM</th>
            {["1x BASELINE","2x","3x"].map(l=><th key={l} style={{padding:"8px 6px",textAlign:"center",color:"#607080",fontSize:8,letterSpacing:1}} colSpan={2}>{l}</th>)}
          </tr></thead>
          <tbody>{sorted.map((s,i)=>{const c=CC[s.id]||s.color;return<tr key={s.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)",background:i%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
            <td style={{padding:"6px",fontWeight:700,color:c,fontSize:10}}>{s.label}</td>
            {[0,1,2].map(lvl=><>{
              }<td key={`c${lvl}`} style={{padding:"6px",textAlign:"right",color:"#8898a8",fontSize:9}}>${(s.baseCost*(lvl+1)/1000000).toFixed(2)}M</td>
              <td key={`e${lvl}`} style={{padding:"6px",textAlign:"center",fontWeight:700,fontSize:11,color:s.eff[lvl]>=81?"#00ff88":s.eff[lvl]>=61?"#ff9900":"#ff4444"}}>{s.eff[lvl]}%{lvl>0&&<span style={{fontSize:8,color:"#506070",marginLeft:4}}>+{s.eff[lvl]-s.eff[lvl-1]}</span>}</td></>)}
          </tr>;})}</tbody>
        </table>
      </div>

      {/* Optimal recommendation */}
      <div style={{marginTop:20,padding:"16px 20px",background:"linear-gradient(135deg,rgba(0,255,136,0.06),rgba(0,255,136,0.02))",border:"2px solid rgba(0,255,136,0.35)",borderRadius:10}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:14,fontWeight:700,color:"#00ff88",letterSpacing:2,marginBottom:6}}>★ RECOMMENDED: {CAPE.optimal.label}</div>
        <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:8}}>
          <div><div style={{fontSize:8,color:"#506070",letterSpacing:1}}>TOTAL COST</div><div style={{fontSize:18,fontWeight:700,color:"#e4ecf4",fontFamily:"'IBM Plex Mono',monospace"}}>${(CAPE.optimal.cost/1000000).toFixed(2)}M</div></div>
          <div><div style={{fontSize:8,color:"#506070",letterSpacing:1}}>COMBINED EFF</div><div style={{fontSize:18,fontWeight:700,color:"#00ff88",fontFamily:"'IBM Plex Mono',monospace"}}>{CAPE.optimal.eff}%</div></div>
          <div><div style={{fontSize:8,color:"#506070",letterSpacing:1}}>COST PER 1%</div><div style={{fontSize:18,fontWeight:700,color:"#e4ecf4",fontFamily:"'IBM Plex Mono',monospace"}}>${Math.round(CAPE.optimal.cost/CAPE.optimal.eff).toLocaleString()}</div></div>
        </div>
        <div style={{fontSize:10,color:"#8898a8",lineHeight:1.7}}>{CAPE.optimal.rationale}</div>
      </div>
    </div>
  );
}
