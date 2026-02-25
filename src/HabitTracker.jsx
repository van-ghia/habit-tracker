import { useState, useEffect, useRef } from "react";

const SCHEDULE = [
  { id: "s1",  time: "05:15", label: "Morning Ritual",      detail: "Wake up, hydrate 500ml, stretch",            icon: "☀️", category: "personal" },
  { id: "s2",  time: "05:35", label: "Deep Learning Block", detail: "ZK proofs / crypto protocols / papers",      icon: "🧠", category: "learning" },
  { id: "s3",  time: "07:30", label: "Breakfast + Review",  detail: "Eat, review goals, skim dev updates",        icon: "🥗", category: "personal" },
  { id: "s4",  time: "08:00", label: "Pre-work Warmup",     detail: "Emails, Slack, PRs, easy tasks",            icon: "🔧", category: "work"     },
  { id: "s5",  time: "09:00", label: "Work — Block A",      detail: "Core protocol dev, deep implementation",    icon: "💼", category: "work"     },
  { id: "s6",  time: "12:00", label: "Lunch",               detail: "Eat properly, no screens",                  icon: "🍱", category: "personal" },
  { id: "s7",  time: "12:30", label: "Short Walk",          detail: "5–10 min gentle walk, aids digestion",      icon: "🚶", category: "personal" },
  { id: "s8",  time: "12:40", label: "Power Nap",           detail: "20 min max, lie flat, alarm set",           icon: "😴", category: "personal" },
  { id: "s9",  time: "13:00", label: "Work — Block B",      detail: "Meetings, code review, docs, async",        icon: "💼", category: "work"     },
  { id: "s10", time: "17:00", label: "Fitness",             detail: "Gym / run / bodyweight — full effort",      icon: "🏋️", category: "fitness"  },
  { id: "s11", time: "18:00", label: "Cook + Eat Dinner",   detail: "Cook, eat, decompress mentally",            icon: "🍳", category: "personal" },
  { id: "s12", time: "19:30", label: "Shower + Recover",    detail: "Shower, change, stretch",                   icon: "🚿", category: "personal" },
  { id: "s13", time: "20:00", label: "Side / Open Source",  detail: "Personal blockchain projects, OSS",         icon: "🛠️", category: "learning" },
  { id: "s14", time: "21:30", label: "Plan Tomorrow",       detail: "Write 3 priorities — non-negotiable",       icon: "📝", category: "personal" },
  { id: "s15", time: "21:45", label: "Wind Down",           detail: "Book, stretch, tea — no screens",           icon: "🌙", category: "personal" },
  { id: "s16", time: "22:15", label: "Sleep",               detail: "Lights out → wake 05:15 = 7h",             icon: "💤", category: "personal" },
];

