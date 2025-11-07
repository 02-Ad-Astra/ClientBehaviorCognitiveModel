import React, { useEffect, useMemo, useRef, useState } from "react";
/* ---------- Simple UI components (replace shadcn/ui) ---------- */
const Button = ({ variant, onClick, children, ...props }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 14px",
      margin: "2px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      backgroundColor: variant === "secondary" ? "#e0e0e0" : "#3b82f6",
      color: variant === "secondary" ? "#000" : "#fff",
    }}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children }) => (
  <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "16px", marginBottom: "12px", background: "#fff" }}>
    {children}
  </div>
);
const CardHeader = ({ children }) => <div style={{ marginBottom: "8px", fontWeight: "bold" }}>{children}</div>;
const CardTitle = ({ children }) => <h2>{children}</h2>;
const CardContent = ({ children }) => <div>{children}</div>;

const Tabs = ({ children }) => <div>{children}</div>;
const TabsList = ({ children }) => <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>{children}</div>;
const TabsTrigger = ({ children, onClick }) => <Button variant="secondary" onClick={onClick}>{children}</Button>;
const TabsContent = ({ children }) => <div style={{ marginTop: "12px" }}>{children}</div>;

const Switch = ({ checked, onCheckedChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <input type="checkbox" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} />
  </label>
);
const Label = ({ children }) => <span style={{ fontSize: "14px" }}>{children}</span>;
const Progress = ({ value }) => (
  <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
    <div style={{ height: "8px", width: `${value}%`, background: "#3b82f6", borderRadius: "4px", transition: "width 0.2s" }} />
  </div>
);
/* ---------------------------------------------------------------- */
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
function mean(arr) { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : NaN }
function std(arr) {
  if (!arr.length) return NaN;
  const m = mean(arr);
  const v = mean(arr.map(x => (x-m)**2));
  return Math.sqrt(v);
}
function shuffle(a){
  const arr = [...a];
  for (let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] }
  return arr;
}

