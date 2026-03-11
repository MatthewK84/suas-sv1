import { useState, useMemo } from "react";
import { analyzeDrones, HARDENED_MODS } from "./threatData";

const TC = { CRITICAL:"#ff0000", HIGH:"#ff4444", ELEVATED:"#ff9900", MODERATE:"#cccc00", LOW:"#00cc66" };
const TB = { CRITICAL:"rgba(60,0,0,0.6)", HIGH:"rgba(60,20,0,0.5)", ELEVATED:"rgba(60,42,0,0.5)", MODERATE:"rgba(42,40,0,0.4)", LOW:"rgba(13,40,24,0.4)" };

function Bar({ v, color = "#00ff88", w = 80 }) {
  return (
    <div style={{ width: w, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${v}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s" }} />
    </div>
  );
}

function ScoreCell({ v }) {
  const c = v >= 80 ? "#00cc66" : v >= 60 ? "#88cc00" : v >= 40 ? "#cccc00" : v >= 20 ? "#ff9900" : "#ff4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 100 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: c, width: 28, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace" }}>{v}%</span>
      <Bar v={v} color={c} w={60} />
    </div>
  );
}

export default function ThreatMatrix({ onShowOnMap }) {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("or");
  const [sortDir, setSortDir] = useState(-1);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");
  const [mods, setMods] = useState({});
  const [showMods, setShowMods] = useState(false);

  const toggleMod = (k) => setMods(m => ({ ...m, [k]: !m[k] }));
  const activeMods = Object.keys(mods).filter(k => mods[k]);

  const DATA = useMemo(() => analyzeDrones(mods), [mods]);
  const cats = useMemo(() => ["All", ...[...new Set(DATA.map(d => d.c))].sort()], [DATA]);

  const filtered = useMemo(() => {
    let r = DATA.filter(d => {
      if (filter !== "All" && d.c !== filter) return false;
      if (search && !d.n.toLowerCase().includes(search.toLowerCase()) && !d.m.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    r.sort((a, b) => (a[sort] > b[sort] ? 1 : a[sort] < b[sort] ? -1 : 0) * sortDir);
    return r;
  }, [DATA, filter, sort, sortDir, search]);

  const tiers = useMemo(() => {
    const t = { CRITICAL: 0, HIGH: 0, ELEVATED: 0, MODERATE: 0, LOW: 0 };
    filtered.forEach(d => t[d.rt]++);
    return t;
  }, [filtered]);

  const doSort = (k) => {
    if (sort === k) setSortDir(d => d * -1);
    else { setSort(k); setSortDir(-1); }
  };

  const SH = ({ k, children }) => (
    <th onClick={() => doSort(k)} style={{ padding: "8px 6px", cursor: "pointer", userSelect: "none", fontSize: 9, fontWeight: 600, letterSpacing: 1, color: sort === k ? "#00ff88" : "#506070", borderBottom: "1px solid rgba(0,255,120,0.2)", textAlign: "left", whiteSpace: "nowrap", position: "sticky", top: 0, background: "#0a0e14", zIndex: 2, fontFamily: "'IBM Plex Mono',monospace" }}>
      {children}{sort === k ? (sortDir > 0 ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Hardened Mode Panel */}
      <div style={{ borderBottom: "1px solid rgba(0,255,120,0.08)" }}>
        <div style={{ display: "flex", gap: 12, padding: "10px 20px", flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search platform or manufacturer..." style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,255,120,0.15)", borderRadius: 4, padding: "5px 10px", color: "#e4ecf4", fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", width: 220, outline: "none" }} />
          <div style={{ display: "flex", gap: 4 }}>
            {cats.map(c => <button key={c} onClick={() => setFilter(c)} style={{ padding: "3px 10px", borderRadius: 3, border: "1px solid " + (filter === c ? "rgba(0,255,120,0.4)" : "rgba(255,255,255,0.08)"), background: filter === c ? "rgba(0,255,120,0.1)" : "transparent", color: filter === c ? "#00ff88" : "#506070", fontSize: 9, cursor: "pointer", fontFamily: "'Oxanium',sans-serif", letterSpacing: 1, fontWeight: filter === c ? 600 : 400 }}>{c}</button>)}
          </div>
          <button onClick={() => setShowMods(!showMods)} style={{ padding: "3px 12px", borderRadius: 3, border: "1px solid " + (activeMods.length > 0 ? "rgba(255,60,60,0.5)" : "rgba(255,255,255,0.1)"), background: activeMods.length > 0 ? "rgba(255,60,60,0.12)" : "transparent", color: activeMods.length > 0 ? "#ff6666" : "#607080", fontSize: 9, cursor: "pointer", fontFamily: "'Oxanium',sans-serif", letterSpacing: 1, fontWeight: 600 }}>
            {activeMods.length > 0 ? `⚠ HARDENED (${activeMods.length})` : "OPERATOR MODS"}
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            {["CRITICAL", "HIGH", "ELEVATED", "MODERATE", "LOW"].filter(t => tiers[t] > 0).map(t =>
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: TC[t] }} />
                <span style={{ fontSize: 9, color: TC[t], fontWeight: 700, fontFamily: "'Oxanium',sans-serif" }}>{t}</span>
                <span style={{ fontSize: 11, color: "#e4ecf4", fontWeight: 700 }}>{tiers[t]}</span>
              </div>
            )}
          </div>
        </div>

        {showMods && (
          <div style={{ padding: "0 20px 12px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 8 }}>
            {Object.entries(HARDENED_MODS).map(([k, v]) => (
              <div key={k} onClick={() => toggleMod(k)} style={{ display: "flex", gap: 10, padding: "8px 10px", borderRadius: 4, border: `1px solid ${mods[k] ? "rgba(255,60,60,0.4)" : "rgba(255,255,255,0.06)"}`, background: mods[k] ? "rgba(255,60,60,0.06)" : "rgba(255,255,255,0.015)", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${mods[k] ? "#ff4444" : "#303a44"}`, background: mods[k] ? "rgba(255,60,60,0.3)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {mods[k] && <div style={{ width: 6, height: 6, borderRadius: 2, background: "#ff4444" }} />}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: mods[k] ? "#ff6666" : "#8898a8" }}>{v.icon} {v.label}</div>
                  <div style={{ fontSize: 8, color: "#506070", lineHeight: 1.4, marginTop: 2 }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table + Detail */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}>
            <thead>
              <tr style={{ background: "#0a0e14" }}>
                <SH k="n">PLATFORM</SH><SH k="m">MFR</SH><SH k="w">WEIGHT</SH><SH k="proto">PROTOCOL</SH>
                <SH k="rd">RF DET</SH><SH k="ad">ACOUSTIC</SH><SH k="rad">RADAR</SH><SH k="ed">EO/IR</SH>
                <SH k="pi">PROTO INJ</SH><SH k="jm">JAMMING</SH><SH k="gs">GPS SPOOF</SH><SH k="or">RISK</SH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const isSel = sel && sel.n === d.n;
                return (
                  <tr key={i} onClick={() => setSel(isSel ? null : d)} style={{ cursor: "pointer", background: isSel ? "rgba(0,255,120,0.08)" : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "rgba(0,255,120,0.04)"; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"; }}>
                    <td style={{ padding: "6px", fontWeight: 600, color: "#e4ecf4", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.n}</td>
                    <td style={{ padding: "6px", color: "#607080" }}>{d.m}</td>
                    <td style={{ padding: "6px", color: "#607080", textAlign: "right" }}>{(d.w / 1000).toFixed(1)}kg</td>
                    <td style={{ padding: "6px", color: "#88aacc", fontSize: 9 }}>{d.proto}</td>
                    <td style={{ padding: "6px" }}><ScoreCell v={d.rd} /></td>
                    <td style={{ padding: "6px" }}><ScoreCell v={d.ad} /></td>
                    <td style={{ padding: "6px" }}><ScoreCell v={d.rad} /></td>
                    <td style={{ padding: "6px" }}><ScoreCell v={d.ed} /></td>
                    <td style={{ padding: "6px" }}><ScoreCell v={d.pi} /></td>
                    <td style={{ padding: "6px" }}><ScoreCell v={d.jm} /></td>
                    <td style={{ padding: "6px" }}><ScoreCell v={d.gs} /></td>
                    <td style={{ padding: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: TC[d.rt], fontFamily: "'Oxanium',sans-serif" }}>{d.or}%</span>
                        <span style={{ fontSize: 8, fontWeight: 700, color: TC[d.rt], background: TB[d.rt], padding: "1px 5px", borderRadius: 2, letterSpacing: 1, fontFamily: "'Oxanium',sans-serif" }}>{d.rt}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {sel && (
          <div style={{ width: 330, borderLeft: "1px solid rgba(0,255,120,0.15)", padding: 16, overflow: "auto", background: "rgba(0,10,5,0.5)", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 8, color: "#00ff88", letterSpacing: 3 }}>THREAT PROFILE</div>
                <h2 style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 14, color: "#e4ecf4", margin: "4px 0", fontWeight: 700 }}>{sel.n}</h2>
              </div>
              <button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: "#506070", fontSize: 16, cursor: "pointer", padding: 4 }}>✕</button>
            </div>

            {/* Show on Map button */}
            {onShowOnMap && (
              <button onClick={() => onShowOnMap(sel)} style={{ width: "100%", padding: "7px 0", marginBottom: 10, borderRadius: 4, border: "1px solid rgba(0,255,120,0.3)", background: "rgba(0,255,120,0.06)", color: "#00ff88", fontSize: 10, fontFamily: "'Oxanium',sans-serif", fontWeight: 700, letterSpacing: 2, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,255,120,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(0,255,120,0.06)"}>
                ◎ SHOW ON MAP
              </button>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, margin: "8px 0", fontSize: 9 }}>
              {[["Manufacturer", sel.m], ["Category", sel.c], ["Platform", sel.p], ["Weight", (sel.w / 1000).toFixed(1) + "kg"], ["Protocol", sel.proto], ["RTK", sel.rtk ? "YES" : "NO"], ["Cellular", sel.cell ? "YES" : "NO"], ["Encrypted", sel.enc ? "YES" : "NO"], ["Autonomous", sel.auto ? "YES" : "NO"], ["Waypoints", sel.wp ? "YES" : "NO"]].map(([k, v], i) =>
                <div key={i} style={{ padding: "4px 6px", background: "rgba(255,255,255,0.02)", borderRadius: 3 }}>
                  <div style={{ color: "#405060", fontSize: 7, letterSpacing: 1, fontFamily: "'Oxanium',sans-serif" }}>{k.toUpperCase()}</div>
                  <div style={{ color: "#b8c4d0", fontWeight: 600, marginTop: 1 }}>{v}</div>
                </div>
              )}
            </div>

            {activeMods.length > 0 && (
              <div style={{ padding: "6px 8px", background: "rgba(255,60,60,0.06)", border: "1px solid rgba(255,60,60,0.2)", borderRadius: 4, marginBottom: 10 }}>
                <div style={{ fontSize: 7, color: "#ff6666", letterSpacing: 2, fontFamily: "'Oxanium',sans-serif", fontWeight: 600, marginBottom: 3 }}>ACTIVE MODIFICATIONS</div>
                {activeMods.map(k => <div key={k} style={{ fontSize: 8, color: "#ff9999" }}>{HARDENED_MODS[k].icon} {HARDENED_MODS[k].label}</div>)}
              </div>
            )}

            <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 8, color: "#00b4ff", letterSpacing: 2, margin: "12px 0 8px" }}>DETECTION SCORES</div>
            {[["RF (Passive DF+TDOA)", sel.rd, "#00b4ff"], ["Acoustic (MEMS)", sel.ad, "#a070d0"], ["Radar (K-band ESA)", sel.rad, "#00cc66"], ["EO/IR (Thermal+HD)", sel.ed, "#e0a030"]].map(([l, v, c], i) =>
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 2 }}>
                  <span style={{ color: "#607080" }}>{l}</span><span style={{ color: c, fontWeight: 700 }}>{v}%</span>
                </div>
                <Bar v={v} color={c} w={290} />
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid rgba(0,255,120,0.1)", marginTop: 4, fontSize: 10 }}>
              <span style={{ color: "#00ff88", fontFamily: "'Oxanium',sans-serif", fontSize: 8, letterSpacing: 1 }}>COMPOSITE DETECTION</span>
              <span style={{ color: "#e4ecf4", fontWeight: 700 }}>{sel.cd}%</span>
            </div>

            <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 8, color: "#ff3c3c", letterSpacing: 2, margin: "16px 0 8px" }}>EA DEFEAT SCORES</div>
            {[["Protocol Injection", sel.pi, "#ff6666"], ["Control Link Jamming", sel.jm, "#ff9944"], ["GPS L1 Spoofing", sel.gs, "#ffcc00"]].map(([l, v, c], i) =>
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 2 }}>
                  <span style={{ color: "#607080" }}>{l}</span><span style={{ color: c, fontWeight: 700 }}>{v}%</span>
                </div>
                <Bar v={v} color={c} w={290} />
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid rgba(255,60,60,0.2)", marginTop: 4, fontSize: 10 }}>
              <span style={{ color: "#ff3c3c", fontFamily: "'Oxanium',sans-serif", fontSize: 8, letterSpacing: 1 }}>COMPOSITE DEFEAT</span>
              <span style={{ color: "#e4ecf4", fontWeight: 700 }}>{sel.cdf}%</span>
            </div>

            <div style={{ marginTop: 16, padding: 12, background: TB[sel.rt], border: `1px solid ${TC[sel.rt]}33`, borderRadius: 6, textAlign: "center" }}>
              <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 8, color: "#607080", letterSpacing: 2 }}>OVERALL RISK</div>
              <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 28, fontWeight: 700, color: TC[sel.rt] }}>{sel.or}%</div>
              <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 11, fontWeight: 700, color: TC[sel.rt], letterSpacing: 3 }}>{sel.rt}</div>
            </div>

            <div style={{ marginTop: 12, fontSize: 8, color: "#405060", lineHeight: 1.5 }}>
              {sel.pi < 30 && <p style={{ color: "#ff6666", marginBottom: 4 }}>⚠ Protocol injection ineffective — {sel.proto} not in known signature database</p>}
              {sel.jm < 40 && <p style={{ color: "#ff9944", marginBottom: 4 }}>⚠ Jamming difficult — {sel.proto} uses robust FHSS{sel.cell ? " + cellular backup" : ""}</p>}
              {sel.gs < 50 && <p style={{ color: "#ffcc00", marginBottom: 4 }}>⚠ GPS spoofing limited — RTK provides cm-accuracy cross-check</p>}
              {sel.ad < 35 && <p style={{ color: "#a070d0", marginBottom: 4 }}>⚠ Acoustic detection weak — {sel.w}g too quiet beyond 200m</p>}
              {sel.rad < 45 && <p style={{ color: "#00cc66", marginBottom: 4 }}>⚠ Radar RCS marginal — small cross-section at {sel.w}g</p>}
              {sel.rd < 15 && <p style={{ color: "#00b4ff", marginBottom: 4 }}>⚠ RF-silent — no control link emissions for passive DF/TDOA</p>}
              {sel.or <= 5 && <p style={{ color: "#00cc66" }}>✓ All mechanisms effective — well-mitigated by SV-1</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