const WEEKLY_HABITS = [
  { id: "wh1", label: "Deep Learning",          icon: "🧠", category: "learning"  },
  { id: "wh2", label: "Work done",              icon: "💼", category: "work"      },
  { id: "wh3", label: "Fitness",                icon: "🏋️", category: "fitness"   },
  { id: "wh4", label: "OSS / Side work",        icon: "🛠️", category: "learning"  },
  { id: "wh5", label: "Planned tomorrow",       icon: "📝", category: "personal"  },
  { id: "wh6", label: "No screens @ wind down", icon: "🌙", category: "personal"  },
  { id: "wh7", label: "Slept by 22:15",         icon: "💤", category: "personal"  },
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const CAT = {
  personal: { accent: "#7c6af7", light: "#f5f3ff" },
  learning: { accent: "#059669", light: "#ecfdf5" },
  work:     { accent: "#2563eb", light: "#eff6ff" },
  fitness:  { accent: "#d97706", light: "#fffbeb" },
};

const todayISO  = () => new Date().toISOString().split("T")[0];
const weekStart = () => {
  const d = new Date(), day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(new Date().setDate(diff)).toISOString().split("T")[0];
};

const lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

export default function HabitTracker() {
  const [tab, setTab]               = useState("routine");
  const [checked, setChecked]       = useState(() => lsGet('ht_checked', {}));
  const [notes, setNotes]           = useState(() => lsGet('ht_notes', {}));
  const [openNote, setOpenNote]     = useState(null);
  const [noteInput, setNoteInput]   = useState("");
  const [weekHabits, setWeekHabits] = useState(() => lsGet('ht_weekHabits', {}));
  const [todos, setTodos]           = useState(() => lsGet('ht_todos', []));
  const [priorities, setPriorities] = useState(() => lsGet('ht_priorities', ["","",""]));
  const [newTodo, setNewTodo]       = useState("");
  const [reviewChecks, setReviewChecks] = useState(() => lsGet('ht_reviewChecks', {}));
  const [now, setNow]               = useState(new Date());
  const noteRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (openNote && noteRef.current) noteRef.current.focus();
  }, [openNote]);

  useEffect(() => { localStorage.setItem('ht_checked', JSON.stringify(checked)); }, [checked]);
  useEffect(() => { localStorage.setItem('ht_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('ht_weekHabits', JSON.stringify(weekHabits)); }, [weekHabits]);
  useEffect(() => { localStorage.setItem('ht_todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('ht_priorities', JSON.stringify(priorities)); }, [priorities]);
  useEffect(() => { localStorage.setItem('ht_reviewChecks', JSON.stringify(reviewChecks)); }, [reviewChecks]);

  const todayDay = () => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; };

  const ck       = (id) => !!checked[`${todayISO()}_${id}`];
  const toggleCk = (id) => setChecked(p => ({ ...p, [`${todayISO()}_${id}`]: !p[`${todayISO()}_${id}`] }));

  const getNote  = (id) => notes[`${todayISO()}_${id}`] || "";
  const saveNote = (id, val) => setNotes(p => ({ ...p, [`${todayISO()}_${id}`]: val }));

  const openNoteFor = (id, e) => { e.stopPropagation(); setNoteInput(getNote(id)); setOpenNote(id); };
  const closeNote   = () => { if (openNote) { saveNote(openNote, noteInput); setOpenNote(null); } };

  const whDone   = (id, day) => !!weekHabits[`${weekStart()}_${id}_${day}`];
  const toggleWh = (id, day) => setWeekHabits(p => ({ ...p, [`${weekStart()}_${id}_${day}`]: !p[`${weekStart()}_${id}_${day}`] }));

  const completed = SCHEDULE.filter(s => ck(s.id)).length;
  const pct       = Math.round((completed / SCHEDULE.length) * 100);

  const parseT  = (t) => { const [h,m] = t.split(":").map(Number); return h + m/60; };
  const nowH    = now.getHours() + now.getMinutes()/60;
  const activeId = (() => {
    for (let i = 0; i < SCHEDULE.length - 1; i++)
      if (nowH >= parseT(SCHEDULE[i].time) && nowH < parseT(SCHEDULE[i+1].time)) return SCHEDULE[i].id;
    return null;
  })();

  const fmtTime = (d) => d.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", hour12: false });
  const fmtDate = (d) => d.toLocaleDateString("en-US", { weekday:"long", month:"short", day:"numeric" });

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos(p => [...p, { id: Date.now(), text: newTodo.trim(), done: false }]);
    setNewTodo("");
  };

  return (
    <div style={{ fontFamily: "'DM Mono','Fira Mono',monospace", background: "#f7f6f3", minHeight: "100vh", color: "#1c1917" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Lora:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#d6d3d1;border-radius:2px}
        button,input,textarea{font-family:inherit}

        .block-row{display:flex;align-items:flex-start;gap:12px;padding:11px 14px;border-radius:10px;border:1px solid #e7e5e4;background:#fff;transition:box-shadow .15s,border-color .15s;cursor:pointer}
        .block-row:hover{border-color:#c7c3bf;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .block-row.is-active{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.07)}
        .block-row.is-done{background:#fafaf9;opacity:.55}

        .cb{width:20px;height:20px;border-radius:5px;border:1.5px solid #d6d3d1;flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
        .cb:hover{border-color:#78716c}
        .cb.done{background:#1c1917;border-color:#1c1917}

        .note-btn{padding:2px 8px;border-radius:4px;border:1px solid #e7e5e4;background:transparent;color:#a8a29e;font-size:11px;cursor:pointer;transition:all .12s;white-space:nowrap;line-height:1.8}
        .note-btn:hover{border-color:#a8a29e;color:#57534e}
        .note-btn.has-note{border-color:#fcd34d;color:#92400e;background:#fefce8}

        .tab-btn{padding:9px 16px;border:none;background:none;cursor:pointer;font-size:12px;color:#a8a29e;border-bottom:2px solid transparent;transition:all .15s;letter-spacing:.3px}
        .tab-btn.active{color:#1c1917;border-bottom-color:#1c1917;font-weight:500}

        .hcell{width:30px;height:30px;border-radius:6px;border:1.5px solid #e7e5e4;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .12s;background:#fff}
        .hcell:hover{border-color:#a8a29e}
        .hcell.done{background:#1c1917;border-color:#1c1917}
        .hcell.today{border-color:#2563eb}

        .todo-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;border:1px solid #e7e5e4;background:#fff;transition:box-shadow .12s}
        .todo-row:hover{box-shadow:0 1px 5px rgba(0,0,0,.05)}

        .pbar{height:3px;background:#e7e5e4;border-radius:2px;overflow:hidden}
        .pbar-fill{height:100%;border-radius:2px;transition:width .4s ease}

        .input-std{width:100%;padding:9px 12px;border:1px solid #e7e5e4;border-radius:8px;font-size:13px;outline:none;background:#fff;transition:border .15s;color:#1c1917}
        .input-std:focus{border-color:#a8a29e}

        .pri-input{width:100%;padding:8px 11px;border:1px solid #e7e5e4;border-radius:7px;font-size:13px;outline:none;background:#fff;transition:border .15s;color:#1c1917}
        .pri-input:focus{border-color:#f59e0b}

        .pill{display:inline-block;padding:1px 7px;border-radius:20px;font-size:10px;font-weight:500;letter-spacing:.4px}

        .overlay{position:fixed;inset:0;background:rgba(28,25,23,.2);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;backdrop-filter:blur(3px)}
        .modal{background:#fff;border-radius:14px;padding:24px;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,.12)}

        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .18s ease forwards}

        .sec-label{font-size:10px;color:#a8a29e;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:10px}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e7e5e4", padding:"16px 20px" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:10, color:"#a8a29e", letterSpacing:2, textTransform:"uppercase", marginBottom:3 }}>Crypto Engineer · Daily OS</div>
              <div style={{ fontSize:18, fontWeight:600, color:"#1c1917", fontFamily:"'Lora',serif" }}>{fmtDate(now)}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:28, fontWeight:500, color:"#1c1917", fontFamily:"'Lora',serif", lineHeight:1 }}>{fmtTime(now)}</div>
              <div style={{ fontSize:11, color:"#a8a29e", marginTop:3 }}>{completed}/{SCHEDULE.length} blocks · {pct}%</div>
            </div>
          </div>
          <div className="pbar"><div className="pbar-fill" style={{ width:`${pct}%`, background:"#1c1917" }} /></div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e7e5e4" }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex" }}>
          {[["routine","Daily Routine"],["habits","Weekly Habits"],["todos","Todos & Priorities"],["rules","Rules"],["review","Monthly Review"]].map(([id,label]) => (
            <button key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px" }}>

        {/* ROUTINE TAB */}
        {tab === "routine" && (
          <div className="fade-in">
            {/* Category mini-stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:18 }}>
              {Object.entries(CAT).map(([cat, c]) => {
                const total = SCHEDULE.filter(s => s.category === cat).length;
                const done  = SCHEDULE.filter(s => s.category === cat && ck(s.id)).length;
                return (
                  <div key={cat} style={{ padding:"10px 12px", background:c.light, borderRadius:9, border:`1px solid ${c.accent}22` }}>
                    <div style={{ fontSize:16, fontWeight:600, color:c.accent, fontFamily:"'Lora',serif" }}>
                      {done}<span style={{ fontSize:11, color:"#a8a29e" }}>/{total}</span>
                    </div>
                    <div style={{ fontSize:10, color:"#78716c", marginTop:2, textTransform:"capitalize" }}>{cat}</div>
                    <div className="pbar" style={{ marginTop:5 }}>
                      <div className="pbar-fill" style={{ width:`${Math.round(done/total*100)}%`, background:c.accent }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Block list */}
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {SCHEDULE.map(block => {
                const done    = ck(block.id);
                const active  = activeId === block.id;
                const c       = CAT[block.category];
                const hasNote = getNote(block.id).trim().length > 0;
                return (
                  <div key={block.id}
                    className={`block-row${active?" is-active":""}${done?" is-done":""}`}
                    onClick={() => toggleCk(block.id)}>

                    {/* Checkbox */}
                    <div className={`cb${done?" done":""}`} onClick={e=>{e.stopPropagation();toggleCk(block.id);}}>
                      {done && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4l3 3 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>

                    {/* Icon */}
                    <span style={{ fontSize:16, width:20, textAlign:"center", flexShrink:0, marginTop:2 }}>{block.icon}</span>

                    {/* Text */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                        <span style={{ fontSize:13, fontWeight:500, color:done?"#a8a29e":"#1c1917", textDecoration:done?"line-through":"none" }}>
                          {block.label}
                        </span>
                        {active && (
                          <span style={{ fontSize:9, padding:"1px 6px", borderRadius:20, background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", fontWeight:600, letterSpacing:.8 }}>NOW</span>
                        )}
                        <span className="pill" style={{ background:c.light, color:c.accent }}>{block.category}</span>
                      </div>
                      <div style={{ fontSize:11, color:"#a8a29e", marginTop:2 }}>{block.detail}</div>

                      {/* Note preview */}
                      {hasNote && (
                        <div style={{ fontSize:11, color:"#78716c", marginTop:6, padding:"5px 9px", background:"#fefce8", borderRadius:6, borderLeft:"2px solid #fcd34d", fontStyle:"italic", lineHeight:1.5 }}>
                          {getNote(block.id).length > 90 ? getNote(block.id).slice(0,90)+"…" : getNote(block.id)}
                        </div>
                      )}
                    </div>

                    {/* Right */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                      <span style={{ fontSize:11, color:"#78716c", fontWeight:500, letterSpacing:.3 }}>{block.time}</span>
                      <button className={`note-btn${hasNote?" has-note":""}`} onClick={e=>openNoteFor(block.id,e)}>
                        {hasNote ? "✎ note" : "+ note"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:12, fontSize:11, color:"#d6d3d1", textAlign:"center" }}>
              Click a block to mark complete · "+ note" to add a note for each block
            </div>
          </div>
        )}

        {/* HABITS TAB */}
        {tab === "habits" && (
          <div className="fade-in">
            <div style={{ background:"#fff", border:"1px solid #e7e5e4", borderRadius:12, overflow:"hidden", marginBottom:20 }}>
              {/* Grid header */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr repeat(7,34px)", gap:4, padding:"10px 14px", borderBottom:"1px solid #f5f5f4", background:"#fafaf9", alignItems:"center" }}>
                <span style={{ fontSize:10, color:"#a8a29e", letterSpacing:1.5, textTransform:"uppercase" }}>Habit</span>
                {DAYS.map((d,i) => (
                  <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:i===todayDay()?600:400, color:i===todayDay()?"#1c1917":"#a8a29e" }}>{d}</div>
                ))}
              </div>

              {WEEKLY_HABITS.map((h, idx) => {
                const weekCount = DAYS.filter((_,i) => whDone(h.id,i)).length;
                const c = CAT[h.category];
                return (
                  <div key={h.id} style={{ display:"grid", gridTemplateColumns:"1fr repeat(7,34px)", gap:4, padding:"9px 14px", borderBottom:idx<WEEKLY_HABITS.length-1?"1px solid #f5f5f4":"none", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:14 }}>{h.icon}</span>
                      <div>
                        <div style={{ fontSize:12, color:"#1c1917" }}>{h.label}</div>
                        <div style={{ fontSize:10, color:"#a8a29e" }}>{weekCount}/7</div>
                      </div>
                    </div>
                    {DAYS.map((_,i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"center" }}>
                        <div className={`hcell${whDone(h.id,i)?" done":""}${i===todayDay()?" today":""}`} onClick={() => toggleWh(h.id,i)}>
                          {whDone(h.id,i) && <svg width="10" height="7" viewBox="0 0 11 8" fill="none"><path d="M1 4l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Summary cards */}
            <div className="sec-label">Week Summary</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[
                { label:"Fitness days",  ids:["wh3"],       target:5, accent:"#d97706" },
                { label:"Learning days", ids:["wh1","wh4"], target:7, accent:"#059669" },
                { label:"Sleep on time", ids:["wh7"],        target:7, accent:"#7c6af7" },
              ].map(s => {
                const count = DAYS.filter((_,i) => s.ids.some(id => whDone(id,i))).length;
                return (
                  <div key={s.label} style={{ padding:"12px 14px", background:"#fff", border:"1px solid #e7e5e4", borderRadius:10 }}>
                    <div style={{ fontSize:18, fontWeight:600, color:"#1c1917", fontFamily:"'Lora',serif" }}>
                      {count}<span style={{ fontSize:11, color:"#a8a29e" }}>/{s.target}</span>
                    </div>
                    <div style={{ fontSize:11, color:"#78716c", margin:"3px 0 8px" }}>{s.label}</div>
                    <div className="pbar"><div className="pbar-fill" style={{ width:`${Math.round(count/s.target*100)}%`, background:s.accent }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TODOS TAB */}
        {tab === "todos" && (
          <div className="fade-in">
            {/* Priorities */}
            <div style={{ marginBottom:24 }}>
              <div className="sec-label">📝 Tomorrow's 3 Priorities</div>
              <div style={{ background:"#fff", border:"1px solid #fde68a", borderRadius:11, padding:16, display:"flex", flexDirection:"column", gap:9 }}>
                <div style={{ fontSize:11, color:"#92400e", marginBottom:2 }}>Write at 21:30 — your 3 most important tasks for tomorrow</div>
                {priorities.map((p,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:"#d97706", width:18 }}>{i+1}.</span>
                    <input className="pri-input" placeholder={`Priority ${i+1}…`} value={p}
                      onChange={e => setPriorities(prev => prev.map((x,j) => j===i ? e.target.value : x))} />
                  </div>
                ))}
                {priorities.every(p => p.trim()) && (
                  <div style={{ fontSize:11, color:"#059669", marginTop:2 }}>✓ All 3 priorities set</div>
                )}
              </div>
            </div>

            {/* Todo */}
            <div className="sec-label">Todo List</div>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              <input className="input-std" placeholder="Add a task… (Enter to add)"
                value={newTodo} onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key==="Enter" && addTodo()} />
              <button onClick={addTodo}
                style={{ padding:"9px 16px", background:"#1c1917", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:500, whiteSpace:"nowrap" }}>
                Add
              </button>
            </div>

            {todos.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#d6d3d1", fontSize:13 }}>No tasks yet</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {todos.filter(t => !t.done).length > 0 && (
                  <>
                    <div style={{ fontSize:10, color:"#a8a29e", letterSpacing:1.5, textTransform:"uppercase", padding:"4px 0 6px" }}>Pending · {todos.filter(t=>!t.done).length}</div>
                    {todos.filter(t => !t.done).map(todo => (
                      <div key={todo.id} className="todo-row">
                        <div className="cb" onClick={() => setTodos(p => p.map(t => t.id===todo.id?{...t,done:true}:t))} />
                        <span style={{ flex:1, fontSize:13, color:"#1c1917" }}>{todo.text}</span>
                        <button onClick={() => setTodos(p => p.filter(t => t.id!==todo.id))}
                          style={{ background:"none", border:"none", color:"#d6d3d1", cursor:"pointer", fontSize:18, lineHeight:1, padding:"0 2px" }}>×</button>
                      </div>
                    ))}
                  </>
                )}
                {todos.filter(t => t.done).length > 0 && (
                  <>
                    <div style={{ fontSize:10, color:"#a8a29e", letterSpacing:1.5, textTransform:"uppercase", padding:"12px 0 6px" }}>Done · {todos.filter(t=>t.done).length}</div>
                    {todos.filter(t => t.done).map(todo => (
                      <div key={todo.id} className="todo-row" style={{ opacity:.5 }}>
                        <div className="cb done" onClick={() => setTodos(p => p.map(t => t.id===todo.id?{...t,done:false}:t))}>
                          <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4l3 3 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <span style={{ flex:1, fontSize:13, color:"#a8a29e", textDecoration:"line-through" }}>{todo.text}</span>
                        <button onClick={() => setTodos(p => p.filter(t => t.id!==todo.id))}
                          style={{ background:"none", border:"none", color:"#d6d3d1", cursor:"pointer", fontSize:18, lineHeight:1, padding:"0 2px" }}>×</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* RULES TAB */}
        {tab === "rules" && (
          <div className="fade-in">
            <div style={{ marginBottom:20 }}>
              <div className="sec-label">Remote Structure Rules</div>
              <div style={{ fontSize:12, color:"#a8a29e", marginBottom:16 }}>Guardrails to stay focused and consistent while working from home.</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:11, padding:16 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#15803d", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:15 }}>✅</span> DO
                  </div>
                  {["Start your deep work block BEFORE checking any messages","Use time-blocking — treat calendar blocks as real meetings","Keep Slack/Discord closed during deep work","Write down 3 priorities the night before","Take your lunch walk seriously (no screens)","Track your learning — short weekly notes","Sleep by 22:15 regardless of what is unfinished"].map((rule, i) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:9, alignItems:"flex-start" }}>
                      <span style={{ color:"#86efac", fontSize:12, marginTop:1, flexShrink:0 }}>—</span>
                      <span style={{ fontSize:12, color:"#166534", lineHeight:1.5 }}>{rule}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#fff1f2", border:"1px solid #fca5a5", borderRadius:11, padding:16 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#b91c1c", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:15 }}>❌</span> DON'T
                  </div>
                  {["Check phone/Twitter first thing after waking","Let Slack notifications interrupt deep work blocks","Skip the fitness block — it feeds cognitive performance","Carry work tasks into wind-down time","Work on weekends without a defined end time","Skip Sunday rest — burnout destroys productivity","Multitask during learning blocks"].map((rule, i) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:9, alignItems:"flex-start" }}>
                      <span style={{ color:"#fca5a5", fontSize:12, marginTop:1, flexShrink:0 }}>—</span>
                      <span style={{ fontSize:12, color:"#991b1b", lineHeight:1.5 }}>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sec-label">Key Principles</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { icon:"🧠", title:"Morning is sacred", desc:"5:35–7:30 is your most cognitively powerful window. No meetings, no Slack, no context-switching. Guard it like a private key." },
                { icon:"⏱", title:"Time-block, not to-do list", desc:"A to-do list without time blocks is just wishes. Every task needs a block on your calendar or it will not happen." },
                { icon:"🔄", title:"Consistency beats intensity", desc:"Showing up at 80% every day beats showing up at 100% twice a week. The schedule only works if you follow it daily." },
                { icon:"📵", title:"Async by default", desc:"You work remotely. Not every Slack message needs an instant reply. Batch communications to 08:00 and 13:00 check-ins." },
              ].map((p, i) => (
                <div key={i} style={{ display:"flex", gap:12, padding:"12px 14px", background:"#fff", border:"1px solid #e7e5e4", borderRadius:10 }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:"#1c1917", marginBottom:3 }}>{p.title}</div>
                    <div style={{ fontSize:12, color:"#78716c", lineHeight:1.55 }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MONTHLY REVIEW TAB */}
        {tab === "review" && (() => {
          const REVIEW_QUESTIONS = [
            { id:"r1", q:"Did I hit my learning goals this month? What is next?" },
            { id:"r2", q:"How many fitness sessions did I complete? (Target: 18–20)" },
            { id:"r3", q:"What cryptography topic do I feel most confident in now?" },
            { id:"r4", q:"What company project am I most proud of this month?" },
            { id:"r5", q:"Where did I lose the most focus / productivity?" },
            { id:"r6", q:"Am I sleeping consistently? Any pattern issues?" },
            { id:"r7", q:"What one habit should I add or remove next month?" },
          ];
          const monthKey = new Date().toISOString().slice(0,7);
          const getAns = (id) => reviewChecks[`${monthKey}_${id}`] || "";
          const setAns = (id, val) => setReviewChecks(p => ({ ...p, [`${monthKey}_${id}`]: val }));
          const answered = REVIEW_QUESTIONS.filter(q => getAns(q.id).trim().length > 0).length;
          return (
            <div className="fade-in">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:14 }}>
                <div>
                  <div className="sec-label">Monthly Review Checklist</div>
                  <div style={{ fontSize:12, color:"#a8a29e" }}>Run on the last Sunday of each month.</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:18, fontWeight:600, color:"#1c1917", fontFamily:"'Lora',serif" }}>
                    {answered}<span style={{ fontSize:11, color:"#a8a29e" }}>/{REVIEW_QUESTIONS.length}</span>
                  </div>
                  <div style={{ fontSize:10, color:"#a8a29e" }}>{new Date().toLocaleString("en-US",{month:"long",year:"numeric"})}</div>
                </div>
              </div>
              <div className="pbar" style={{ marginBottom:20 }}>
                <div className="pbar-fill" style={{ width:`${Math.round(answered/REVIEW_QUESTIONS.length*100)}%`, background:"#7c6af7" }} />
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {REVIEW_QUESTIONS.map((item, i) => {
                  const hasAns = getAns(item.id).trim().length > 0;
                  return (
                    <div key={item.id} style={{ background:"#fff", border:`1px solid ${hasAns?"#c4b5fd":"#e7e5e4"}`, borderRadius:10, padding:"14px 16px", transition:"border-color .2s" }}>
                      <div style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
                        <span style={{ fontSize:12, fontWeight:600, color:"#7c6af7", flexShrink:0, minWidth:18 }}>{i+1}.</span>
                        <span style={{ fontSize:13, color:"#1c1917", lineHeight:1.5, fontWeight:500 }}>{item.q}</span>
                      </div>
                      <textarea value={getAns(item.id)} onChange={e => setAns(item.id, e.target.value)}
                        placeholder="Write your answer here…" rows={2}
                        style={{ width:"100%", padding:"8px 10px", border:"1px solid #e7e5e4", borderRadius:7, fontSize:12, resize:"vertical", outline:"none", background:"#fafaf9", color:"#1c1917", lineHeight:1.6, fontFamily:"inherit", transition:"border .15s" }}
                        onFocus={e => e.target.style.borderColor="#a8a29e"}
                        onBlur={e => e.target.style.borderColor="#e7e5e4"}
                      />
                    </div>
                  );
                })}
              </div>
              {answered === REVIEW_QUESTIONS.length && (
                <div style={{ marginTop:16, padding:"12px 16px", background:"#f5f3ff", border:"1px solid #c4b5fd", borderRadius:10, textAlign:"center", fontSize:13, color:"#6d28d9", fontWeight:500 }}>
                  ✓ Monthly review complete — well done. Plan next month.
                </div>
              )}
            </div>
          );
        })()}

      </div>

      {/* ── NOTE MODAL ── */}
      {openNote !== null && (
        <div className="overlay" onClick={closeNote}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, color:"#a8a29e", letterSpacing:1.5, textTransform:"uppercase", marginBottom:5 }}>Block note</div>
              <div style={{ fontSize:15, fontWeight:600, color:"#1c1917", fontFamily:"'Lora',serif" }}>
                {SCHEDULE.find(s=>s.id===openNote)?.icon} {SCHEDULE.find(s=>s.id===openNote)?.label}
              </div>
              <div style={{ fontSize:11, color:"#a8a29e", marginTop:3 }}>
                {SCHEDULE.find(s=>s.id===openNote)?.time} · {SCHEDULE.find(s=>s.id===openNote)?.detail}
              </div>
            </div>

            <textarea ref={noteRef} value={noteInput} onChange={e => setNoteInput(e.target.value)}
              placeholder="What did you work on? Any wins, blockers, or thoughts…"
              style={{ width:"100%", height:130, padding:"10px 12px", border:"1px solid #e7e5e4", borderRadius:8, fontSize:13, resize:"vertical", outline:"none", background:"#fafaf9", color:"#1c1917", lineHeight:1.6, fontFamily:"inherit" }}
              onFocus={e => e.target.style.borderColor="#a8a29e"}
              onBlur={e => e.target.style.borderColor="#e7e5e4"}
            />

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
              <button onClick={() => { setNoteInput(""); saveNote(openNote,""); setOpenNote(null); }}
                style={{ padding:"7px 12px", background:"none", border:"1px solid #e7e5e4", borderRadius:7, cursor:"pointer", fontSize:12, color:"#a8a29e" }}>
                Clear note
              </button>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setOpenNote(null)}
                  style={{ padding:"7px 14px", background:"none", border:"1px solid #e7e5e4", borderRadius:7, cursor:"pointer", fontSize:12, color:"#78716c" }}>
                  Cancel
                </button>
                <button onClick={closeNote}
                  style={{ padding:"7px 18px", background:"#1c1917", border:"none", borderRadius:7, cursor:"pointer", fontSize:12, color:"#fff", fontWeight:500 }}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