export default function CognitiveControlDemo(){
  const [tab, setTab] = useState("overview");
  const [modeDemo, setModeDemo] = useState(true);
  const [results, setResults] = useState({ go: null, stroop: null, framing: null, mid: null, bart: null, delay: null });

  // restart keys
  const [goKey, setGoKey] = useState(0);
  const [stroopKey, setStroopKey] = useState(0);
  const [framingKey, setFramingKey] = useState(0);
  const [midKey, setMidKey] = useState(0);
  const [bartKey, setBartKey] = useState(0);
  const [delayKey, setDelayKey] = useState(0);

  const restartGo = () => { setGoKey(k => k + 1); setResults(r => ({ ...r, go: null })); };
  const restartStroop = () => { setStroopKey(k => k + 1); setResults(r => ({ ...r, stroop: null })); };
  const restartFraming = () => { setFramingKey(k => k + 1); setResults(r => ({ ...r, framing: null })); };
  const restartMID = () => { setMidKey(k => k + 1); setResults(r => ({ ...r, mid: null })); };
  const restartBART = () => { setBartKey(k => k + 1); setResults(r => ({ ...r, bart: null })); };
  const restartDelay = () => { setDelayKey(k => k + 1); setResults(r => ({ ...r, delay: null })); };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Cognitive Control & Reward Sensitivity – Demo</h1>
        <p className="text-sm opacity-80">Impulse control, interference, framing, plus Reward Sensitivity: MID, BART, and Delay Discounting.</p>
        <div className="flex items-center gap-3">
          <Switch checked={modeDemo} onCheckedChange={setModeDemo} id="mode" />
          <Label htmlFor="mode">Demo mode ({modeDemo ? "short" : "full"})</Label>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" onClick={()=>setTab("overview")}>Overview</TabsTrigger>
          <TabsTrigger value="gonogo" onClick={()=>setTab("gonogo")}>Go/No-Go</TabsTrigger>
          <TabsTrigger value="stroop" onClick={()=>setTab("stroop")}>Stroop</TabsTrigger>
          <TabsTrigger value="framing" onClick={()=>setTab("framing")}>Framing</TabsTrigger>
          <TabsTrigger value="mid" onClick={()=>setTab("mid")}>MID</TabsTrigger>
          <TabsTrigger value="bart" onClick={()=>setTab("bart")}>BART</TabsTrigger>
          <TabsTrigger value="delay" onClick={()=>setTab("delay")}>Delay</TabsTrigger>
          <TabsTrigger value="dashboard" onClick={()=>setTab("dashboard")}>Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>How to use</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Pick a task tab. Keep window focused. Use click as instructed.</li>
                <li>Demo mode runs short blocks. Toggle off for full-length.</li>
                <li>Go to <strong>Dashboard</strong> for computed metrics and advisory.</li>
              </ol>
              <p className="opacity-80">Note: research demo, not a diagnostic. Use quiet setting and hardware keyboard/mouse.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gonogo">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <Button variant="secondary" onClick={restartGo}>Restart Go/No-Go</Button>
          </div>
          <GoNoGo key={goKey} modeDemo={modeDemo} onFinish={(r)=>setResults(prev=>({...prev, go:r}))} />
        </TabsContent>

        <TabsContent value="stroop">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <Button variant="secondary" onClick={restartStroop}>Restart Stroop</Button>
          </div>
          <Stroop key={stroopKey} modeDemo={modeDemo} onFinish={(r)=>setResults(prev=>({...prev, stroop:r}))} />
        </TabsContent>

        <TabsContent value="framing">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <Button variant="secondary" onClick={restartFraming}>Restart Framing</Button>
          </div>
          <Framing key={framingKey} modeDemo={modeDemo} onFinish={(r)=>setResults(prev=>({...prev, framing:r}))} />
        </TabsContent>

        <TabsContent value="mid">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <Button variant="secondary" onClick={restartMID}>Restart MID</Button>
          </div>
          <MID key={midKey} modeDemo={modeDemo} onFinish={(r)=>setResults(prev=>({...prev, mid:r}))} />
        </TabsContent>

        <TabsContent value="bart">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <Button variant="secondary" onClick={restartBART}>Restart BART</Button>
          </div>
          <BART key={bartKey} modeDemo={modeDemo} onFinish={(r)=>setResults(prev=>({...prev, bart:r}))} />
        </TabsContent>

        <TabsContent value="delay">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <Button variant="secondary" onClick={restartDelay}>Restart Delay</Button>
          </div>
          <DelayDiscounting key={delayKey} modeDemo={modeDemo} onFinish={(r)=>setResults(prev=>({...prev, delay:r}))} />
        </TabsContent>

        <TabsContent value="dashboard">
          <Dashboard results={results} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/********************* Go/No-Go ************************/
function GoNoGo({ modeDemo, onFinish }){
  const practiceSec = modeDemo ? 10 : 60;
  const blockSec = modeDemo ? 15 : 60;
  const [phase, setPhase] = useState("intro");
  const [blockIdx, setBlockIdx] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [stim, setStim] = useState(null);
  const [log, setLog] = useState([]);
  const timerRef = useRef(null);
  const stimRef = useRef(null);
  const runningRef = useRef(false);

  function handleClick(){
    if (!runningRef.current) return;
    const s = stimRef.current;
    if (!s) return;
    const now = performance.now();
    if (now > s.deadline) return;
    const rt = now - s.start;
    const isGo = s.color === 'green';
    const type = isGo ? 'hit' : 'commission';
    setLog(l=>[...l, {t: now, block: blockIdx, color: s.color, responded: true, rt, correct: isGo, type}]);
    stimRef.current = null;
    setStim(null);
  }

  function startPhase(which){
    setLog([]);
    setBlockIdx(which==='practice' ? -1 : 0);
    const dur = which==='practice' ? practiceSec : blockSec;
    setTimeLeft(dur);
    setPhase(which);
    runningRef.current = true;
    scheduleStimulus();
    timerRef.current && clearInterval(timerRef.current);
    const t0 = performance.now();
    timerRef.current = setInterval(()=>{
      const elapsed = (performance.now()-t0)/1000;
      const rem = (which==='practice'? practiceSec : blockSec) - elapsed;
      setTimeLeft(Math.max(0, rem));
      if (rem<=0){
        clearInterval(timerRef.current);
        runningRef.current = false;
        if (which==='practice') {
          setPhase('preblocks');
        } else {
          if (blockIdx < 3){
            setPhase('interval');
          } else {
            setPhase('done');
            onFinish && onFinish(computeGoNoGo(log));
          }
        }
      }
    }, 50);
  }

  function nextBlock(){
    const next = blockIdx+1;
    setBlockIdx(next);
    setPhase('block');
    runningRef.current = true;
    setTimeLeft(blockSec);
    scheduleStimulus();
    timerRef.current && clearInterval(timerRef.current);
    const t0 = performance.now();
    timerRef.current = setInterval(()=>{
      const elapsed = (performance.now()-t0)/1000;
      const rem = blockSec - elapsed;
      setTimeLeft(Math.max(0, rem));
      if (rem<=0){
        clearInterval(timerRef.current);
        runningRef.current = false;
        if (next<3){
          setPhase('interval');
        } else {
          setPhase('done');
          onFinish && onFinish(computeGoNoGo(log));
        }
      }
    }, 50);
  }

  function scheduleStimulus(){
    function loop(){
      if (!runningRef.current) return;
      const delay = 800 + Math.random()*500;
      setTimeout(()=>{
        if (!runningRef.current) return;
        const color = Math.random()<0.75 ? 'green' : 'red';
        const now = performance.now();
        const visMs = 600 + Math.random()*300;
        const stimObj = { color, start: now, deadline: now + visMs };
        stimRef.current = stimObj;
        setStim(stimObj);
        setTimeout(()=>{
          if (stimRef.current === stimObj){
            setLog(l=>[...l, {t: performance.now(), block: blockIdx, color, responded: false, rt: null, correct: color==='red', type: color==='green' ? 'omission' : 'correct-withhold'}]);
            stimRef.current = null;
            setStim(null);
          }
          loop();
        }, visMs);
      }, delay);
    }
    loop();
  }

  useEffect(()=>()=>{ timerRef.current && clearInterval(timerRef.current); runningRef.current=false; },[])
  const metrics = useMemo(()=>computeGoNoGo(log), [log]);

  return (
    <Card>
      <CardHeader><CardTitle>Go/No-Go – Impulse Inhibition</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {phase==='intro' && (
          <div className="space-y-3">
            <p><span className="font-semibold">Click</span> for <span className="font-semibold text-green-600">green</span> circle (Go). Do not click for <span className="font-semibold text-red-600">red</span> circle (No-Go).</p>
            <p>Flow: practice → 4 blocks of {blockSec}s.</p>
            <Button onClick={()=>startPhase('practice')}>Start Practice</Button>
          </div>
        )}

        {phase==='preblocks' && (
          <div className="space-y-3">
            <p>Ready for the 4 blocks?</p>
            <Button onClick={nextBlock}>Start Block 1/4</Button>
          </div>
        )}

        {['block','interval','practice'].includes(phase) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>{phase === 'practice' ? 'Practice' : `Block ${blockIdx + 1} / 4`}</div>
              <div className="w-1/2">
                <Progress value={100 * (timeLeft / (phase === 'practice' ? practiceSec : blockSec))} />
              </div>
              <div className="tabular-nums">{timeLeft.toFixed(1)}s</div>
            </div>
            {phase==='interval' ? (
              <div className="space-y-3">
                <p>Short break.</p>
                <Button onClick={nextBlock}>Start next block</Button>
              </div>
            ) : (
              <div
                className="h-56 flex items-center justify-center cursor-pointer select-none"
                onClick={handleClick}
                role="button"
                aria-label="Stimulus area – click when green"
                title="Click when the circle is green"
              >
                {stim ? (
                  <div className={`w-24 h-24 rounded-full ${stim.color==='green' ? 'bg-green-500' : 'bg-red-500'}`} />
                ) : (
                  <div className="opacity-40">+</div>
                )}
              </div>
            )}
            <LiveGoNoGoStats log={log} />
          </div>
        )}

        {phase==='done' && (
          <div className="space-y-4">
            <p>Finished! Metrics sent to Dashboard.</p>
            <GoNoGoSummary metrics={metrics} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
function LiveGoNoGoStats({ log }){
  const go = log.filter(r=>r.color==='green');
  const red = log.filter(r=>r.color==='red');
  const hits = go.filter(r=>r.type==='hit');
  const omissions = go.filter(r=>r.type==='omission');
  const commissions = red.filter(r=>r.type==='commission');
  const rt = hits.map(r=>r.rt);
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Running counts</div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
          <div>Go trials</div><div className="text-right tabular-nums">{go.length}</div>
          <div>Hits</div><div className="text-right tabular-nums">{hits.length}</div>
          <div>Omissions</div><div className="text-right tabular-nums">{omissions.length}</div>
          <div>Commissions</div><div className="text-right tabular-nums">{commissions.length}</div>
        </div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">RT (correct Go)</div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
          <div>Mean</div><div className="text-right tabular-nums">{Number.isFinite(mean(rt))? Math.round(mean(rt)) : '-'} ms</div>
          <div>Std</div><div className="text-right tabular-nums">{Number.isFinite(std(rt))? Math.round(std(rt)) : '-'} ms</div>
          <div>CV</div><div className="text-right tabular-nums">{Number.isFinite(std(rt)/mean(rt))? (std(rt)/mean(rt)).toFixed(2) : '-'}</div>
        </div>
      </div>
    </div>
  )
}
function computeGoNoGo(log){
  if (!log || !log.length) return null;
  const blocks = [0,1,2,3].map(b=>log.filter(r=>r.block===b));
  const go = log.filter(r=>r.color==='green');
  const red = log.filter(r=>r.color==='red');
  const hits = go.filter(r=>r.type==='hit');
  const omissions = go.filter(r=>r.type==='omission');
  const commissions = red.filter(r=>r.type==='commission');
  const rt = hits.map(r=>r.rt).filter(Number.isFinite);
  const rtMean = mean(rt);
  const rtStd = std(rt);
  const cv = rtStd/rtMean;
  const inhErrRate = commissions.length / (red.length || 1);
  const omissRate = omissions.length / (go.length || 1);
  const blockErrs = blocks.map(b=> b.filter(r=> r.type==='commission' || r.type==='omission').length / (b.length||1));
  const fatigue = (blockErrs[3] ?? 0) - (blockErrs[0] ?? 0);
  return { rtMean, rtStd, cv, inhErrRate, omissRate, blockErrs, fatigue, counts: {go: go.length, red: red.length, hits: hits.length, omissions: omissions.length, commissions: commissions.length} };
}
function GoNoGoSummary({ metrics }){
  if (!metrics) return null;
  const data = [
    { name: 'Inhibition error rate', value: metrics.inhErrRate },
    { name: 'Omission error rate', value: metrics.omissRate },
    { name: 'RT CV', value: metrics.cv },
    { name: 'Fatigue drift', value: metrics.fatigue },
  ];
  const blockData = metrics.blockErrs.map((e,i)=>({block: `B${i+1}`, errors: e}));
  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" hide/>
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={blockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="block" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="errors" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/********************* Stroop ************************/
const COLORS = ["RED","GREEN","BLUE","YELLOW"];
const COLOR_MAP = { RED: "text-red-600", GREEN: "text-green-600", BLUE: "text-blue-600", YELLOW: "text-yellow-500" };

function Stroop({ modeDemo, onFinish }) {
  const totalTrials = modeDemo ? 40 : 120;
  const [phase, setPhase] = useState("intro");
  const [i, setI] = useState(0);
  const [trial, setTrial] = useState(null);
  const [log, setLog] = useState([]);

  const trialRef = useRef(null);
  const acceptAfterRef = useRef(0);
  const missTimerRef = useRef(null);

  function makeTrial() {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    const congruent = Math.random() < 0.5;
    const color = congruent ? word : shuffle(COLORS.filter(c => c !== word))[0];
    const start = performance.now();
    const deadline = start + (modeDemo ? 2000 : 1500);
    const t = { word, color, congruent, start, deadline };
    trialRef.current = t;
    setTrial(t);
    acceptAfterRef.current = start + 120;
    clearTimeout(missTimerRef.current);
    missTimerRef.current = setTimeout(() => {
      if (trialRef.current === t) {
        setLog(l => [...l, { word:t.word, color:t.color, congruent:t.congruent, rt:null, correct:false }]);
        trialRef.current = null;
        setTrial(null);
        setI(x => Math.min(x + 1, totalTrials));
      }
    }, deadline - start);
  }

  function commitResponse(answerColor, now = performance.now()) {
    const t = trialRef.current;
    if (!t) return;
    if (now < acceptAfterRef.current || now > t.deadline) return;
    const rt = now - t.start;
    const correct = answerColor === t.color;
    clearTimeout(missTimerRef.current);
    setLog(l => [...l, { word:t.word, color:t.color, congruent:t.congruent, rt, correct }]);
    trialRef.current = null;
    setTrial(null);
    setI(x => Math.min(x + 1, totalTrials));
  }

  useEffect(() => {
    if (phase !== "run") return;
    if (i >= totalTrials) {
      clearTimeout(missTimerRef.current);
      setPhase("done");
      onFinish && onFinish(computeStroop(log));
      return;
    }
    const isi = 250;
    const t = setTimeout(() => makeTrial(), isi);
    return () => clearTimeout(t);
  }, [phase, i, totalTrials, modeDemo, log, onFinish]);

  useEffect(() => {
    function onVis() {
      if (document.hidden) {
        clearTimeout(missTimerRef.current);
        trialRef.current = null;
        setTrial(null);
      } else {
        if (phase === "run" && i < totalTrials) {
          const isi = 250;
          setTimeout(() => makeTrial(), isi);
        }
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [phase, i, totalTrials]);

  const metrics = useMemo(() => computeStroop(log), [log]);

  return (
    <Card>
      <CardHeader><CardTitle>Stroop – Interference Control</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {phase === "intro" && (
          <div className="space-y-3">
            <p>Click the buttons for the <strong>ink color</strong>, ignoring the word.</p>
            <Button onClick={() => setPhase("run")}>Start</Button>
          </div>
        )}
        {phase === "run" && (
          <div className="space-y-4">
            <div className="text-center h-52 flex items-center justify-center">
              {(() => {
                const word = trial?.word ?? "";
                const color = trial?.color ?? null;
                const cls = color ? COLOR_MAP[color] ?? "" : "";
                return color ? (
                  <div className={`text-6xl font-bold ${cls}`}>{word}</div>
                ) : (
                  <div className="opacity-40">+</div>
                );
              })()}
            </div>
            <ColorButtons onPick={c => commitResponse(c)} />
            {typeof LiveStroopStats === "function" && (
              <LiveStroopStats log={log} i={i} total={totalTrials} />
            )}
          </div>
        )}
        {phase === "done" && (
          <div className="space-y-3">
            <p>Finished! Metrics sent to Dashboard.</p>
            {typeof StroopSummary === "function" && (
              <StroopSummary metrics={metrics} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function ColorButtons({ onPick }) {
  const order = ["RED", "GREEN", "BLUE", "YELLOW"];
  return (
    <div className="flex gap-3 justify-center">
      {order.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onPick(c)}
          className={`px-3 py-2 rounded-lg border text-sm font-medium ${COLOR_MAP[c]}`}
          aria-label={`choose ${c}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
function computeStroop(log){
  const c = log.filter(t=>t.congruent && t.rt!=null && t.correct);
  const ic = log.filter(t=>!t.congruent && t.rt!=null && t.correct);
  const cMean = mean(c.map(x=>x.rt));
  const icMean = mean(ic.map(x=>x.rt));
  const cErr = 1 - (c.length / Math.max(1, log.filter(t=>t.congruent).length));
  const icErr = 1 - (ic.length / Math.max(1, log.filter(t=>!t.congruent).length));
  const costRT = (icMean - cMean);
  const costErr = (icErr - cErr);
  return { cMean, icMean, costRT, cErr, icErr, costErr };
}
function LiveStroopStats({ log, i, total }){
  const c = log.filter(t=>t.congruent && t.rt!=null && t.correct);
  const ic = log.filter(t=>!t.congruent && t.rt!=null && t.correct);
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Progress</div>
        <div className="mt-2 flex items-center gap-3">
          <Progress value={100*(i/total)} className="w-full" />
          <div className="tabular-nums">{i}/{total}</div>
        </div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">RT (ms)</div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
          <div>Congruent</div><div className="text-right tabular-nums">{Number.isFinite(mean(c.map(x=>x.rt)))? Math.round(mean(c.map(x=>x.rt))) : '-'}</div>
          <div>Incongruent</div><div className="text-right tabular-nums">{Number.isFinite(mean(ic.map(x=>x.rt)))? Math.round(mean(ic.map(x=>x.rt))) : '-'}</div>
        </div>
      </div>
    </div>
  )
}
function StroopSummary({ metrics }){
  if (!metrics) return null;
  const data = [
    { name: 'Interference cost (RT ms)', value: metrics.costRT||0 },
    { name: 'Error diff (IC - C)', value: metrics.costErr||0 },
  ];
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" hide/>
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/********************* Framing ************************/
const framingItemsBase = [
  { id: 1, p: 0.5, sureGain: 50, gambleGain: 100, sureLoss: -50, gambleLoss: -100 },
  { id: 2, p: 0.25, sureGain: 25, gambleGain: 100, sureLoss: -25, gambleLoss: -100 },
  { id: 3, p: 0.75, sureGain: 75, gambleGain: 100, sureLoss: -75, gambleLoss: -100 },
  { id: 4, p: 0.6, sureGain: 60, gambleGain: 100, sureLoss: -60, gambleLoss: -100 },
  { id: 5, p: 0.4, sureGain: 40, gambleGain: 100, sureLoss: -40, gambleLoss: -100 },
  { id: 6, p: 0.9, sureGain: 90, gambleGain: 100, sureLoss: -90, gambleLoss: -100 },
];
function Framing({ modeDemo, onFinish }){
  const [phase, setPhase] = useState('intro');
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState([]);

  function start(){
    const gains = framingItemsBase.map(x=>({ ...x, frame:'gain' }));
    const losses = framingItemsBase.map(x=>({ ...x, frame:'loss' }));
    const set1 = shuffle([...gains, ...losses]);
    const set2 = shuffle([...gains, ...losses]);
    const seq = shuffle([...set1, ...set2]);
    setQueue(seq); setIdx(0); setLog([]); setPhase('run');
  }
  function choose(choice){
    const item = queue[idx];
    setLog(l=>[...l, {id:item.id, frame:item.frame, choice}]);
    const next = idx+1;
    if (next>=queue.length){ setPhase('done'); onFinish && onFinish(computeFraming(log.concat([{id:item.id, frame:item.frame, choice}]))); }
    else setIdx(next);
  }
  const item = queue[idx];
  const metrics = useMemo(()=>computeFraming(log), [log]);

  return (
    <Card>
      <CardHeader><CardTitle>Framing Stability – Consistency</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {phase==='intro' && (
          <div className="space-y-3">
            <p>Choose between a sure option and a probabilistic option. Gains vs losses with equal EV; items repeat later.</p>
            <Button onClick={start}>Start</Button>
          </div>
        )}
        {phase==='run' && item && (
          <div className="space-y-4">
            <div className="text-sm opacity-80">Item {idx+1} / {queue.length}</div>
            {item.frame==='gain' ? (
              <div className="space-y-3">
                <div>You can <strong>gain</strong>:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button className="h-20 text-base" onClick={()=>choose('sure')}>Sure: +{item.sureGain}</Button>
                  <Button className="h-20 text-base" variant="secondary" onClick={()=>choose('gamble')}>Gamble: {Math.round(item.p*100)}% chance to +{item.gambleGain}, else 0</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>You may <strong>lose</strong>:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button className="h-20 text-base" onClick={()=>choose('sure')}>Sure: {item.sureLoss}</Button>
                  <Button className="h-20 text-base" variant="secondary" onClick={()=>choose('gamble')}>Gamble: {Math.round(item.p*100)}% chance to {item.gambleLoss}, else 0</Button>
                </div>
              </div>
            )}
          </div>
        )}
        {phase==='done' && (
          <div className="space-y-3">
            <p>Finished! Metrics sent to Dashboard.</p>
            <FramingSummary metrics={metrics} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
function computeFraming(log){
  if (!log.length) return null;
  const byKey = (l)=> l.reduce((m, r)=>{ const k = `${r.frame}-${r.id}`; (m[k]=m[k]||[]).push(r); return m; }, {});
  const grouped = byKey(log);
  let agree=0, totalPairs=0;
  Object.values(grouped).forEach(arr=>{
    if (arr.length>=2){ totalPairs++; if (arr[0].choice===arr[1].choice) agree++; }
  });
  const consistency = totalPairs? agree/totalPairs : NaN;
  const gainRisks = log.filter(r=>r.frame==='gain' && r.choice==='gamble').length;
  const lossRisks = log.filter(r=>r.frame==='loss' && r.choice==='gamble').length;
  const gainTotal = log.filter(r=>r.frame==='gain').length || 1;
  const lossTotal = log.filter(r=>r.frame==='loss').length || 1;
  const propRiskGain = gainRisks / gainTotal;
  const propRiskLoss = lossRisks / lossTotal;
  const amplitude = propRiskLoss - propRiskGain;
  return { consistency, propRiskGain, propRiskLoss, amplitude };
}
function FramingSummary({ metrics }){
  if (!metrics) return null;
  const data = [
    { name: 'Risky choice % (Gain)', value: Math.round((metrics.propRiskGain||0)*100) },
    { name: 'Risky choice % (Loss)', value: Math.round((metrics.propRiskLoss||0)*100) },
  ];
  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="%" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-sm">
        Framing amplitude (Loss − Gain risky %): <span className="font-semibold">{Number.isFinite(metrics.amplitude)? (metrics.amplitude*100).toFixed(1) + '%': '-'}</span><br/>
        Retest consistency: <span className="font-semibold">{Number.isFinite(metrics.consistency)? (metrics.consistency*100).toFixed(1) + '%': '-'}</span>
      </div>
    </div>
  )
}

/********************* MID – Monetary Incentive Delay ************************/
function MID({ modeDemo, onFinish }){
  // Simple design: Cue (REWARD/NEUTRAL) -> short delay -> Target appears -> user clicks quickly
  const totalTrials = modeDemo ? 24 : 60; // half reward, half neutral
  const [phase, setPhase] = useState("intro");
  const [i, setI] = useState(0);
  const [trial, setTrial] = useState(null); // {cond, stage, startTime, deadline}
  const [log, setLog] = useState([]);       // {cond, rt, hit}

  const trialRef = useRef(null);
  const timers = useRef([]);

  function clearTimers(){ timers.current.forEach(t=>clearTimeout(t)); timers.current=[]; }
  useEffect(()=>()=>clearTimers(),[]);

  function scheduleNext(){
    if (i >= totalTrials) {
      setPhase("done");
      onFinish && onFinish(computeMID(log));
      return;
    }
    // pick condition
    const cond = Math.random() < 0.5 ? "REWARD" : "NEUTRAL";
    // show cue 600ms
    const cueStart = performance.now();
    const cue = { cond, stage:"cue", startTime: cueStart, deadline: cueStart+600 };
    trialRef.current = cue; setTrial(cue);

    timers.current.push(setTimeout(()=>{
      // ISI 300–500ms
      const isi = 300 + Math.random()*200;
      const t2 = setTimeout(()=>{
        // show target, window 1200ms (demo longer)
        const targetStart = performance.now();
        const window = modeDemo ? 1400 : 1000;
        const target = { cond, stage:"target", startTime: targetStart, deadline: targetStart+window };
        trialRef.current = target; setTrial(target);

        // auto-miss
        const missTimer = setTimeout(()=>{
          if (trialRef.current === target){
            setLog(l=>[...l, {cond, rt:null, hit:false}]);
            trialRef.current=null; setTrial(null);
            setI(x=>x+1);
            scheduleNext();
          }
        }, window+10);
        timers.current.push(missTimer);
      }, isi);
      timers.current.push(t2);
    }, 600));
  }

  function commit(now=performance.now()){
    const t = trialRef.current;
    if (!t || t.stage!=="target") return;
    if (now>t.deadline) return;
    const rt = now - t.startTime;
    setLog(l=>[...l, {cond: t.cond, rt, hit:true}]);
    clearTimers(); // clear pending miss
    trialRef.current=null; setTrial(null);
    setI(x=>x+1);
    scheduleNext();
  }

  const metrics = useMemo(()=>computeMID(log), [log]);

  return (
    <Card>
      <CardHeader><CardTitle>MID – Reward Reactivity</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {phase==="intro" && (
          <div className="space-y-3">
            <p>You'll see a cue (<strong>REWARD</strong> or <strong>NEUTRAL</strong>). When the target appears, <strong>click</strong> as fast as you can.</p>
            <Button onClick={()=>{ setPhase("run"); setI(0); setLog([]); scheduleNext(); }}>Start</Button>
          </div>
        )}
        {phase==="run" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>Trial {i+1}/{totalTrials}</div>
              <Progress value={100*((i)/totalTrials)} />
            </div>
            <div className="h-52 flex items-center justify-center select-none" onClick={()=>commit()}>
              {!trial ? <div className="opacity-40">+</div> :
                trial.stage==="cue" ? (
                  <div className={`text-4xl font-bold ${trial.cond==="REWARD" ? "text-green-600" : ""}`}>
                    {trial.cond}
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-black/80" title="Click now"/>
                )
              }
            </div>
            <LiveMIDStats log={log} />
          </div>
        )}
        {phase==="done" && (
          <div className="space-y-3">
            <p>Finished! Metrics sent to Dashboard.</p>
            <MIDSummary metrics={metrics}/>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function computeMID(log){
  const r = log.filter(x=>x.cond==="REWARD");
  const n = log.filter(x=>x.cond==="NEUTRAL");
  const rRT = mean(r.filter(x=>x.hit && Number.isFinite(x.rt)).map(x=>x.rt));
  const nRT = mean(n.filter(x=>x.hit && Number.isFinite(x.rt)).map(x=>x.rt));
  const deltaRT = (rRT - nRT); // negative = faster under reward
  const rErr = 1 - (r.filter(x=>x.hit).length / Math.max(1, r.length));
  const nErr = 1 - (n.filter(x=>x.hit).length / Math.max(1, n.length));
  const deltaErr = (rErr - nErr); // negative = fewer errors under reward
  const hitRateReward = r.filter(x=>x.hit).length / Math.max(1, r.length);
  return { rtReward:rRT, rtNeutral:nRT, deltaRT, errReward:rErr, errNeutral:nErr, deltaErr, hitRateReward };
}
function LiveMIDStats({ log }){
  const r = log.filter(x=>x.cond==="REWARD");
  const n = log.filter(x=>x.cond==="NEUTRAL");
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Hit rate</div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
          <div>Reward</div><div className="text-right tabular-nums">{Math.round((r.filter(x=>x.hit).length/Math.max(1,r.length))*100) || 0}%</div>
          <div>Neutral</div><div className="text-right tabular-nums">{Math.round((n.filter(x=>x.hit).length/Math.max(1,n.length))*100) || 0}%</div>
        </div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">RT (ms, hits)</div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
          <div>Reward</div><div className="text-right tabular-nums">{Number.isFinite(mean(r.filter(x=>x.hit).map(x=>x.rt)))? Math.round(mean(r.filter(x=>x.hit).map(x=>x.rt))) : '-'}</div>
          <div>Neutral</div><div className="text-right tabular-nums">{Number.isFinite(mean(n.filter(x=>x.hit).map(x=>x.rt)))? Math.round(mean(n.filter(x=>x.hit).map(x=>x.rt))) : '-'}</div>
        </div>
      </div>
    </div>
  );
}
function MIDSummary({ metrics }){
  if (!metrics) return null;
  const data = [
    { name: 'ΔRT (Reward-Neutral)', value: metrics.deltaRT||0 },
    { name: 'ΔErr (Reward-Neutral)', value: metrics.deltaErr||0 },
  ];
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" hide/>
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/********************* BART – Balloon Analogue Risk Task (simplified) ************************/
function BART({ modeDemo, onFinish }){
  const totalBalloons = modeDemo ? 10 : 25;
  const maxBurst = 15; // burst point uniformly 1..15
  const [phase, setPhase] = useState("intro");
  const [idx, setIdx] = useState(0);
  const [pumps, setPumps] = useState(0);
  const [burstPoint, setBurstPoint] = useState(randInt(1, maxBurst));
  const [balloons, setBalloons] = useState([]); // {pumps, burst, banked}

  function start(){
    setPhase("run"); setIdx(0); setPumps(0); setBurstPoint(randInt(1,maxBurst)); setBalloons([]);
  }
  function pump(){
    const next = pumps+1;
    if (next >= burstPoint){
      // burst
      setBalloons(b=>[...b, { pumps: next, burst: true, banked: 0 }]);
      nextBalloon();
    }else{
      setPumps(next);
    }
  }
  function bank(){
    // gain = pumps so far (1 point each)
    setBalloons(b=>[...b, { pumps, burst:false, banked: pumps }]);
    nextBalloon();
  }
  function nextBalloon(){
    const ni = idx+1;
    if (ni >= totalBalloons){
      setPhase("done");
      onFinish && onFinish(computeBART(balloons.concat([])));
      return;
    }
    setIdx(ni);
    setPumps(0);
    setBurstPoint(randInt(1, maxBurst));
  }

  const metrics = useMemo(()=>computeBART(balloons), [balloons]);
  const size = 40 + pumps*6;

  return (
    <Card>
      <CardHeader><CardTitle>BART – Risk Taking for Reward</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {phase==="intro" && (
          <div className="space-y-3">
            <p>Click <strong>Pump</strong> to inflate and earn points; <strong>Bank</strong> to save. If it bursts, you lose this balloon's points.</p>
            <Button onClick={start}>Start</Button>
          </div>
        )}
        {phase==="run" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>Balloon {idx+1}/{totalBalloons}</div>
              <div>Total Banked: <strong>{balloons.reduce((s,b)=>s+b.banked,0)}</strong></div>
            </div>
            <div className="h-52 flex items-center justify-center">
              <div style={{ width: size, height: size, borderRadius: "50%", background: "#f87171" }} title="balloon"/>
            </div>
            <div className="flex justify-center gap-2">
              <Button onClick={pump}>Pump</Button>
              <Button variant="secondary" onClick={bank}>Bank</Button>
            </div>
            <LiveBARTStats balloons={balloons} currentPumps={pumps}/>
          </div>
        )}
        {phase==="done" && (
          <div className="space-y-3">
            <p>Finished! Metrics sent to Dashboard.</p>
            <BARTSummary metrics={metrics}/>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function computeBART(balloons){
  if (!balloons.length) return null;
  const nonBurst = balloons.filter(b=>!b.burst);
  const avgPumpsNonBurst = nonBurst.length ? mean(nonBurst.map(b=>b.pumps)) : NaN;
  const burstRate = balloons.filter(b=>b.burst).length / balloons.length;
  const totalEarnings = balloons.reduce((s,b)=>s+b.banked,0);
  // Learning slope: early vs late avg pumps
  if (balloons.length<4) return { avgPumpsNonBurst, burstRate, slope: NaN, totalEarnings };
  const half = Math.floor(balloons.length/2);
  const early = mean(balloons.slice(0,half).map(b=>b.pumps));
  const late = mean(balloons.slice(half).map(b=>b.pumps));
  const slope = late - early; // positive => pumping more later (risk up) / negative => learning to be cautious
  return { avgPumpsNonBurst, burstRate, slope, totalEarnings };
}
function LiveBARTStats({ balloons, currentPumps }){
  const nb = balloons.filter(b=>!b.burst);
  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Current</div>
        <div>Pumps: <span className="tabular-nums">{currentPumps}</span></div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Non-burst avg pumps</div>
        <div className="tabular-nums">{Number.isFinite(mean(nb.map(b=>b.pumps)))? mean(nb.map(b=>b.pumps)).toFixed(1) : '-'}</div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Burst rate</div>
        <div className="tabular-nums">{balloons.length? Math.round((balloons.filter(b=>b.burst).length/balloons.length)*100) : 0}%</div>
      </div>
    </div>
  );
}
function BARTSummary({ metrics }){
  if (!metrics) return null;
  const data = [
    { name: 'Avg pumps (non-burst)', value: metrics.avgPumpsNonBurst||0 },
    { name: 'Burst rate', value: metrics.burstRate||0 },
    { name: 'Learning slope', value: metrics.slope||0 },
  ];
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm">Total earnings: <strong>{metrics.totalEarnings}</strong></div>
    </div>
  );
}

/********************* Delay Discounting (staircase) ************************/
function DelayDiscounting({ modeDemo, onFinish }){
  // Fixed later amount & delay; staircase NOW adjusts
  const laterAmount = 100;
  const delayDays = 14;
  const trials = modeDemo ? 6 : 12;

  const [phase, setPhase] = useState("intro");
  const [i, setI] = useState(0);
  const [nowAmt, setNowAmt] = useState(50);
  const [hist, setHist] = useState([]); // {now, later, delay, pick:"now"|"later"}

  function start(){
    setPhase("run"); setI(0); setNowAmt(50); setHist([]);
  }
  function choose(pick){
    const rec = { now: nowAmt, later: laterAmount, delay: delayDays, pick };
    const newHist = hist.concat([rec]);
    setHist(newHist);
    if (i+1 >= trials){
      const metrics = computeDelay(newHist);
      setPhase("done");
      onFinish && onFinish(metrics);
      return;
    }
    // staircase: if chose later, increase now (harder to choose later next time); if chose now, decrease now
    const step = Math.max(2, Math.round(Math.abs(nowAmt - (laterAmount/(1+0.2*delayDays))) / 3) ); // rough adaptive step
    const nextNow = pick==="later" ? Math.min(laterAmount-1, nowAmt + step) : Math.max(1, nowAmt - step);
    setNowAmt(nextNow);
    setI(x=>x+1);
  }

  const metrics = useMemo(()=>computeDelay(hist), [hist]);

  return (
    <Card>
      <CardHeader><CardTitle>Delay Discounting – Preference for Immediate Reward</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {phase==="intro" && (
          <div className="space-y-3">
            <p>Choose between receiving <strong>${laterAmount}</strong> in <strong>{delayDays} days</strong> or a smaller amount <strong>today</strong>. Amount today will adapt.</p>
            <Button onClick={start}>Start</Button>
          </div>
        )}
        {phase==="run" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>Question {i+1}/{trials}</div>
              <Progress value={100*(i/trials)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button className="h-20 text-base" onClick={()=>choose("now")}>${nowAmt} <span className="opacity-70">today</span></Button>
              <Button className="h-20 text-base" variant="secondary" onClick={()=>choose("later")}>${laterAmount} <span className="opacity-70">in {delayDays} days</span></Button>
            </div>
            <LiveDelayStats hist={hist}/>
          </div>
        )}
        {phase==="done" && (
          <div className="space-y-3">
            <p>Finished! Metrics sent to Dashboard.</p>
            <DelaySummary metrics={metrics}/>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function computeDelay(hist){
  if (!hist.length) return null;
  const later = hist[0]?.later ?? 100;
  const delay = hist[0]?.delay ?? 14;
  const lastNow = hist[hist.length-1].now;
  // Hyperbolic: V = A/(1+kD) ~ indifference when V ≈ Now*
  const A = later;
  const NowStar = lastNow;
  const k = Math.max(0, (A/Math.max(1,NowStar) - 1) / Math.max(1,delay) );
  const choiceNowPct = hist.filter(h=>h.pick==="now").length / hist.length;
  // crude consistency: count single switching
  let switches = 0;
  for (let i=1;i<hist.length;i++){
    if (hist[i].pick !== hist[i-1].pick) switches++;
  }
  const consistency = 1 - (switches / (hist.length-1 || 1));
  return { k, choiceNowPct, consistency, NowStar, A, D:delay };
}
function LiveDelayStats({ hist }){
  const nowPct = hist.length? Math.round(100*hist.filter(h=>h.pick==="now").length / hist.length) : 0;
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Now choices</div>
        <div className="tabular-nums">{nowPct}%</div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Questions answered</div>
        <div className="tabular-nums">{hist.length}</div>
      </div>
    </div>
  );
}
function DelaySummary({ metrics }){
  if (!metrics) return null;
  const data = [
    { name: 'k (hyperbolic)', value: metrics.k || 0 },
    { name: 'Now choice %', value: (metrics.choiceNowPct||0) },
  ];
  return (
    <div className="space-y-3">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-sm">Consistency: <strong>{Number.isFinite(metrics.consistency)? (metrics.consistency*100).toFixed(0)+'%' : '-'}</strong></div>
    </div>
  );
}

/********************* Dashboard ************************/
function Dashboard({ results }){
  const { go, stroop, framing, mid, bart, delay } = results;
  const ready = go || stroop || framing || mid || bart || delay;

  const advisory = [];
  if (go){ advisory.push({title:'Impulse control', tip:'Use pre-commitment & default position limits; avoid “opportunity framing”.', flag: go.inhErrRate>0.15 || go.cv>0.35 || go.fatigue>0.05}); }
  if (stroop){ advisory.push({title:'Interference control', tip:'Lead with cold data (drawdowns/probabilities) before narratives.', flag: (stroop.costRT||0)>120 || (stroop.costErr||0)>0.05}); }
  if (framing){ advisory.push({title:'Framing stability', tip:'Standardize scales/units; reduce reframing across reports.', flag: (framing.amplitude||0)>0.2 || (1-(framing.consistency||1))>0.25}); }
  if (mid){ advisory.push({title:'Reward reactivity', tip:'Replace “maximum return” wording with ranges and scenario trees.', flag: (mid.deltaRT||0)<-60 || (mid.deltaErr||0)<-0.03}); }
  if (bart){ advisory.push({title:'Reward-driven risk', tip:'Set drawdown thresholds and auto-rebalancing; use small test positions.', flag: (bart.avgPumpsNonBurst||0)>8 && (bart.burstRate||0)>0.35 && (!Number.isFinite(bart.slope) || bart.slope<=0) }); }
  if (delay){ advisory.push({title:'Short-horizon preference', tip:'Bucket strategy: separate short/mid/long-term funds.', flag: (delay.k||0)>0.02 || (delay.choiceNowPct||0)>0.5 }); }

  const mix = [];
  if (go) { mix.push({ name: 'Go: InhibErr', value: go.inhErrRate }); mix.push({ name: 'Go: RT CV', value: go.cv }); }
  if (stroop) mix.push({ name: 'Stroop: RT cost (s)', value: (stroop.costRT||0)/1000 });
  if (framing) mix.push({ name: 'Frame: amplitude', value: framing.amplitude });
  if (mid) { mix.push({ name: 'MID: ΔRT (ms)', value: mid.deltaRT||0 }); mix.push({ name: 'MID: ΔErr', value: mid.deltaErr||0 }); }
  if (bart) { mix.push({ name: 'BART: Avg pumps', value: bart.avgPumpsNonBurst||0 }); mix.push({ name: 'BART: Burst rate', value: bart.burstRate||0 }); }
  if (delay) { mix.push({ name: 'Delay: k', value: delay.k||0 }); mix.push({ name: 'Delay: Now%', value: delay.choiceNowPct||0 }); }

  return (
    <Card>
      <CardHeader><CardTitle>Results Dashboard</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {!ready && <p className="opacity-70">Run any task to see results.</p>}
        {ready && (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mix}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {advisory.map((a,i)=> (
                <div key={i} className={`p-4 rounded-2xl ${a.flag? 'bg-amber-100 border border-amber-300' : 'bg-muted'}`}>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-sm mt-1">{a.tip}</div>
                </div>
              ))}
            </div>
            <RawJSON results={results} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
function RawJSON({ results }){
  const json = JSON.stringify(results, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  return (
    <div className="text-sm">
      <div className="font-semibold mb-2">Raw results (downloadable)</div>
      <a className="underline" href={url} download={`cognitive_results_${Date.now()}.json`}>Download JSON</a>
    </div>
  )
}
