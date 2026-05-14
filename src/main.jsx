/* eslint-disable react-refresh/only-export-components -- Entry file owns App and does not export refreshable components. */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { VariantPersonalClassic } from './screens/Generation.jsx';
import { VariantPersonalQueue, VariantPersonalFeed } from './screens/QueueAndFeed.jsx';
import { VariantPersonalInpaint } from './screens/Inpaint.jsx';
import { OnboardingFlow } from './screens/Onboarding.jsx';
import { usePersisted } from './shared/usePersisted.js';
import { displaySampler, displayScheduler } from './services/samplerMap.js';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import './styles.css';

const screens = [
  { id: 'brush', label: 'A', title: 'Generate' },
  { id: 'clock', label: 'B', title: 'Queue' },
  { id: 'grid', label: 'C', title: 'Feed' },
  { id: 'inpaint', label: 'D', title: 'Inpaint' },
];

const DEFAULT_MODEL = {
  name: 'HomoSimile XL',
  ver: 'v4.0',
  size: '6.4 GB',
  base: 'SDXL',
};


function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function filenameLabel(filename) {
  return String(filename || '')
    .split(/[\\/]/)
    .pop()
    .replace(/\.(safetensors|ckpt|pt)$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

const DEFAULT_SETTINGS = {
  backendProfile: 'local',
  backendUrl: '',
  defaultModelName: '',
  checkpointFilename: '',
  sampler: 'Euler a',
  scheduler: 'Normal',
  steps: 30,
  cfg: 7,
  size: '832×1216',
  cloudGpuKey: '',
  civitaiKey: '',
  pcSavePath: '',
  phoneSavePath: '',
};

function App() {
  const [screen, setScreen] = useState('brush');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [inpaintSource, setInpaintSource] = useState(null);

  const [prompt, setPrompt] = usePersisted('prompt', '');
  const [negativePrompt, setNegativePrompt] = usePersisted('negativePrompt', '');
  const [loras, setLoras] = usePersisted('loras', []);
  const [model, setModel] = usePersisted('model', DEFAULT_MODEL);
  const [settings, setSettings] = usePersisted('settings', DEFAULT_SETTINGS);
  const [pendingSeed, setPendingSeed] = useState(null);
  const [pendingRemix, setPendingRemix] = useState(null);

  const handleTab = (key) => {
    if (key === 'brush' || key === 'clock' || key === 'grid') setScreen(key);
  };

  const addLora = (lora) => {
    setLoras(prev => {
      if (prev.some(l => l.id === lora.id)) return prev;
      return [...prev, { ...lora, strength: lora.strength ?? 0.8, filename: lora.filename ?? '' }];
    });
  };
  const updateLora = (id, patch) => {
    setLoras(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  };
  const removeLora = (id) => {
    setLoras(prev => prev.filter(l => l.id !== id));
  };

  const updateSettings = (patch) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  // ModelPicker / Onboarding emit { name, ver, size, base, filename }.
  // Persist the model AND mirror filename into settings.checkpointFilename
  // so the workflow builder always has a real checkpoint to use.
  const updateModel = (m) => {
    setModel(m);
    if (m?.filename) {
      setSettings(prev => ({ ...prev, checkpointFilename: m.filename }));
    }
  };

  const remix = (payload = {}) => {
    if (typeof payload.prompt === 'string') setPrompt(payload.prompt);
    if (typeof payload.negPrompt === 'string') setNegativePrompt(payload.negPrompt);

    const remixLoras = Array.isArray(payload.loras)
      ? payload.loras
      : Array.isArray(payload.loraNames)
        ? payload.loraNames.map(name => ({ name }))
        : Array.isArray(payload.resourceNames)
          ? payload.resourceNames.map(name => ({ name }))
          : null;
    if (remixLoras) {
      setLoras(remixLoras.map((lora, index) => {
        const filename = typeof lora === 'string' ? lora : lora?.filename ?? lora?.name ?? '';
        const strength = finiteNumber(lora?.strength) ?? finiteNumber(lora?.strengthModel) ?? 0.8;
        return {
          id: `remix-lora-${index}-${filename}`,
          name: filenameLabel(filename) || filename,
          filename,
          strength,
        };
      }));
    }

    const nextSettings = {};
    if (payload.checkpoint) nextSettings.checkpointFilename = payload.checkpoint;
    if (payload.sampler) nextSettings.sampler = displaySampler(payload.sampler, payload.scheduler);
    if (payload.scheduler) nextSettings.scheduler = displayScheduler(payload.scheduler);
    if (finiteNumber(payload.cfg) !== undefined && payload.cfg > 0) nextSettings.cfg = payload.cfg;
    if (finiteNumber(payload.steps) !== undefined && payload.steps > 0) nextSettings.steps = payload.steps;
    if (finiteNumber(payload.width) !== undefined && payload.width > 0 && finiteNumber(payload.height) !== undefined && payload.height > 0) {
      nextSettings.size = `${payload.width}×${payload.height}`;
    }
    if (Object.keys(nextSettings).length > 0) updateSettings(nextSettings);

    if (payload.checkpoint) {
      setModel(prev => ({
        ...(prev || DEFAULT_MODEL),
        name: filenameLabel(payload.checkpoint) || payload.checkpoint,
        filename: payload.checkpoint,
      }));
    }

    const remixSeed = finiteNumber(payload.seed);
    setPendingSeed(remixSeed ?? null);
    setPendingRemix({ ...payload, seed: remixSeed, nonce: Date.now() });
    setScreen('brush');
  };
  const consumePendingSeed = () => {
    const s = pendingSeed;
    setPendingSeed(null);
    return s;
  };
  const consumePendingRemix = () => {
    setPendingRemix(null);
  };
  const sendToInpaint = ({ seed, palette }) => {
    setInpaintSource({ seed, palette });
    setScreen('inpaint');
  };

  return (
    <main className="app-shell">
      <section className="intro-panel">
        <p className="eyebrow">CivitFree Personal</p>
        <h1>Local-first generation UI</h1>
        <p>
          Mobile-first prototype for local ComfyUI workflows. Text→Image submits real ComfyUI jobs;
          Queue and Feed read ComfyUI history. Future image, video, music, cloud, and Civitai
          browsing controls stay visible as coming-soon roadmap items.
        </p>
      </section>

      <div className="screen-tabs" role="tablist">
        {screens.map(s => (
          <button
            key={s.id}
            role="tab"
            aria-selected={screen === s.id}
            className={screen === s.id ? 'active' : ''}
            onClick={() => setScreen(s.id)}
          >
            <b>{s.label}</b><span>{s.title}</span>
          </button>
        ))}
        <button onClick={() => setOnboardingOpen(true)}>
          <b>·</b><span>First-run setup</span>
        </button>
      </div>

      {screen === 'brush' && (
        <VariantPersonalClassic
          onTab={handleTab}
          prompt={prompt}
          onPromptChange={setPrompt}
          negativePrompt={negativePrompt}
          onNegativePromptChange={setNegativePrompt}
          loras={loras}
          onAddLora={addLora}
          onUpdateLora={updateLora}
          onRemoveLora={removeLora}
          model={model}
          onModelChange={updateModel}
          settings={settings}
          onSettingsChange={updateSettings}
          pendingRemix={pendingRemix}
          consumePendingSeed={consumePendingSeed}
          consumePendingRemix={consumePendingRemix}
        />
      )}
      {screen === 'clock' && (
        <VariantPersonalQueue
          onTab={handleTab}
          onSendToInpaint={sendToInpaint}
          onRemix={remix}
          settings={settings}
          onSettingsChange={updateSettings}
        />
      )}
      {screen === 'grid' && (
        <VariantPersonalFeed
          onTab={handleTab}
          onSendToInpaint={sendToInpaint}
          onRemix={remix}
          settings={settings}
          onSettingsChange={updateSettings}
        />
      )}
      {screen === 'inpaint' && (
        <VariantPersonalInpaint
          onTab={handleTab}
          source={inpaintSource}
          settings={settings}
          onSettingsChange={updateSettings}
        />
      )}

      {onboardingOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex: 200,
          background:'rgba(0,0,0,.6)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding: 16,
        }} onClick={() => setOnboardingOpen(false)}>
          <div className="cf-frame" style={{boxShadow:'0 24px 60px -32px rgba(0,0,0,.85)'}} onClick={e => e.stopPropagation()}>
            <OnboardingFlow
              open={true}
              onClose={() => setOnboardingOpen(false)}
              settings={settings}
              onSettingsChange={updateSettings}
              onModelChange={updateModel}
            />
          </div>
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
