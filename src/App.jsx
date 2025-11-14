import React, { useEffect, useMemo, useRef, useState } from "react";
/* ---------------------------------------------------------------- */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

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
  <div
    style={{
      border: "1px solid #ccc",
      borderRadius: "10px",
      padding: "16px",
      marginBottom: "12px",
      background: "#fff",
    }}
  >
    {children}
  </div>
);
const CardHeader = ({ children }) => (
  <div style={{ marginBottom: "8px", fontWeight: "bold" }}>{children}</div>
);
const CardTitle = ({ children }) => <h2>{children}</h2>;
const CardContent = ({ children }) => <div>{children}</div>;

/* ---------- Tabs with simple state wiring ---------- */
const Tabs = ({ value, onValueChange, children }) => (
  <div>
    {React.Children.map(children, (child) =>
      React.cloneElement(child, {
        tabValue: value,
        onTabChange: onValueChange,
      })
    )}
  </div>
);

const TabsList = ({ children, tabValue, onTabChange }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginBottom: "12px",
    }}
  >
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { tabValue, onTabChange })
    )}
  </div>
);

const TabsTrigger = ({ children, value, tabValue, onTabChange }) => (
  <Button
    variant={tabValue === value ? undefined : "secondary"}
    onClick={() => onTabChange && onTabChange(value)}
  >
    {children}
  </Button>
);

const TabsContent = ({ children, value, tabValue }) =>
  tabValue === value ? (
    <div style={{ marginTop: "12px" }}>{children}</div>
  ) : null;

