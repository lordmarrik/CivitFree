import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { VariantPersonalClassic } from './screens/Generation.jsx';
import { VariantPersonalQueue, VariantPersonalFeed } from './screens/QueueAndFeed.jsx';
import { VariantPersonalInpaint } from './screens/Inpaint.jsx';
import { OnboardingFlow } from './screens/Onboarding.jsx';
import './styles.css';

const screens = [
  { id: 'brush', label: 'A', title: 'Generate' },
  { id: 'clock', label: 'B', title: 'Queue' },
  { id: 'grid', label: 'C', title: 'Feed' },
  { id: 'inpaint', label: 'D', title: 'Inpaint' },
];

function App() {
  const [screen, setScreen] = useState('brush');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const handleTab = (key) => {
    if (key === 'brush' || key === 'clock' || key === 'grid') setScreen(key);
  };
  const goInpaint = () => setScreen('inpaint');

  return (
    <main className="app-shell">
      <section className="intro-panel">
        <p className="eyebrow">CivitFree Personal</p>
        <h1>Local-first generation UI</h1>
        <p>
          Mobile-first prototype shell for ComfyUI workflows. Hamburger opens the side drawer;
          Change/Add open model and LoRA pickers; the GPU pill swaps backend; image tile menus
          provide remix and Send to inpaint. ComfyUI transport is stubbed.
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

      {screen === 'brush' && <VariantPersonalClassic onTab={handleTab}/>}
      {screen === 'clock' && <VariantPersonalQueue onTab={handleTab} onInpaint={goInpaint}/>}
      {screen === 'grid' && <VariantPersonalFeed onTab={handleTab} onInpaint={goInpaint}/>}
      {screen === 'inpaint' && <VariantPersonalInpaint onTab={handleTab}/>}

      {onboardingOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex: 200,
          background:'rgba(0,0,0,.6)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding: 16,
        }} onClick={() => setOnboardingOpen(false)}>
          <div className="cf-frame" style={{boxShadow:'0 24px 60px -32px rgba(0,0,0,.85)'}} onClick={e => e.stopPropagation()}>
            <OnboardingFlow open={true} onClose={() => setOnboardingOpen(false)}/>
          </div>
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
