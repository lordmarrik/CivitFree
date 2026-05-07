import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { cloudFallbackProfile, defaultBackendProfile } from './services/comfyClient.js';
import './styles.css';

const screens = [
  { id: 'generate', label: 'A', title: 'Generation', subtitle: 'Text → Image controls' },
  { id: 'queue', label: 'B', title: 'Queue', subtitle: 'Runs and prompt history' },
  { id: 'feed', label: 'C', title: 'All images', subtitle: 'Flat personal image feed' },
  { id: 'editor', label: 'D', title: 'Inpaint editor', subtitle: 'Inpaint · Outpaint · Variations' }
];

const mockRuns = [
  { seed: 281944, prompt: 'portrait of a wanderer in neon rain, cinematic rim light', status: 'complete' },
  { seed: 918203, prompt: 'cozy cabin interior, volumetric morning light, painterly detail', status: 'queued' },
  { seed: 447102, prompt: 'macro crystal flower, dark botanical background', status: 'running' }
];

function App() {
  const [screen, setScreen] = useState('generate');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [loraOpen, setLoraOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [backendOpen, setBackendOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [backend, setBackend] = useState(defaultBackendProfile);
  const [qty, setQty] = useState(2);
  const [prompt, setPrompt] = useState('cinematic portrait, local-first workflow, soft purple rim light');
  return (
    <main className="app-shell">
      <section className="intro-panel">
        <p className="eyebrow">CivitFree Personal</p>
        <h1>Runnable personal scaffold</h1>
        <p>
          This is the first Vite + React pass: four personal screens, local shell interactions,
          and a stubbed ComfyUI boundary ready for real workflow wiring.
        </p>
        <div className="acceptance-list">
          <span>React app scaffold</span>
          <span>Personal-only scope</span>
          <span>ComfyUI stubs</span>
        </div>
      </section>

      <section className="phone" aria-label="CivitFree Personal mobile mockup">
        <StatusBar />
        <TopBar onMenu={() => setDrawerOpen(true)} />
        <ScreenTabs active={screen} onSelect={setScreen} />
        <div className="phone-body">
          {screen === 'generate' && (
            <GenerationScreen
              prompt={prompt}
              setPrompt={setPrompt}
              qty={qty}
              setQty={setQty}
              onModel={() => setModelOpen(true)}
              onLora={() => setLoraOpen(true)}
            />
          )}
          {screen === 'queue' && <QueueScreen onActions={() => setActionsOpen(true)} />}
          {screen === 'feed' && <FeedScreen onActions={() => setActionsOpen(true)} />}
          {screen === 'editor' && <EditorScreen />}
        </div>
        <Dock
          backend={backend}
          qty={qty}
          setQty={setQty}
          onBackend={() => setBackendOpen(true)}
        />
      </section>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onOnboarding={() => setOnboardingOpen(true)} />
      <Sheet title="Model library" open={modelOpen} onClose={() => setModelOpen(false)}>
        <Option title="dreamshaperXL_local.safetensors" meta="checkpoint · local" active />
        <Option title="juggernautXL_v9.safetensors" meta="checkpoint · local" />
        <Option title="Scan ComfyUI models" meta="stubbed client boundary" />
      </Sheet>
      <Sheet title="LoRA manager" open={loraOpen} onClose={() => setLoraOpen(false)}>
        <Option title="cinematic-lighting" meta="strength 0.65" active />
        <Option title="detail-enhancer" meta="strength 0.35" />
        <Option title="Browse local LoRAs" meta="stubbed client boundary" />
      </Sheet>
      <Sheet title="Image actions" open={actionsOpen} onClose={() => setActionsOpen(false)}>
        <Option title="Remix" meta="open generation with prompt" />
        <Option title="Remix with seed" meta="keep seed and settings" />
        <Option title="Send to inpaint" meta="open Screen D" />
        <Option title="Download" meta="personal batch-safe action" />
      </Sheet>
      <Sheet title="Backend" open={backendOpen} onClose={() => setBackendOpen(false)}>
        <button className="option" onClick={() => setBackend(defaultBackendProfile)}>
          <strong>{defaultBackendProfile.label}</strong>
          <span>{defaultBackendProfile.gpu} · {defaultBackendProfile.baseUrl}</span>
        </button>
        <button className="option" onClick={() => setBackend(cloudFallbackProfile)}>
          <strong>{cloudFallbackProfile.label}</strong>
          <span>{cloudFallbackProfile.gpu} · heavier jobs</span>
        </button>
      </Sheet>
      <Sheet title="First-run setup" open={onboardingOpen} onClose={() => setOnboardingOpen(false)}>
        <Option title="Connect to ComfyUI" meta="testConnection() stub" />
        <Option title="Scan checkpoints" meta="listCheckpoints() stub" />
        <Option title="Scan LoRAs" meta="listLoras() stub" />
      </Sheet>
    </main>
  );
}

function StatusBar() {
  return <div className="status"><span>9:41</span><span>local · idle · 92%</span></div>;
}

function TopBar({ onMenu }) {
  return (
    <header className="topbar">
      <button className="logo" onClick={onMenu} aria-label="Open menu">☰</button>
      <strong>CivitFree <span>local</span></strong>
      <nav><button>✦</button><button>◷</button><button>▦</button></nav>
    </header>
  );
}

function ScreenTabs({ active, onSelect }) {
  return (
    <div className="screen-tabs">
      {screens.map((item) => (
        <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => onSelect(item.id)}>
          <b>{item.label}</b><span>{item.title}</span>
        </button>
      ))}
    </div>
  );
}

function GenerationScreen({ prompt, setPrompt, qty, setQty, onModel, onLora }) {
  return (
    <div className="stack">
      <div className="mode-row"><span>Local pipeline</span><code>ComfyUI · CUDA</code></div>
      <div className="tabs"><button className="active">Text → Image</button><button>Img → Img</button><button>Inpaint</button><button>Upscale</button></div>
      <label className="field">
        <span>Prompt</span>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} />
        <small>Enter inserts a newline. Generate is only the dock button.</small>
      </label>
      <div className="grid-two">
        <button className="card-button" onClick={onModel}><b>Model</b><span>dreamshaperXL_local</span></button>
        <button className="card-button" onClick={onLora}><b>LoRAs</b><span>2 loaded · add more</span></button>
      </div>
      <div className="setting-card"><span>QTY</span><Stepper value={qty} setValue={setQty} min={1} max={9999} /></div>
    </div>
  );
}