const Switch = ({ checked, onCheckedChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  </label>
);
const Label = ({ children }) => (
  <span style={{ fontSize: "14px" }}>{children}</span>
);
const Progress = ({ value }) => (
  <div
    style={{
      width: "100%",
      height: "8px",
      background: "#eee",
      borderRadius: "4px",
    }}
  >
    <div
      style={{
        height: "8px",
        width: `${Math.max(0, Math.min(100, value || 0))}%`,
        background: "#3b82f6",
        borderRadius: "4px",
        transition: "width 0.2s",
      }}
    />
  </div>
);

/* ---------------------------------------------------------------- */

function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN;
}
function std(arr) {
  if (!arr.length) return NaN;
  const m = mean(arr);
  const v = mean(arr.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}
function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function safeNumber(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : NaN;
}

export default function CognitiveControlDemo() {
  const [tab, setTab] = useState("cog");
  const [modeDemo, setModeDemo] = useState(true);
  const [results, setResults] = useState({
    go: null,
    stroop: null,
    framing: null,
    mid: null,
    bart: null,
    delay: null,
    probability: null,
    calibration: null,
    anchoring: null,
  });

  // restart keys
  const [goKey, setGoKey] = useState(0);
  const [stroopKey, setStroopKey] = useState(0);
  const [framingKey, setFramingKey] = useState(0);
  const [midKey, setMidKey] = useState(0);
  const [bartKey, setBartKey] = useState(0);
  const [delayKey, setDelayKey] = useState(0);
  const [probKey, setProbKey] = useState(0);
  const [calibKey, setCalibKey] = useState(0);
  const [anchorKey, setAnchorKey] = useState(0);

  const restartGo = () => {
    setGoKey((k) => k + 1);
    setResults((r) => ({ ...r, go: null }));
  };
  const restartStroop = () => {
    setStroopKey((k) => k + 1);
    setResults((r) => ({ ...r, stroop: null }));
  };
  const restartFraming = () => {
    setFramingKey((k) => k + 1);
    setResults((r) => ({ ...r, framing: null }));
  };
  const restartMID = () => {
    setMidKey((k) => k + 1);
    setResults((r) => ({ ...r, mid: null }));
  };
  const restartBART = () => {
    setBartKey((k) => k + 1);
    setResults((r) => ({ ...r, bart: null }));
  };
  const restartDelay = () => {
    setDelayKey((k) => k + 1);
    setResults((r) => ({ ...r, delay: null }));
  };
  const restartProb = () => {
    setProbKey((k) => k + 1);
    setResults((r) => ({ ...r, probability: null }));
  };
  const restartCalib = () => {
    setCalibKey((k) => k + 1);
    setResults((r) => ({ ...r, calibration: null }));
  };
  const restartAnchor = () => {
    setAnchorKey((k) => k + 1);
    setResults((r) => ({ ...r, anchoring: null }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          Investor Cognition & Reward–Risk Profile – Demo
        </h1>
        <p className="text-sm opacity-80">
          Cognitive control (Go/No-Go, Stroop, Framing), Reward sensitivity
          (MID, BART, Delay), and Risk perception & biases (probability
          weighting, calibration, anchoring).
        </p>
        <div className="flex items-center gap-3">
          <Switch checked={modeDemo} onCheckedChange={setModeDemo} id="mode" />
          <Label htmlFor="mode">
            Demo mode ({modeDemo ? "short" : "full"})
          </Label>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="cog">Cognitive Control</TabsTrigger>
          <TabsTrigger value="reward">Reward Sensitivity</TabsTrigger>
          <TabsTrigger value="risk">Risk Perception & Biases</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        {/* Cognitive control: Go/No-Go, Stroop, Framing */}
        <TabsContent value="cog">
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Control Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={restartGo}>
                  Restart Go/No-Go
                </Button>
              </div>
              <GoNoGo
                key={goKey}
                modeDemo={modeDemo}
                onFinish={(r) => setResults((prev) => ({ ...prev, go: r }))}
              />

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button variant="secondary" onClick={restartStroop}>
                  Restart Stroop
                </Button>
              </div>
              <Stroop
                key={stroopKey}
                modeDemo={modeDemo}
                onFinish={(r) => setResults((prev) => ({ ...prev, stroop: r }))}
              />

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button variant="secondary" onClick={restartFraming}>
                  Restart Framing
                </Button>
              </div>
              <Framing
                key={framingKey}
                modeDemo={modeDemo}
                onFinish={(r) =>
                  setResults((prev) => ({ ...prev, framing: r }))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reward sensitivity: MID, BART, Delay Discounting */}
        <TabsContent value="reward">
          <Card>
            <CardHeader>
              <CardTitle>Reward Sensitivity Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={restartMID}>
                  Restart MID
                </Button>
              </div>
              <MID
                key={midKey}
                modeDemo={modeDemo}
                onFinish={(r) => setResults((prev) => ({ ...prev, mid: r }))}
              />

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button variant="secondary" onClick={restartBART}>
                  Restart BART
                </Button>
              </div>
              <BART
                key={bartKey}
                modeDemo={modeDemo}
                onFinish={(r) => setResults((prev) => ({ ...prev, bart: r }))}
              />

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button variant="secondary" onClick={restartDelay}>
                  Restart Delay
                </Button>
              </div>
              <DelayDiscounting
                key={delayKey}
                modeDemo={modeDemo}
                onFinish={(r) => setResults((prev) => ({ ...prev, delay: r }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk perception & biases: Probability weighting, Calibration, Anchoring */}
        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Perception & Bias Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProbabilityWeightingTask
                key={probKey}
                onFinish={(r) =>
                  setResults((prev) => ({ ...prev, probability: r }))
                }
              />

              <CalibrationTask
                key={calibKey}
                onFinish={(r) =>
                  setResults((prev) => ({ ...prev, calibration: r }))
                }
              />

              <AnchoringTask
                key={anchorKey}
                onFinish={(r) =>
                  setResults((prev) => ({ ...prev, anchoring: r }))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <Dashboard results={results} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/********************* Go/No-Go ************************/
function GoNoGo({ modeDemo, onFinish }) {
  const NUM_BLOCKS = modeDemo ? 3 : 4;
  const practiceSec = modeDemo ? 5 : 15;
  const blockSec = modeDemo ? 10 : 60;

  const [phase, setPhase] = useState("intro");
  const [blockIdx, setBlockIdx] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [stim, setStim] = useState(null);
  const [log, setLog] = useState([]);
  const timerRef = useRef(null);
  const stimRef = useRef(null);
  const runningRef = useRef(false);

  function handleClick() {
    if (!runningRef.current) return;
    const s = stimRef.current;
    if (!s) return;
    const now = performance.now();
    if (now > s.deadline) return;
    const rt = now - s.start;
    const isGo = s.color === "green";
    const type = isGo ? "hit" : "commission";
    setLog((l) => [
      ...l,
      {
        t: now,
        block: blockIdx,
        color: s.color,
        responded: true,
        rt,
        correct: isGo,
        type,
      },
    ]);
    stimRef.current = null;
    setStim(null);
  }

  function startPhase(which) {
    setLog([]);
    setBlockIdx(which === "practice" ? -1 : 0);
    const dur = which === "practice" ? practiceSec : blockSec;
    setTimeLeft(dur);
    setPhase(which);
    runningRef.current = true;
    scheduleStimulus();
    timerRef.current && clearInterval(timerRef.current);
    const t0 = performance.now();
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - t0) / 1000;
      const rem =
        (which === "practice" ? practiceSec : blockSec) - elapsed;
      setTimeLeft(Math.max(0, rem));
      if (rem <= 0) {
        clearInterval(timerRef.current);
        runningRef.current = false;
        if (which === "practice") {
          setPhase("preblocks");
        } else {
          if (blockIdx < NUM_BLOCKS - 1) {
            setPhase("interval");
          } else {
            setPhase("done");
            onFinish && onFinish(computeGoNoGo(log));
          }
        }
      }
    }, 50);
  }

  function nextBlock() {
    const next = blockIdx + 1;
    setBlockIdx(next);
    setPhase("block");
    runningRef.current = true;
    setTimeLeft(blockSec);
    scheduleStimulus();
    timerRef.current && clearInterval(timerRef.current);
    const t0 = performance.now();
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - t0) / 1000;
      const rem = blockSec - elapsed;
      setTimeLeft(Math.max(0, rem));
      if (rem <= 0) {
        clearInterval(timerRef.current);
        runningRef.current = false;
        if (next < NUM_BLOCKS - 1) {
          setPhase("interval");
        } else {
          setPhase("done");
          onFinish && onFinish(computeGoNoGo(log));
        }
      }
    }, 50);
  }

  function scheduleStimulus() {
    function loop() {
      if (!runningRef.current) return;
      const delay = 800 + Math.random() * 500;
      setTimeout(() => {
        if (!runningRef.current) return;
        const color = Math.random() < 0.75 ? "green" : "red";
        const now = performance.now();
        const visMs = 600 + Math.random() * 300;
        const stimObj = { color, start: now, deadline: now + visMs };
        stimRef.current = stimObj;
        setStim(stimObj);
        setTimeout(() => {
          if (stimRef.current === stimObj) {
            setLog((l) => [
              ...l,
              {
                t: performance.now(),
                block: blockIdx,
                color,
                responded: false,
                rt: null,
                correct: color === "red",
                type:
                  color === "green"
                    ? "omission"
                    : "correct-withhold",
              },
            ]);
            stimRef.current = null;
            setStim(null);
          }
          loop();
        }, visMs);
      }, delay);
    }
    loop();
  }

  useEffect(
    () => () => {
      timerRef.current && clearInterval(timerRef.current);
      runningRef.current = false;
    },
    []
  );
  const metrics = useMemo(() => computeGoNoGo(log), [log]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Go/No-Go – Impulse Inhibition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase === "intro" && (
          <div className="space-y-3">
            <p>
              <span className="font-semibold">Click</span> for{" "}
              <span className="font-semibold text-green-600">green</span>{" "}
              circle (Go). Do not click for{" "}
              <span className="font-semibold text-red-600">red</span>{" "}
              circle (No-Go).
            </p>
            <p>
              Flow: practice → {NUM_BLOCKS} blocks of {blockSec}s.
            </p>
            <Button onClick={() => startPhase("practice")}>
              Start Practice
            </Button>
          </div>
        )}

        {phase === "preblocks" && (
          <div className="space-y-3">
            <p>Ready for the blocks?</p>
            <Button onClick={nextBlock}>
              Start Block 1/{NUM_BLOCKS}
            </Button>
          </div>
        )}

        {["block", "interval", "practice"].includes(phase) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                {phase === "practice"
                  ? "Practice"
                  : `Block ${blockIdx + 1} / ${NUM_BLOCKS}`}
              </div>
              <div className="w-1/2">
                <Progress
                  value={
                    100 *
                    (timeLeft /
                      (phase === "practice" ? practiceSec : blockSec))
                  }
                />
              </div>
              <div className="tabular-nums">
                {timeLeft.toFixed(1)}s
              </div>
            </div>
            {phase === "interval" ? (
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
                  <div
                    className={`w-24 h-24 rounded-full ${
                      stim.color === "green" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                ) : (
                  <div className="opacity-40">+</div>
                )}
              </div>
            )}
            <LiveGoNoGoStats log={log} />
          </div>
        )}

        {phase === "done" && (
          <div className="space-y-4">
            <p>Finished! Metrics sent to Dashboard.</p>
            <GoNoGoSummary metrics={metrics} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function LiveGoNoGoStats({ log }) {
  const go = log.filter((r) => r.color === "green");
  const red = log.filter((r) => r.color === "red");
  const hits = go.filter((r) => r.type === "hit");
  const omissions = go.filter((r) => r.type === "omission");
  const commissions = red.filter((r) => r.type === "commission");
  const rt = hits.map((r) => r.rt);
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Running counts</div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
          <div>Go trials</div>
          <div className="text-right tabular-nums">{go.length}</div>
          <div>Hits</div>
          <div className="text-right tabular-nums">{hits.length}</div>
          <div>Omissions</div>
          <div className="text-right tabular-nums">
            {omissions.length}
          </div>
          <div>Commissions</div>
          <div className="text-right tabular-nums">
            {commissions.length}
          </div>
        </div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">RT (correct Go)</div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
          <div>Mean</div>
          <div className="text-right tabular-nums">
            {Number.isFinite(mean(rt)) ? Math.round(mean(rt)) : "-"} ms
          </div>
          <div>Std</div>
          <div className="text-right tabular-nums">
            {Number.isFinite(std(rt)) ? Math.round(std(rt)) : "-"} ms
          </div>
          <div>CV</div>
          <div className="text-right tabular-nums">
            {Number.isFinite(std(rt) / mean(rt))
              ? (std(rt) / mean(rt)).toFixed(2)
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
function computeGoNoGo(log) {
  if (!log || !log.length) return null;

  const blockIds = Array.from(
    new Set(log.map((r) => r.block).filter((b) => b >= 0))
  ).sort((a, b) => a - b);
  const blocks = blockIds.map((b) => log.filter((r) => r.block === b));

  const go = log.filter((r) => r.color === "green");
  const red = log.filter((r) => r.color === "red");
  const hits = go.filter((r) => r.type === "hit");
  const omissions = go.filter((r) => r.type === "omission");
  const commissions = red.filter((r) => r.type === "commission");
  const rt = hits.map((r) => r.rt).filter(Number.isFinite);
  const rtMean = mean(rt);
  const rtStd = std(rt);
  const cv = rtStd / rtMean;
  const inhErrRate = commissions.length / (red.length || 1);
  const omissRate = omissions.length / (go.length || 1);
  const blockErrs = blocks.map(
    (b) =>
      b.filter(
        (r) => r.type === "commission" || r.type === "omission"
      ).length / (b.length || 1)
  );
  const fatigue =
    blockErrs.length >= 2
      ? (blockErrs[blockErrs.length - 1] ?? 0) - (blockErrs[0] ?? 0)
      : 0;
  return {
    rtMean,
    rtStd,
    cv,
    inhErrRate,
    omissRate,
    blockErrs,
    fatigue,
    counts: {
      go: go.length,
      red: red.length,
      hits: hits.length,
      omissions: omissions.length,
      commissions: commissions.length,
    },
  };
}
function GoNoGoSummary({ metrics }) {
  if (!metrics) return null;
  const data = [
    { name: "Inhibition error rate", value: metrics.inhErrRate },
    { name: "Omission error rate", value: metrics.omissRate },
    { name: "RT CV", value: metrics.cv },
    { name: "Fatigue drift", value: metrics.fatigue },
  ];
  const blockData = metrics.blockErrs.map((e, i) => ({
    block: `B${i + 1}`,
    errors: e,
  }));
  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" hide />
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
  );
}

/********************* Stroop ************************/
const COLORS = ["RED", "GREEN", "BLUE", "YELLOW"];
const COLOR_MAP = {
  RED: "text-red-600",
  GREEN: "text-green-600",
  BLUE: "text-blue-600",
  YELLOW: "text-yellow-500",
};

function Stroop({ modeDemo, onFinish }) {
  const totalTrials = modeDemo ? 24 : 120;
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
    const color = congruent
      ? word
      : shuffle(COLORS.filter((c) => c !== word))[0];
    const start = performance.now();
    const deadline = start + (modeDemo ? 2000 : 1500);
    const t = { word, color, congruent, start, deadline };
    trialRef.current = t;
    setTrial(t);
    acceptAfterRef.current = start + 120;
    clearTimeout(missTimerRef.current);
    missTimerRef.current = setTimeout(() => {
      if (trialRef.current === t) {
        setLog((l) => [
          ...l,
          {
            word: t.word,
            color: t.color,
            congruent: t.congruent,
            rt: null,
            correct: false,
          },
        ]);
        trialRef.current = null;
        setTrial(null);
        setI((x) => Math.min(x + 1, totalTrials));
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
    setLog((l) => [
      ...l,
      {
        word: t.word,
        color: t.color,
        congruent: t.congruent,
        rt,
        correct,
      },
    ]);
    trialRef.current = null;
    setTrial(null);
    setI((x) => Math.min(x + 1, totalTrials));
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
    return () =>
      document.removeEventListener("visibilitychange", onVis);
  }, [phase, i, totalTrials]);

  const metrics = useMemo(() => computeStroop(log), [log]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stroop – Interference Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase === "intro" && (
          <div className="space-y-3">
            <p>
              Click the buttons for the <strong>ink color</strong>,
              ignoring the word.
            </p>
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
                  <div className={`text-6xl font-bold ${cls}`}>
                    {word}
                  </div>
                ) : (
                  <div className="opacity-40">+</div>
                );
              })()}
            </div>
            <ColorButtons onPick={(c) => commitResponse(c)} />
            <LiveStroopStats log={log} i={i} total={totalTrials} />
          </div>
        )}
        {phase === "done" && (
          <div className="space-y-3">
            <p>Finished! Metrics sent to Dashboard.</p>
            <StroopSummary metrics={metrics} />
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
      {order.map((c) => (
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
function computeStroop(log) {
  const c = log.filter((t) => t.congruent && t.rt != null && t.correct);
  const ic = log.filter((t) => !t.congruent && t.rt != null && t.correct);
  const cMean = mean(c.map((x) => x.rt));
  const icMean = mean(ic.map((x) => x.rt));
  const cErr =
    1 -
    c.length / Math.max(1, log.filter((t) => t.congruent).length);
  const icErr =
    1 -
    ic.length / Math.max(1, log.filter((t) => !t.congruent).length);
  const costRT = icMean - cMean;
  const costErr = icErr - cErr;
  return { cMean, icMean, costRT, cErr, icErr, costErr };
}
function LiveStroopStats({ log, i, total }) {
  const c = log.filter((t) => t.congruent && t.rt != null && t.correct);
  const ic = log.filter((t) => !t.congruent && t.rt != null && t.correct);
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Progress</div>
        <div className="mt-2 flex items-center gap-3">
          <Progress value={100 * (i / total)} className="w-full" />
          <div className="tabular-nums">
            {i}/{total}
          </div>
        </div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">RT (ms)</div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
          <div>Congruent</div>
          <div className="text-right tabular-nums">
            {Number.isFinite(mean(c.map((x) => x.rt)))
              ? Math.round(mean(c.map((x) => x.rt)))
              : "-"}
          </div>
          <div>Incongruent</div>
          <div className="text-right tabular-nums">
            {Number.isFinite(mean(ic.map((x) => x.rt)))
              ? Math.round(mean(ic.map((x) => x.rt)))
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
function StroopSummary({ metrics }) {
  if (!metrics) return null;
  const data = [
    {
      name: "Interference cost (RT ms)",
      value: metrics.costRT || 0,
    },
    { name: "Error diff (IC - C)", value: metrics.costErr || 0 },
  ];
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/********************* Framing ************************/
const framingItemsBase = [
  {
    id: 1,
    p: 0.5,
    sureGain: 50,
    gambleGain: 100,
    sureLoss: -50,
    gambleLoss: -100,
  },
  {
    id: 2,
    p: 0.25,
    sureGain: 25,
    gambleGain: 100,
    sureLoss: -25,
    gambleLoss: -100,
  },
  {
    id: 3,
    p: 0.75,
    sureGain: 75,
    gambleGain: 100,
    sureLoss: -75,
    gambleLoss: -100,
  },
  {
    id: 4,
    p: 0.6,
    sureGain: 60,
    gambleGain: 100,
    sureLoss: -60,
    gambleLoss: -100,
  },
  {
    id: 5,
    p: 0.4,
    sureGain: 40,
    gambleGain: 100,
    sureLoss: -40,
    gambleLoss: -100,
  },
  {
    id: 6,
    p: 0.9,
    sureGain: 90,
    gambleGain: 100,
    sureLoss: -90,
    gambleLoss: -100,
  },
];
function Framing({ modeDemo, onFinish }) {
  const [phase, setPhase] = useState("intro");
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState([]);

  function start() {
    const gains = framingItemsBase.map((x) => ({
      ...x,
      frame: "gain",
    }));
    const losses = framingItemsBase.map((x) => ({
      ...x,
      frame: "loss",
    }));
    const set1 = shuffle([...gains, ...losses]);
    const set2 = shuffle([...gains, ...losses]);
    const seq = shuffle([...set1, ...set2]);
    const finalSeq = modeDemo ? seq.slice(0, 8) : seq;
    setQueue(finalSeq);
    setIdx(0);
    setLog([]);
    setPhase("run");
  }
  function choose(choice) {
    const item = queue[idx];
    const newLog = [...log, { id: item.id, frame: item.frame, choice }];
    setLog(newLog);
    const next = idx + 1;
    if (next >= queue.length) {
      setPhase("done");
      onFinish && onFinish(computeFraming(newLog));
    } else setIdx(next);
  }
  const item = queue[idx];
  const metrics = useMemo(() => computeFraming(log), [log]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Framing Stability – Consistency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase === "intro" && (
          <div className="space-y-3">
            <p>
              Choose between a sure option and a probabilistic option.
              Gains vs losses with equal EV; items repeat later.
            </p>
            <Button onClick={start}>Start</Button>
          </div>
        )}
        {phase === "run" && item && (
          <div className="space-y-4">
            <div className="text-sm opacity-80">
              Item {idx + 1} / {queue.length}
            </div>
            {item.frame === "gain" ? (
              <div className="space-y-3">
                <div>
                  You can <strong>gain</strong>:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    className="h-20 text-base"
                    onClick={() => choose("sure")}
                  >
                    Sure: +{item.sureGain}
                  </Button>
                  <Button
                    className="h-20 text-base"
                    variant="secondary"
                    onClick={() => choose("gamble")}
                  >
                    Gamble: {Math.round(item.p * 100)}% chance to +
                    {item.gambleGain}, else 0
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  You may <strong>lose</strong>:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    className="h-20 text-base"
                    onClick={() => choose("sure")}
                  >
                    Sure: {item.sureLoss}
                  </Button>
                  <Button
                    className="h-20 text-base"
                    variant="secondary"
                    onClick={() => choose("gamble")}
                  >
                    Gamble: {Math.round(item.p * 100)}% chance to{" "}
                    {item.gambleLoss}, else 0
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        {phase === "done" && (
          <div className="space-y-3">
            <p>Finished! Metrics sent to Dashboard.</p>
            <FramingSummary metrics={metrics} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function computeFraming(log) {
  if (!log.length) return null;
  const byKey = (l) =>
    l.reduce((m, r) => {
      const k = `${r.frame}-${r.id}`;
      (m[k] = m[k] || []).push(r);
      return m;
    }, {});
  const grouped = byKey(log);
  let agree = 0,
    totalPairs = 0;
  Object.values(grouped).forEach((arr) => {
    if (arr.length >= 2) {
      totalPairs++;
      if (arr[0].choice === arr[1].choice) agree++;
    }
  });
  const consistency = totalPairs ? agree / totalPairs : NaN;
  const gainRisks = log.filter(
    (r) => r.frame === "gain" && r.choice === "gamble"
  ).length;
  const lossRisks = log.filter(
    (r) => r.frame === "loss" && r.choice === "gamble"
  ).length;
  const gainTotal = log.filter((r) => r.frame === "gain").length || 1;
  const lossTotal = log.filter((r) => r.frame === "loss").length || 1;
  const propRiskGain = gainRisks / gainTotal;
  const propRiskLoss = lossRisks / lossTotal;
  const amplitude = propRiskLoss - propRiskGain;
  return { consistency, propRiskGain, propRiskLoss, amplitude };
}
function FramingSummary({ metrics }) {
  if (!metrics) return null;
  const data = [
    {
      name: "Risky choice % (Gain)",
      value: Math.round((metrics.propRiskGain || 0) * 100),
    },
    {
      name: "Risky choice % (Loss)",
      value: Math.round((metrics.propRiskLoss || 0) * 100),
    },
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
        Framing amplitude (Loss − Gain risky %):{" "}
        <span className="font-semibold">
          {Number.isFinite(metrics.amplitude)
            ? (metrics.amplitude * 100).toFixed(1) + "%"
            : "-"}
        </span>
        <br />
        Retest consistency:{" "}
        <span className="font-semibold">
          {Number.isFinite(metrics.consistency)
            ? (metrics.consistency * 100).toFixed(1) + "%"
            : "-"}
        </span>
      </div>
    </div>
  );
}

/********************* MID – Monetary Incentive Delay ************************/
function MID({ modeDemo, onFinish }) {
  const totalTrials = modeDemo ? 16 : 60; // demo 更短
  const [phase, setPhase] = useState("intro");
  const [i, setI] = useState(0);
  const [trial, setTrial] = useState(null); // {cond, stage, startTime, deadline}
  const [log, setLog] = useState([]); // {cond, rt, hit}

  const trialRef = useRef(null);
  const timers = useRef([]);

  function clearTimers() {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }
  useEffect(() => () => clearTimers(), []);

  function scheduleNext() {
    if (i >= totalTrials) {
      setPhase("done");
      onFinish && onFinish(computeMID(log));
      return;
    }
    const cond = Math.random() < 0.5 ? "REWARD" : "NEUTRAL";
    const cueStart = performance.now();
    const cue = {
      cond,
      stage: "cue",
      startTime: cueStart,
      deadline: cueStart + 600,
    };
    trialRef.current = cue;
    setTrial(cue);

    timers.current.push(
      setTimeout(() => {
        const isi = 300 + Math.random() * 200;
        const t2 = setTimeout(() => {
          const targetStart = performance.now();
          const window = modeDemo ? 1400 : 1000;
          const target = {
            cond,
            stage: "target",
            startTime: targetStart,
            deadline: targetStart + window,
          };
          trialRef.current = target;
          setTrial(target);

          const missTimer = setTimeout(() => {
            if (trialRef.current === target) {
              setLog((l) => [
                ...l,
                { cond, rt: null, hit: false },
              ]);
              trialRef.current = null;
              setTrial(null);
              setI((x) => x + 1);
              scheduleNext();
            }
          }, window + 10);
          timers.current.push(missTimer);
        }, isi);
        timers.current.push(t2);
      }, 600)
    );
  }

  function commit(now = performance.now()) {
    const t = trialRef.current;
    if (!t || t.stage !== "target") return;
    if (now > t.deadline) return;
    const rt = now - t.startTime;
    setLog((l) => [...l, { cond: t.cond, rt, hit: true }]);
    clearTimers();
    trialRef.current = null;
    setTrial(null);
    setI((x) => x + 1);
    scheduleNext();
  }

  const metrics = useMemo(() => computeMID(log), [log]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>MID – Reward Reactivity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase === "intro" && (
          <div className="space-y-3">
            <p>
              You&apos;ll see a cue (<strong>REWARD</strong> or{" "}
              <strong>NEUTRAL</strong>). When the target appears,{" "}
              <strong>click</strong> as fast as you can.
            </p>
            <Button
              onClick={() => {
                setPhase("run");
                setI(0);
                setLog([]);
                scheduleNext();
              }}
            >
              Start
            </Button>
          </div>
        )}
        {phase === "run" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                Trial {i + 1}/{totalTrials}
              </div>
              <Progress value={100 * i * (1 / totalTrials)} />
            </div>
            <div
              className="h-52 flex items-center justify-center select-none"
              onClick={() => commit()}
            >
              {!trial ? (
                <div className="opacity-40">+</div>
              ) : trial.stage === "cue" ? (
                <div
                  className={`text-4xl font-bold ${
                    trial.cond === "REWARD" ? "text-green-600" : ""
                  }`}
                >
                  {trial.cond}
                </div>
              ) : (
                <div
                  className="w-16 h-16 rounded-full bg-black/80"
                  title="Click now"
                />
              )}
            </div>
            <LiveMIDStats log={log} />
          </div>
        )}
        {phase === "done" && (
          <div className="space-y-3">
            <p>Finished! Metrics sent to Dashboard.</p>
            <MIDSummary metrics={metrics} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function computeMID(log) {
  const r = log.filter((x) => x.cond === "REWARD");
  const n = log.filter((x) => x.cond === "NEUTRAL");
  const rRT = mean(
    r.filter((x) => x.hit && Number.isFinite(x.rt)).map((x) => x.rt)
  );
  const nRT = mean(
    n.filter((x) => x.hit && Number.isFinite(x.rt)).map((x) => x.rt)
  );
  const deltaRT = rRT - nRT; // negative = faster under reward
  const rErr =
    1 - r.filter((x) => x.hit).length / Math.max(1, r.length);
  const nErr =
    1 - n.filter((x) => x.hit).length / Math.max(1, n.length);
  const deltaErr = rErr - nErr; // negative = fewer errors under reward
  const hitRateReward =
    r.filter((x) => x.hit).length / Math.max(1, r.length);
  return {
    rtReward: rRT,
    rtNeutral: nRT,
    deltaRT,
    errReward: rErr,
    errNeutral: nErr,
    deltaErr,
    hitRateReward,
  };
}
function LiveMIDStats({ log }) {
  const r = log.filter((x) => x.cond === "REWARD");
  const n = log.filter((x) => x.cond === "NEUTRAL");
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Hit rate</div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
          <div>Reward</div>
          <div className="text-right tabular-nums">
            {r.length
              ? Math.round(
                  (r.filter((x) => x.hit).length / Math.max(1, r.length)) *
                    100
                )
              : 0}
            %
          </div>
          <div>Neutral</div>
          <div className="text-right tabular-nums">
            {n.length
              ? Math.round(
                  (n.filter((x) => x.hit).length / Math.max(1, n.length)) *
                    100
                )
              : 0}
            %
          </div>
        </div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">RT (ms, hits)</div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
          <div>Reward</div>
          <div className="text-right tabular-nums">
            {Number.isFinite(
              mean(r.filter((x) => x.hit).map((x) => x.rt))
            )
              ? Math.round(
                  mean(r.filter((x) => x.hit).map((x) => x.rt))
                )
              : "-"}
          </div>
          <div>Neutral</div>
          <div className="text-right tabular-nums">
            {Number.isFinite(
              mean(n.filter((x) => x.hit).map((x) => x.rt))
            )
              ? Math.round(
                  mean(n.filter((x) => x.hit).map((x) => x.rt))
                )
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
function MIDSummary({ metrics }) {
  if (!metrics) return null;
  const data = [
    {
      name: "ΔRT (Reward-Neutral)",
      value: metrics.deltaRT || 0,
    },
    { name: "ΔErr (Reward-Neutral)", value: metrics.deltaErr || 0 },
  ];
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/********************* BART – Balloon Analogue Risk Task ************************/
function BART({ modeDemo, onFinish }) {
  const totalBalloons = modeDemo ? 6 : 25;
  const maxBurst = 15;
  const [phase, setPhase] = useState("intro");
  const [idx, setIdx] = useState(0);
  const [pumps, setPumps] = useState(0);
  const [burstPoint, setBurstPoint] = useState(randInt(1, maxBurst));
  const [balloons, setBalloons] = useState([]); // {pumps, burst, banked}

  function start() {
    setPhase("run");
    setIdx(0);
    setPumps(0);
    setBurstPoint(randInt(1, maxBurst));
    setBalloons([]);
  }
  function pump() {
    const next = pumps + 1;
    if (next >= burstPoint) {
      setBalloons((b) => [
        ...b,
        { pumps: next, burst: true, banked: 0 },
      ]);
      nextBalloon();
    } else {
      setPumps(next);
    }
  }
  function bank() {
    setBalloons((b) => [
      ...b,
      { pumps, burst: false, banked: pumps },
    ]);
    nextBalloon();
  }
  function nextBalloon() {
    const ni = idx + 1;
    if (ni >= totalBalloons) {
      setPhase("done");
      onFinish && onFinish(computeBART(balloons.concat([])));
      return;
    }
    setIdx(ni);
    setPumps(0);
    setBurstPoint(randInt(1, maxBurst));
  }

  const metrics = useMemo(() => computeBART(balloons), [balloons]);
  const size = 40 + pumps * 6;

  return (
    <Card>
      <CardHeader>
        <CardTitle>BART – Risk Taking for Reward</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase === "intro" && (
          <div className="space-y-3">
            <p>
              Click <strong>Pump</strong> to inflate and earn points;{" "}
              <strong>Bank</strong> to save. If it bursts, you lose this
              balloon&apos;s points.
            </p>
            <Button onClick={start}>Start</Button>
          </div>
        )}
        {phase === "run" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                Balloon {idx + 1}/{totalBalloons}
              </div>
              <div>
                Total Banked:{" "}
                  <strong>
                    {balloons.reduce((s, b) => s + b.banked, 0)}
                  </strong>
              </div>
            </div>
            <div className="h-52 flex items-center justify-center">
              <div
                style={{
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: "#f87171",
                }}
                title="balloon"
              />
            </div>
            <div className="flex justify-center gap-2">
              <Button onClick={pump}>Pump</Button>
              <Button variant="secondary" onClick={bank}>
                Bank
              </Button>
            </div>
            <LiveBARTStats balloons={balloons} currentPumps={pumps} />
          </div>
        )}
        {phase === "done" && (
          <div className="space-y-3">
            <p>Finished! Metrics sent to Dashboard.</p>
            <BARTSummary metrics={metrics} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function computeBART(balloons) {
  if (!balloons.length) return null;
  const nonBurst = balloons.filter((b) => !b.burst);
  const avgPumpsNonBurst = nonBurst.length
    ? mean(nonBurst.map((b) => b.pumps))
    : NaN;
  const burstRate =
    balloons.filter((b) => b.burst).length / balloons.length;
  const totalEarnings = balloons.reduce((s, b) => s + b.banked, 0);
  if (balloons.length < 4)
    return {
      avgPumpsNonBurst,
      burstRate,
      slope: NaN,
      totalEarnings,
    };
  const half = Math.floor(balloons.length / 2);
  const early = mean(balloons.slice(0, half).map((b) => b.pumps));
  const late = mean(balloons.slice(half).map((b) => b.pumps));
  const slope = late - early;
  return { avgPumpsNonBurst, burstRate, slope, totalEarnings };
}
function LiveBARTStats({ balloons, currentPumps }) {
  const nb = balloons.filter((b) => !b.burst);
  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Current</div>
        <div>
          Pumps:{" "}
          <span className="tabular-nums">
            {currentPumps}
          </span>
        </div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Non-burst avg pumps</div>
        <div className="tabular-nums">
          {Number.isFinite(mean(nb.map((b) => b.pumps)))
            ? mean(nb.map((b) => b.pumps)).toFixed(1)
            : "-"}
        </div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Burst rate</div>
        <div className="tabular-nums">
          {balloons.length
            ? Math.round(
                (balloons.filter((b) => b.burst).length /
                  balloons.length) *
                  100
              )
            : 0}
          %
        </div>
      </div>
    </div>
  );
}
function BARTSummary({ metrics }) {
  if (!metrics) return null;
  const data = [
    {
      name: "Avg pumps (non-burst)",
      value: metrics.avgPumpsNonBurst || 0,
    },
    { name: "Burst rate", value: metrics.burstRate || 0 },
    { name: "Learning slope", value: metrics.slope || 0 },
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
      <div className="mt-2 text-sm">
        Total earnings: <strong>{metrics.totalEarnings}</strong>
      </div>
    </div>
  );
}

/********************* Delay Discounting ************************/
function DelayDiscounting({ modeDemo, onFinish }) {
  const laterAmount = 100;
  const delayDays = 14;
  const trials = modeDemo ? 6 : 12;

  const [phase, setPhase] = useState("intro");
  const [i, setI] = useState(0);
  const [nowAmt, setNowAmt] = useState(50);
  const [hist, setHist] = useState([]); // {now, later, delay, pick}

  function start() {
    setPhase("run");
    setI(0);
    setNowAmt(50);
    setHist([]);
  }
  function choose(pick) {
    const rec = {
      now: nowAmt,
      later: laterAmount,
      delay: delayDays,
      pick,
    };
    const newHist = hist.concat([rec]);
    setHist(newHist);
    if (i + 1 >= trials) {
      const metrics = computeDelay(newHist);
      setPhase("done");
      onFinish && onFinish(metrics);
      return;
    }
    const step = Math.max(
      2,
      Math.round(
        Math.abs(
          nowAmt - laterAmount / (1 + 0.2 * delayDays)
        ) / 3
      )
    );
    const nextNow =
      pick === "later"
        ? Math.min(laterAmount - 1, nowAmt + step)
        : Math.max(1, nowAmt - step);
    setNowAmt(nextNow);
    setI((x) => x + 1);
  }

  const metrics = useMemo(() => computeDelay(hist), [hist]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Delay Discounting – Preference for Immediate Reward
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase === "intro" && (
          <div className="space-y-3">
            <p>
              Choose between receiving <strong>${laterAmount}</strong> in{" "}
              <strong>{delayDays} days</strong> or a smaller amount{" "}
              <strong>today</strong>. The today amount will adapt.
            </p>
            <Button onClick={start}>Start</Button>
          </div>
        )}
        {phase === "run" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                Question {i + 1}/{trials}
              </div>
              <Progress value={100 * (i / trials)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                className="h-20 text-base"
                onClick={() => choose("now")}
              >
                ${nowAmt}{" "}
                <span className="opacity-70">today</span>
              </Button>
              <Button
                className="h-20 text-base"
                variant="secondary"
                onClick={() => choose("later")}
              >
                ${laterAmount}{" "}
                <span className="opacity-70">
                  in {delayDays} days
                </span>
              </Button>
            </div>
            <LiveDelayStats hist={hist} />
          </div>
        )}
        {phase === "done" && (
          <div className="space-y-3">
            <p>Finished! Metrics sent to Dashboard.</p>
            <DelaySummary metrics={metrics} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function computeDelay(hist) {
  if (!hist.length) return null;
  const later = hist[0]?.later ?? 100;
  const delay = hist[0]?.delay ?? 14;
  const lastNow = hist[hist.length - 1].now;
  const A = later;
  const NowStar = lastNow;
  const k = Math.max(
    0,
    (A / Math.max(1, NowStar) - 1) / Math.max(1, delay)
  );
  const choiceNowPct =
    hist.filter((h) => h.pick === "now").length / hist.length;
  let switches = 0;
  for (let i = 1; i < hist.length; i++) {
    if (hist[i].pick !== hist[i - 1].pick) switches++;
  }
  const consistency =
    1 - switches / (hist.length - 1 || 1);
  return { k, choiceNowPct, consistency, NowStar, A, D: delay };
}
function LiveDelayStats({ hist }) {
  const nowPct = hist.length
    ? Math.round(
        (100 *
          hist.filter((h) => h.pick === "now").length) /
          hist.length
      )
    : 0;
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Now choices</div>
        <div className="tabular-nums">{nowPct}%</div>
      </div>
      <div className="p-3 rounded-2xl bg-muted">
        <div className="font-semibold">Questions answered</div>
        <div className="tabular-nums">
          {hist.length}
        </div>
      </div>
    </div>
  );
}
function DelaySummary({ metrics }) {
  if (!metrics) return null;
  const data = [
    { name: "k (hyperbolic)", value: metrics.k || 0 },
    {
      name: "Now choice %",
      value: metrics.choiceNowPct || 0,
    },
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
      <div className="text-sm">
        Consistency:{" "}
        <strong>
          {Number.isFinite(metrics.consistency)
            ? (metrics.consistency * 100).toFixed(0) + "%"
            : "-"}
        </strong>
      </div>
    </div>
  );
}

/********************* Probability Weighting ************************/
const probabilityItemsBase = [
  { id: 1, p: 0.01, sure: 0.5, reward: 100 },
  { id: 2, p: 0.05, sure: 3, reward: 100 },
  { id: 3, p: 0.1, sure: 7, reward: 100 },
  { id: 4, p: 0.2, sure: 16, reward: 100 },
  { id: 5, p: 0.5, sure: 45, reward: 100 },
  { id: 6, p: 0.8, sure: 70, reward: 100 },
  { id: 7, p: 0.95, sure: 85, reward: 100 },
];

function ProbabilityWeightingTask({ onFinish }) {
  const items = probabilityItemsBase;
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState([]); // {id,p,choice}
  const [done, setDone] = useState(false);

  function restart() {
    setIdx(0);
    setLog([]);
    setDone(false);
  }

  function choose(choice) {
    const item = items[idx];
    const newLog = [...log, { id: item.id, p: item.p, choice }];
    setLog(newLog);
    const next = idx + 1;
    if (next >= items.length) {
      const metrics = computeProbabilityWeighting(newLog);
      setDone(true);
      onFinish && onFinish(metrics);
    } else {
      setIdx(next);
    }
  }

  const metrics = useMemo(
    () => computeProbabilityWeighting(log),
    [log]
  );
  const item = items[idx];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Probability Weighting – Small vs Large Probabilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {!done && (
          <>
            <p className="opacity-80">
              Choose between a lottery and a sure amount. All lotteries
              pay <strong>$100</strong> if they win.
            </p>
            <div className="opacity-80">
              Item {idx + 1} / {items.length}
            </div>
            {item && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    className="h-20 text-base"
                    onClick={() => choose("lottery")}
                  >
                    Lottery: {Math.round(item.p * 100)}% chance to win $
                    {item.reward}, else $0
                  </Button>
                  <Button
                    className="h-20 text-base"
                    variant="secondary"
                    onClick={() => choose("sure")}
                  >
                    Sure: ${item.sure}
                  </Button>
                </div>
              </div>
            )}
            <Button variant="secondary" onClick={restart}>
              Restart Task
            </Button>
          </>
        )}
        {done && (
          <>
            <p>Finished! Metrics sent to Dashboard.</p>
            <ProbabilitySummary metrics={metrics} />
            <Button variant="secondary" onClick={restart}>
              Restart Task
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function computeProbabilityWeighting(log) {
  if (!log.length) return null;
  const small = log.filter((r) => r.p <= 0.1);
  const medium = log.filter((r) => r.p > 0.1 && r.p < 0.8);
  const large = log.filter((r) => r.p >= 0.8);

  const lotteryRate = (list) => {
    const n = list.length || 1;
    const k = list.filter((r) => r.choice === "lottery").length;
    return k / n;
  };

  const smallRate = lotteryRate(small);
  const mediumRate = lotteryRate(medium);
  const largeRate = lotteryRate(large);

  const smallAmplification = smallRate - mediumRate;
  const largeUnderweight = mediumRate - largeRate;

  return {
    smallRate,
    mediumRate,
    largeRate,
    smallAmplification,
    largeUnderweight,
    n: log.length,
  };
}

function ProbabilitySummary({ metrics }) {
  if (!metrics) return null;
  const data = [
    { name: "Small p (≤10%)", value: metrics.smallRate || 0 },
    {
      name: "Medium p (10–80%)",
      value: metrics.mediumRate || 0,
    },
    { name: "Large p (≥80%)", value: metrics.largeRate || 0 },
  ];
  return (
    <div className="space-y-4 text-sm">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(v) =>
                `${Math.round((v || 0) * 100)}%`
              }
            />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        Small-probability amplification (lottery% small − medium):{" "}
        <strong>
          {Number.isFinite(metrics.smallAmplification)
            ? (metrics.smallAmplification * 100).toFixed(1) + "%"
            : "-"}
        </strong>
        <br />
        Large-probability underweight (lottery% medium − large):{" "}
        <strong>
          {Number.isFinite(metrics.largeUnderweight)
            ? (metrics.largeUnderweight * 100).toFixed(1) + "%"
            : "-"}
        </strong>
      </div>
    </div>
  );
}

/********************* Confidence Calibration ************************/
const calibrationItemsBase = [
  {
    id: 1,
    label: "S&P 500 total return in 2024 (%)",
    trueValue: 25,
    unit: "%",
    hint: "e.g. -20 to +40",
  },
  {
    id: 2,
    label: "US CPI inflation in 2024 (%)",
    trueValue: 3,
    unit: "%",
    hint: "e.g. 0 to 8",
  },
  {
    id: 3,
    label: "US 10Y Treasury yield at end of 2024 (%)",
    trueValue: 4,
    unit: "%",
    hint: "e.g. 1 to 8",
  },
  {
    id: 4,
    label: "S&P 500 total return in 2022 (%)",
    trueValue: -18,
    unit: "%",
    hint: "e.g. -40 to +20",
  },
];

function CalibrationTask({ onFinish }) {
  const items = calibrationItemsBase;
  const [answers, setAnswers] = useState(() =>
    items.reduce(
      (acc, it) => ({
        ...acc,
        [it.id]: { lower: "", upper: "" },
      }),
      {}
    )
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers(
      items.reduce(
        (acc, it) => ({
          ...acc,
          [it.id]: { lower: "", upper: "" },
        }),
        {}
      )
    );
    setSubmitted(false);
  }, [items]);

  function handleChange(id, field, value) {
    setAnswers((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  function restart() {
    setAnswers(
      items.reduce(
        (acc, it) => ({
          ...acc,
          [it.id]: { lower: "", upper: "" },
        }),
        {}
      )
    );
    setSubmitted(false);
  }

  function handleSubmit() {
    const metrics = computeCalibration(items, answers);
    setSubmitted(true);
    onFinish && onFinish(metrics);
  }

  const metrics = useMemo(
    () => computeCalibration(items, answers),
    [items, answers]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence Calibration – 90% Intervals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p>
          For each question, give a{" "}
          <strong>90% confidence interval</strong>. Intervals can be
          wide; goal is that about 90% contain the true value.
        </p>
        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                padding: "10px",
                borderRadius: "8px",
                background: "#f9fafb",
              }}
            >
              <div className="mb-1 font-medium">{it.label}</div>
              <div className="mb-1 text-xs opacity-70">
                Hint: {it.hint}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <span>Lower:</span>
                <input
                  type="number"
                  value={answers[it.id]?.lower ?? ""}
                  onChange={(e) =>
                    handleChange(it.id, "lower", e.target.value)
                  }
                  style={{
                    width: "80px",
                    padding: "4px 6px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
                <span>{it.unit}</span>
                <span style={{ marginLeft: "12px" }}>Upper:</span>
                <input
                  type="number"
                  value={answers[it.id]?.upper ?? ""}
                  onChange={(e) =>
                    handleChange(it.id, "upper", e.target.value)
                  }
                  style={{
                    width: "80px",
                    padding: "4px 6px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
                <span>{it.unit}</span>
                {submitted && (
                  <span
                    style={{
                      marginLeft: "12px",
                      fontSize: "12px",
                      opacity: 0.8,
                    }}
                  >
                    True: {it.trueValue}
                    {it.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {!submitted && (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={handleSubmit}>Submit</Button>
            <Button variant="secondary" onClick={restart}>
              Restart Task
            </Button>
          </div>
        )}
        {submitted && (
          <>
            <CalibrationSummary metrics={metrics} />
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <Button variant="secondary" onClick={restart}>
                Restart Task
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function computeCalibration(items, answers) {
  if (!items.length) return null;
  const perItem = items.map((it) => {
    const ans = answers[it.id] || {};
    const lower = safeNumber(ans.lower);
    const upper = safeNumber(ans.upper);
    const tv = it.trueValue;
    const width =
      Number.isFinite(lower) && Number.isFinite(upper)
        ? Math.abs(upper - lower)
        : NaN;
    const hit =
      Number.isFinite(lower) &&
      Number.isFinite(upper) &&
      lower <= tv &&
      tv <= upper;
    return {
      id: it.id,
      label: it.label,
      lower,
      upper,
      trueValue: tv,
      width,
      hit,
    };
  });
  const valid = perItem.filter(
    (x) => Number.isFinite(x.lower) && Number.isFinite(x.upper)
  );
  const n = valid.length || 1;
  const hits = valid.filter((x) => x.hit).length;
  const hitRate = hits / n;
  const meanWidth = mean(valid.map((x) => x.width));
  const overconfidence = 0.9 - hitRate;
  return { perItem, hitRate, meanWidth, overconfidence };
}

function CalibrationSummary({ metrics }) {
  if (!metrics) return null;
  const { hitRate, meanWidth, overconfidence } = metrics;
  return (
    <div className="space-y-2 text-sm mt-4">
      <div>
        Hit rate (true inside your 90% intervals):{" "}
        <strong>
          {Number.isFinite(hitRate)
            ? (hitRate * 100).toFixed(1) + "%"
            : "-"}
        </strong>
      </div>
      <div>
        Overconfidence index (90% − hit rate):{" "}
        <strong>
          {Number.isFinite(overconfidence)
            ? (overconfidence * 100).toFixed(1) + " pp"
            : "-"}
        </strong>
      </div>
      <div>
        Average interval width:{" "}
        <strong>
          {Number.isFinite(meanWidth)
            ? meanWidth.toFixed(1)
            : "-"}
        </strong>
      </div>
    </div>
  );
}

/********************* Anchoring & Experience Recall ************************/
const ANCHOR_TRUE = {
  best: 37,
  worst: -37,
  avg: 11,
};

function AnchoringTask({ onFinish }) {
  const [phase, setPhase] = useState("intro");
  const [round1, setRound1] = useState({
    best: "",
    worst: "",
    avg: "",
  });
  const [round2, setRound2] = useState({
    best: "",
    worst: "",
    avg: "",
  });

  function restart() {
    setPhase("intro");
    setRound1({ best: "", worst: "", avg: "" });
    setRound2({ best: "", worst: "", avg: "" });
  }

  function finishRound2() {
    const m = computeAnchoringMetrics(round1, round2, ANCHOR_TRUE);
    setPhase("done");
    onFinish && onFinish(m);
  }

  const metrics = useMemo(
    () => computeAnchoringMetrics(round1, round2, ANCHOR_TRUE),
    [round1, round2]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anchoring & Experience Recall</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {phase === "intro" && (
          <>
            <p>
              First, report the best/worst/average stock market years
              you remember. Then we show approximate history and ask
              again. We measure how strongly memories anchor your
              expectations.
            </p>
            <Button onClick={() => setPhase("round1")}>
              Start Round 1
            </Button>
          </>
        )}

        {phase === "round1" && (
          <>
            <p className="opacity-80">
              Based on your own memory (no need to be precise):
            </p>
            <AnchoringRoundInputs
              title="Round 1 – Memory"
              state={round1}
              setState={setRound1}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <Button onClick={() => setPhase("info")}>
                Next
              </Button>
              <Button variant="secondary" onClick={restart}>
                Restart
              </Button>
            </div>
          </>
        )}

        {phase === "info" && (
          <>
            <p className="opacity-80">
              Approximate S&amp;P 500 annual total returns (last ~50
              years):
            </p>
            <ul className="list-disc pl-4">
              <li>Best year: about +37%</li>
              <li>Worst year: about -37%</li>
              <li>Most years fall between -10% and +20%</li>
              <li>Long-term average: about 11% per year</li>
            </ul>
            <div style={{ marginTop: "8px" }}>
              <img
                src="/sp500_hist.png"
                alt="Historical S&P 500 returns"
                style={{
                  maxWidth: "100%",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              <Button onClick={() => setPhase("round2")}>
                Continue to Round 2
              </Button>
              <Button variant="secondary" onClick={restart}>
                Restart
              </Button>
            </div>
          </>
        )}

        {phase === "round2" && (
          <>
            <p className="opacity-80">
              Now, after seeing the historical range, how would you set
              these planning anchors?
            </p>
            <AnchoringRoundInputs
              title="Round 2 – Planning Anchor"
              state={round2}
              setState={setRound2}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <Button onClick={finishRound2}>Finish</Button>
              <Button variant="secondary" onClick={restart}>
                Restart
              </Button>
            </div>
          </>
        )}

        {phase === "done" && (
          <>
            <p>Finished! Metrics sent to Dashboard.</p>
            <AnchoringSummary
              round1={round1}
              round2={round2}
              metrics={metrics}
            />
            <div style={{ marginTop: "8px" }}>
              <Button variant="secondary" onClick={restart}>
                Restart
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AnchoringRoundInputs({ title, state, setState }) {
  function change(field, value) {
    setState((prev) => ({ ...prev, [field]: value }));
  }
  return (
    <div
      style={{
        padding: "10px",
        borderRadius: "8px",
        background: "#f9fafb",
        marginTop: "6px",
      }}
    >
      <div className="font-semibold mb-2">{title}</div>
      <div className="space-y-2">
        <AnchoringInputRow
          label="Best year return you remember (%)"
          value={state.best}
          onChange={(v) => change("best", v)}
        />
        <AnchoringInputRow
          label="Worst year return you remember (%)"
          value={state.worst}
          onChange={(v) => change("worst", v)}
        />
        <AnchoringInputRow
          label="Average annual return you believe (%)"
          value={state.avg}
          onChange={(v) => change("avg", v)}
        />
      </div>
    </div>
  );
}

function AnchoringInputRow({ label, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <span style={{ minWidth: "200px" }}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "80px",
          padding: "4px 6px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />
      <span>%</span>
    </div>
  );
}

function computeAnchoringMetrics(round1, round2, truth) {
  const r1 = {
    best: safeNumber(round1.best),
    worst: safeNumber(round1.worst),
    avg: safeNumber(round1.avg),
  };
  const r2 = {
    best: safeNumber(round2.best),
    worst: safeNumber(round2.worst),
    avg: safeNumber(round2.avg),
  };
  const t = truth || ANCHOR_TRUE;

  const bias = (v, tv) => (Number.isFinite(v) ? v - tv : NaN);

  const bias1 = {
    best: bias(r1.best, t.best),
    worst: bias(r1.worst, t.worst),
    avg: bias(r1.avg, t.avg),
  };
  const bias2 = {
    best: bias(r2.best, t.best),
    worst: bias(r2.worst, t.worst),
    avg: bias(r2.avg, t.avg),
  };
  const adjustment = {
    best:
      Number.isFinite(r1.best) && Number.isFinite(r2.best)
        ? r2.best - r1.best
        : NaN,
    worst:
      Number.isFinite(r1.worst) && Number.isFinite(r2.worst)
        ? r2.worst - r1.worst
        : NaN,
    avg:
      Number.isFinite(r1.avg) && Number.isFinite(r2.avg)
        ? r2.avg - r1.avg
        : NaN,
  };

  function rigidityComponent(r1v, r2v, tv) {
    if (!Number.isFinite(r1v) || !Number.isFinite(r2v)) return NaN;
    const d1 = Math.abs(r1v - tv);
    const d2 = Math.abs(r2v - tv);
    if (d1 === 0) return NaN;
    return 1 - d2 / d1;
  }

  const rigBest = rigidityComponent(r1.best, r2.best, t.best);
  const rigWorst = rigidityComponent(r1.worst, r2.worst, t.worst);
  const rigAvg = rigidityComponent(r1.avg, r2.avg, t.avg);
  const rigidity = mean(
    [rigBest, rigWorst, rigAvg].filter(Number.isFinite)
  );

  return {
    round1: r1,
    round2: r2,
    truth: t,
    biasRound1: bias1,
    biasRound2: bias2,
    adjustment,
    rigidity,
  };
}

function AnchoringSummary({ round1, round2, metrics }) {
  if (!metrics) return null;
  const { truth, adjustment, rigidity } = metrics;
  const rows = [
    { key: "best", label: "Best year" },
    { key: "worst", label: "Worst year" },
    { key: "avg", label: "Average" },
  ];
  return (
    <div className="space-y-3 text-sm mt-3">
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Metric</th>
            <th>Round 1</th>
            <th>Round 2</th>
            <th>True</th>
            <th>Adjustment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.label}</td>
              <td>
                {round1[r.key] !== "" ? `${round1[r.key]}%` : "-"}
              </td>
              <td>
                {round2[r.key] !== "" ? `${round2[r.key]}%` : "-"}
              </td>
              <td>{truth[r.key]}%</td>
              <td>
                {Number.isFinite(adjustment[r.key])
                  ? `${adjustment[r.key].toFixed(1)} pp`
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        Average movement toward historical truth (rigidity index):{" "}
        <strong>
          {Number.isFinite(rigidity)
            ? (rigidity * 100).toFixed(1) + " pp"
            : "-"}
        </strong>
      </div>
    </div>
  );
}

/********************* Dashboard ************************/
/* norm tool; scale every indicator value to 0–1, then *100 for radar chart */
function norm(value, maxAbs) {
  if (!Number.isFinite(value)) return 0;
  if (!Number.isFinite(maxAbs) || maxAbs <= 0) return 0;
  const v = value / maxAbs;
  return Math.max(0, Math.min(1, v));
}
function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function Dashboard({ results }) {
  const {
    go,
    stroop,
    framing,
    mid,
    bart,
    delay,
    probability,
    calibration,
    anchoring,
  } = results;

  const ready =
    go ||
    stroop ||
    framing ||
    mid ||
    bart ||
    delay ||
    probability ||
    calibration ||
    anchoring;

  // ---------- analysis card, text ----------
  const advisory = [];
  if (go) {
    advisory.push({
      title: "Impulse control",
      tip: "Use pre-commitment & default position limits; avoid hot-state, FOMO-driven trades.",
      flag:
        go.inhErrRate > 0.15 ||
        go.cv > 0.35 ||
        go.fatigue > 0.05,
    });
  }
  if (stroop) {
    advisory.push({
      title: "Interference control",
      tip: "Lead with cold data (probabilities, drawdowns) before narratives or stories.",
      flag:
        (stroop.costRT || 0) > 120 ||
        (stroop.costErr || 0) > 0.05,
    });
  }
  if (framing) {
    advisory.push({
      title: "Framing stability",
      tip: "Standardize scales/units and minimize unnecessary reframing of equivalent choices.",
      flag:
        (framing.amplitude || 0) > 0.2 ||
        (1 - (framing.consistency || 1)) > 0.25,
    });
  }
  if (mid) {
    advisory.push({
      title: "Reward reactivity",
      tip: "Replace 'maximum return' language with ranges, scenario trees, and drawdown views.",
      flag:
        (mid.deltaRT || 0) < -60 ||
        (mid.deltaErr || 0) < -0.03,
    });
  }
  if (bart) {
    advisory.push({
      title: "Reward-driven risk",
      tip: "Set explicit drawdown thresholds, auto-rebalancing rules, and use small 'test' positions.",
      flag:
        (bart.avgPumpsNonBurst || 0) > 8 &&
        (bart.burstRate || 0) > 0.35 &&
        (!Number.isFinite(bart.slope) || bart.slope <= 0),
    });
  }
  if (delay) {
    advisory.push({
      title: "Short-horizon preference",
      tip: "Use bucket strategies separating short-, mid-, and long-term capital to protect long horizon.",
      flag:
        (delay.k || 0) > 0.02 ||
        (delay.choiceNowPct || 0) > 0.5,
    });
  }
  if (probability) {
    advisory.push({
      title: "Probability weighting",
      tip: "De-emphasize lottery-like products; visualize full probability distributions of outcomes.",
      flag:
        (probability.smallAmplification || 0) > 0.15 ||
        (probability.largeUnderweight || 0) > 0.15,
    });
  }
  if (calibration) {
    advisory.push({
      title: "Over/under-confidence",
      tip: "Benchmark beliefs vs. history; use guardrails and scenario probabilities instead of point views.",
      flag:
        (calibration.overconfidence || 0) > 0.15 ||
        (calibration.hitRate || 0) < 0.6,
    });
  }
  if (anchoring) {
    advisory.push({
      title: "Anchoring on past episodes",
      tip: "Frame plans around the full return distribution, not a single memorable boom or bust year.",
      flag: (anchoring.rigidity || 0) < 0.3,
    });
  }

  // ---------- radar chart eight dimensions ----------
  const radarData = [];

  if (go) {
    const inh = norm(go.inhErrRate || 0, 0.3);
    const omiss = norm(go.omissRate || 0, 0.3);
    const cv = norm(go.cv || 0, 0.6);
    const fatigue = norm((go.fatigue || 0) + 0.2, 0.4);
    const score = clamp01((inh + omiss + cv + fatigue) / 4) * 100;
    radarData.push({
      dimension: "Impulse Control Load",
      value: score,
    });
  }
  if (stroop) {
    const costRT = norm(Math.max(stroop.costRT || 0, 0), 300);
    const costErr = norm(stroop.costErr || 0, 0.2);
    const score = clamp01((costRT + costErr) / 2) * 100;
    radarData.push({
      dimension: "Interference Load",
      value: score,
    });
  }
  if (framing) {
    const amp = norm(Math.abs(framing.amplitude || 0), 0.5);
    const instab = norm(1 - (framing.consistency || 1), 0.5);
    const score = clamp01(0.7 * amp + 0.3 * instab) * 100;
    radarData.push({
      dimension: "Framing Susceptibility",
      value: score,
    });
  }
  if (mid) {
    const rtBoost = norm(Math.max(-(mid.deltaRT || 0), 0), 150);
    const errBoost = norm(Math.max(-(mid.deltaErr || 0), 0), 0.1);
    const score = clamp01((rtBoost + errBoost) / 2) * 100;
    radarData.push({
      dimension: "Reward Reactivity",
      value: score,
    });
  }
  if (bart) {
    const avgPumps = norm(bart.avgPumpsNonBurst || 0, 10);
    const burst = norm(bart.burstRate || 0, 0.6);
    const noLearning = norm(Math.max(-(bart.slope || 0), 0), 4);
    const score = clamp01((avgPumps + burst + noLearning) / 3) * 100;
    radarData.push({
      dimension: "Reward-Driven Risk",
      value: score,
    });
  }
  if (delay) {
    const kScore = norm(delay.k || 0, 0.03);
    const nowScore = delay.choiceNowPct || 0;
    const score = clamp01(0.6 * kScore + 0.4 * nowScore) * 100;
    radarData.push({
      dimension: "Present Bias",
      value: score,
    });
  }
  if (probability) {
    const smallAmp = norm(
      Math.abs(probability.smallAmplification || 0),
      0.4
    );
    const largeUnder = norm(
      Math.abs(probability.largeUnderweight || 0),
      0.4
    );
    const score = clamp01((smallAmp + largeUnder) / 2) * 100;
    radarData.push({
      dimension: "Probability Distortion",
      value: score,
    });
  }
  if (calibration || anchoring) {
    const over = calibration
      ? norm(calibration.overconfidence || 0, 0.3)
      : 0;
    const hitGap = calibration
      ? norm(0.9 - (calibration.hitRate || 0), 0.3)
      : 0;
    const rigidGap = anchoring
      ? norm(1 - (anchoring.rigidity || 0), 0.7)
      : 0;
    const score = clamp01((over + hitGap + rigidGap) / 3) * 100;
    radarData.push({
      dimension: "Overconfidence / Anchoring",
      value: score,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!ready && (
          <p className="opacity-70">
            Run any task to see results.
          </p>
        )}

        {ready && (
          <>
            {/* 1. Top: Radar Chart */}
            {radarData.length > 0 && (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Profile"
                      dataKey="value"
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 2. Analysis Advisory Cards */}
            {advisory.length > 0 && (
              <div className="grid md:grid-cols-3 gap-3">
                {advisory.map((a, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl ${
                      a.flag
                        ? "bg-amber-100 border border-amber-300"
                        : "bg-muted"
                    }`}
                  >
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-sm mt-1">{a.tip}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Raw JSON Download */}
            <RawJSON results={results} />

            {/* 4. Below: Display results charts/tables for 9 tasks */}
            <div className="space-y-8 mt-4">
              {go && (
                <section>
                  <h3 className="font-semibold mb-2">
                    Go/No-Go – Impulse Inhibition
                  </h3>
                  <GoNoGoSummary metrics={go} />
                </section>
              )}

              {stroop && (
                <section>
                  <h3 className="font-semibold mb-2">
                    Stroop – Interference Control
                  </h3>
                  <StroopSummary metrics={stroop} />
                </section>
              )}

              {framing && (
                <section>
                  <h3 className="font-semibold mb-2">
                    Framing – Gain vs Loss Framing
                  </h3>
                  <FramingSummary metrics={framing} />
                </section>
              )}

              {mid && (
                <section>
                  <h3 className="font-semibold mb-2">
                    MID – Reward Reactivity
                  </h3>
                  <MIDSummary metrics={mid} />
                </section>
              )}

              {bart && (
                <section>
                  <h3 className="font-semibold mb-2">
                    BART – Balloon Analogue Risk Task
                  </h3>
                  <BARTSummary metrics={bart} />
                </section>
              )}

              {delay && (
                <section>
                  <h3 className="font-semibold mb-2">
                    Delay Discounting – Present Bias
                  </h3>
                  <DelaySummary metrics={delay} />
                </section>
              )}

              {probability && (
                <section>
                  <h3 className="font-semibold mb-2">
                    Probability Weighting – Small vs Large p
                  </h3>
                  <ProbabilitySummary metrics={probability} />
                </section>
              )}

              {calibration && (
                <section>
                  <h3 className="font-semibold mb-2">
                    Confidence Calibration – 90% Intervals
                  </h3>
                  <CalibrationSummary metrics={calibration} />
                </section>
              )}

              {anchoring && (
                <section>
                  <h3 className="font-semibold mb-2">
                    Anchoring & Experience Recall
                  </h3>
                  <AnchoringSummary
                    round1={anchoring.round1}
                    round2={anchoring.round2}
                    metrics={anchoring}
                  />
                </section>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RawJSON({ results }) {
  const json = JSON.stringify(results, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  return (
    <div className="text-sm">
      <div className="font-semibold mb-2">
        Raw results (downloadable)
      </div>
      <a
        className="underline"
        href={url}
        download={`cognitive_results_${Date.now()}.json`}
      >
        Download JSON
      </a>
    </div>
  );
}
