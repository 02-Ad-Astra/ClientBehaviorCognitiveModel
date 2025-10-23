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
  const [modeDemo, setModeDemo] = useState(true); // Demo vs Full lengths
  const [results, setResults] = useState({ go: null, stroop: null, framing: null });
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Cognitive Control Tasks – Demo</h1>
        <p className="text-sm opacity-80">Go/No-Go (impulse inhibition), Stroop (interference control), and Framing Stability (consistency). Collects metrics and shows visual summaries with recommendations.</p>
        <div className="flex items-center gap-3">
          <Switch checked={modeDemo} onCheckedChange={setModeDemo} id="mode" />
          <Label htmlFor="mode">Demo mode ({modeDemo ? "short" : "full"})</Label>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gonogo">Go/No-Go</TabsTrigger>
          <TabsTrigger value="stroop">Stroop</TabsTrigger>
          <TabsTrigger value="framing">Framing</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>How to use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Pick a task tab. Keep this window focused. Use <kbd className="px-1 border rounded">Space</kbd> or labeled keys as instructed.</li>
                <li>Demo mode runs short blocks so you can test quickly. Toggle off for full-length runs.</li>
                <li>After finishing a task, go to <strong>Dashboard</strong> to see computed metrics, charts, and advisory actions.</li>
              </ol>
              <p className="opacity-80">Safety: This is a lightweight research demo, not a diagnostic. Use in quiet setting with a hardware keyboard for best timing.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gonogo">
          <GoNoGo modeDemo={modeDemo} onFinish={(r)=>setResults(prev=>({...prev, go:r}))} />
        </TabsContent>
        <TabsContent value="stroop">
          <Stroop modeDemo={modeDemo} onFinish={(r)=>setResults(prev=>({...prev, stroop:r}))} />
        </TabsContent>
        <TabsContent value="framing">
          <Framing modeDemo={modeDemo} onFinish={(r)=>setResults(prev=>({...prev, framing:r}))} />
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
  const blockSec = modeDemo ? 15 : 60; // 4 blocks
  const [phase, setPhase] = useState("intro");
  const [blockIdx, setBlockIdx] = useState(-1); // -1 = practice, 0..3 = blocks
  const [timeLeft, setTimeLeft] = useState(0);
  const [stim, setStim] = useState(null); // {color: 'green'|'red', start: t, deadline}
  const [log, setLog] = useState([]); // trial logs
  const timerRef = useRef(null);
  const stimRef = useRef(null);
  const runningRef = useRef(false);

  // === Mouse click handler (replaces keyboard control) ===
  function handleClick(){
    if (!runningRef.current) return;
    const s = stimRef.current;
    if (!s) return; // no active stimulus
    const now = performance.now();
    if (now > s.deadline) return; // ignore late clicks
    const rt = now - s.start;
    const isGo = s.color === 'green';
    const correct = isGo; // clicking on green = correct, red = commission error
    const type = isGo ? 'hit' : 'commission';
    setLog(l=>[...l, {t: now, block: blockIdx, color: s.color, responded: true, rt, correct, type}]);
    // consume the stimulus
    stimRef.current = null;
    setStim(null);
  }

  // === Removed keyboard event listener ===
  // No keydown event or Space key logic anymore.

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
    // Random ISI 800–1300 ms, Go probability 0.75, visible for 600–900 ms
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
        // auto-log missed responses (omission or correct-withhold)
        setTimeout(()=>{
          if (stimRef.current === stimObj){
            setLog(l=>[...l, {t: performance.now(), block: blockIdx, color, responded: false, rt: null, correct: color==='red', type: color==='green' ? 'omission' : 'correct-withhold'}]);
            stimRef.current = null;
            setStim(null);
          }
          // schedule next trial
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
      <CardHeader>
        <CardTitle>Go/No-Go – Impulse Inhibition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase==='intro' && (
          <div className="space-y-3">
            {/* Instruction updated: click instead of press Space */}
            <p><span className="font-semibold">Click</span> for <span className="font-semibold text-green-600">green</span> circle (Go). Do not click for <span className="font-semibold text-red-600">red</span> circle (No-Go). Random time pressure.</p>
            <p>Flow: 1-min practice {modeDemo && "(shortened)"} → 4 blocks of {blockSec}s each.</p>
            <Button onClick={()=>startPhase('practice')}>Start Practice</Button>
          </div>
        )}

        {phase==='preblocks' && (
          <div className="space-y-3">
            <p>Nice. Ready for the 4 blocks?</p>
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
                <p>Short break. When ready:</p>
                <Button onClick={nextBlock}>Start next block</Button>
              </div>
            ) : (
              // Clickable stimulus area
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
            <p>Finished! Metrics are computed and sent to the Dashboard.</p>
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
const KEY_MAP = { RED: 'KeyR', GREEN: 'KeyG', BLUE: 'KeyB', YELLOW: 'KeyY' };

function Stroop({ modeDemo, onFinish }) {
  const totalTrials = modeDemo ? 40 : 120;

  const [phase, setPhase] = useState("intro");
  const [i, setI] = useState(0);
  const [trial, setTrial] = useState(null); // { word, color, congruent, start, deadline }
  const [log, setLog] = useState([]);       // { word, color, congruent, rt, correct }

  // Refs: used for timers & stable state access
  const trialRef = useRef(null);
  const acceptAfterRef = useRef(0);  // cooldown window (absolute time)
  const missTimerRef = useRef(null); // timeout for missed trials

  /** Create one timed trial and start auto-miss timer */
  function makeTrial() {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    const congruent = Math.random() < 0.5;
    const color = congruent ? word : shuffle(COLORS.filter(c => c !== word))[0];

    const start = performance.now();
    const deadline = start + (modeDemo ? 2000 : 1500);
    const t = { word, color, congruent, start, deadline };

    trialRef.current = t;
    setTrial(t);

    // Prevent “late clicks” from previous trial for 120 ms
    acceptAfterRef.current = start + 120;

    // Auto-miss timer
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

  /** Handle a valid on-screen response */
  function commitResponse(answerColor, now = performance.now()) {
    const t = trialRef.current;
    if (!t) return;

    // Enforce valid window [acceptAfter, deadline]
    if (now < acceptAfterRef.current || now > t.deadline) return;

    const rt = now - t.start;
    const correct = answerColor === t.color;

    clearTimeout(missTimerRef.current); // avoid double count

    setLog(l => [...l, { word:t.word, color:t.color, congruent:t.congruent, rt, correct }]);
    trialRef.current = null;
    setTrial(null);
    setI(x => Math.min(x + 1, totalTrials));
  }

  /** Trial scheduling (with short ISI) */
  useEffect(() => {
    if (phase !== "run") return;

    if (i >= totalTrials) {
      clearTimeout(missTimerRef.current);
      setPhase("done");
      onFinish && onFinish(computeStroop(log));
      return;
    }

    const isi = 250; // Inter-Stimulus Interval
    const t = setTimeout(() => makeTrial(), isi);
    return () => clearTimeout(t);
  }, [phase, i, totalTrials, modeDemo, log, onFinish]);

  /** Handle tab visibility changes */
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
      <CardHeader>
        <CardTitle>Stroop – Interference Control</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* --- Intro --- */}
        {phase === "intro" && (
          <div className="space-y-3">
            <p>
              Click the on-screen buttons to respond for the <strong>ink color</strong>, ignoring the word.
            </p>
            <Button onClick={() => setPhase("run")}>Start</Button>
          </div>
        )}

        {/* --- Running --- */}
        {phase === "run" && (
          <div className="space-y-4">
            {/* Stimulus */}
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

            {/* Response buttons */}
            <ColorButtons onPick={c => commitResponse(c)} />

            {/* Live stats (optional) */}
            {typeof LiveStroopStats === "function" && (
              <LiveStroopStats log={log} i={i} total={totalTrials} />
            )}
          </div>
        )}

        {/* --- Finished --- */}
        {phase === "done" && (
          <div className="space-y-3">
            <p>Finished! Metrics are computed and sent to the Dashboard.</p>
            {typeof StroopSummary === "function" && (
              <StroopSummary metrics={metrics} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** On-screen color buttons */
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
  // gain vs loss variants with equal EV
  { id: 1, p: 0.5, sureGain: 50, gambleGain: 100, sureLoss: -50, gambleLoss: -100 },
  { id: 2, p: 0.25, sureGain: 25, gambleGain: 100, sureLoss: -25, gambleLoss: -100 },
  { id: 3, p: 0.75, sureGain: 75, gambleGain: 100, sureLoss: -75, gambleLoss: -100 },
  { id: 4, p: 0.6, sureGain: 60, gambleGain: 100, sureLoss: -60, gambleLoss: -100 },
  { id: 5, p: 0.4, sureGain: 40, gambleGain: 100, sureLoss: -40, gambleLoss: -100 },
  { id: 6, p: 0.9, sureGain: 90, gambleGain: 100, sureLoss: -90, gambleLoss: -100 },
];

function Framing({ modeDemo, onFinish }){
  const [phase, setPhase] = useState('intro');
  const [queue, setQueue] = useState([]); // randomized sequence
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState([]); // {id, frame, choice:'sure'|'gamble'}

  function start(){
    // Two sets (gain/loss), then repeat after filler items (randomized)
    const gains = framingItemsBase.map(x=>({ ...x, frame:'gain' }));
    const losses = framingItemsBase.map(x=>({ ...x, frame:'loss' }));
    const set1 = shuffle([...gains, ...losses]);
    // Repeat order after 10–15 items; we emulate with the same set again shuffled
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
      <CardHeader>
        <CardTitle>Framing Stability – Consistency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase==='intro' && (
          <div className="space-y-3">
            <p>Choose between a sure option and a probabilistic option. We present equivalent expected values framed as gains vs losses; items repeat later.</p>
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
            <p>Finished! Metrics are computed and sent to the Dashboard.</p>
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
  const amplitude = propRiskLoss - propRiskGain; // classic: more risk-seeking under losses
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
      <div className="text-sm">Framing effect amplitude (Loss − Gain risky %): <span className="font-semibold">{Number.isFinite(metrics.amplitude)? (metrics.amplitude*100).toFixed(1) + '%': '-'}</span><br/>Retest consistency: <span className="font-semibold">{Number.isFinite(metrics.consistency)? (metrics.consistency*100).toFixed(1) + '%': '-'}</span></div>
    </div>
  )
}

/********************* Dashboard ************************/
function Dashboard({ results }){
  const { go, stroop, framing } = results;
  const ready = go || stroop || framing;
  const advisory = [];
  if (go){ advisory.push({title:'Impulse control', tip:'Avoid “opportunity” framing; set pre-commitment & default position limits.', flag: go.inhErrRate>0.15 || go.cv>0.35 || go.fatigue>0.05}); }
  if (stroop){ advisory.push({title:'Interference control', tip:'Present cold data first (drawdowns, probabilities), then narratives.', flag: (stroop.costRT||0)>120 || (stroop.costErr||0)>0.05}); }
  if (framing){ advisory.push({title:'Framing stability', tip:'Fix standardized displays (same scales/units) and reduce reframing.', flag: (framing.amplitude||0)>0.2 || (1-(framing.consistency||1))>0.25}); }

  const mix = [];
  if (go) mix.push({ name: 'Go: InhibErr', value: go.inhErrRate });
  if (go) mix.push({ name: 'Go: RT CV', value: go.cv });
  if (stroop) mix.push({ name: 'Stroop: RT cost', value: (stroop.costRT||0)/1000 });
  if (framing) mix.push({ name: 'Frame: amplitude', value: framing.amplitude });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results Dashboard</CardTitle>
      </CardHeader>
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
      <a className="underline" href={url} download={`cognitive_control_results_${Date.now()}.json`}>Download JSON</a>
    </div>
  )
}