function QueueScreen({ onActions }) {
  return <div className="stack">{mockRuns.map((run) => <RunCard key={run.seed} run={run} onActions={onActions} />)}</div>;
}

function FeedScreen({ onActions }) {
  return (
    <div className="feed-grid">
      {mockRuns.concat(mockRuns).map((run, index) => <ImageTile key={`${run.seed}-${index}`} seed={run.seed + index} onActions={onActions} />)}
    </div>
  );
}

function EditorScreen() {
  return (
    <div className="stack">
      <div className="tabs"><button className="active">Inpaint</button><button>Outpaint</button><button>Variations</button></div>
      <div className="canvas-card"><div className="mask-shape" /><span>Paint mask preview</span></div>
      <div className="setting-card"><span>Brush size</span><input type="range" defaultValue="54" /></div>
      <div className="setting-card"><span>Denoise</span><input type="range" defaultValue="62" /></div>
    </div>
  );
}

function RunCard({ run, onActions }) {
  return (
    <article className="run-card">
      <ImageTile seed={run.seed} onActions={onActions} />
      <div><strong>{run.status}</strong><p>{run.prompt}</p><code>seed {run.seed}</code></div>
    </article>
  );
}

function ImageTile({ seed, onActions }) {
  return <button className="image-tile" onClick={onActions} style={{ '--hue': seed % 360 }} aria-label="Open image actions"><span>⋮</span></button>;
}

function Stepper({ value, setValue, min, max }) {
  return (
    <div className="stepper">
      <button onClick={() => setValue(Math.max(min, value - 1))}>−</button>
      <strong>{value}</strong>
      <button onClick={() => setValue(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

function Dock({ backend, qty, setQty, onBackend }) {
  return (
    <footer className="dock">
      <button className="backend" onClick={onBackend}><span>{backend.label}</span><code>{backend.gpu} · idle</code></button>
      <div className="dock-actions"><Stepper value={qty} setValue={setQty} min={1} max={9999} /><button className="generate">Generate</button></div>
    </footer>
  );
}

function Drawer({ open, onClose, onOnboarding }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <h2>CivitFree Personal</h2>
        <button>Settings</button><button>Model Library</button><button>LoRA Manager</button><button onClick={() => { onOnboarding(); onClose(); }}>Backend setup</button><button>About</button>
      </aside>
    </div>
  );
}

function Sheet({ title, open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <section className="sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-head"><h2>{title}</h2><button onClick={onClose}>Close</button></div>
        {children}
      </section>
    </div>
  );
}

function Option({ title, meta, active }) {
  return <div className={`option ${active ? 'active' : ''}`}><strong>{title}</strong><span>{meta}</span></div>;
}

createRoot(document.getElementById('root')).render(<App />);
