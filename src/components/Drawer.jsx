import React from 'react';
import { Ic } from '../shared/icons.jsx';

export function SideDrawer({ open, onClose, settings, onSettingsChange }) {
  const [screen, setScreen] = React.useState(null);

  React.useEffect(() => {
    if (!open) setTimeout(() => setScreen(null), 200);
  }, [open]);

  if (!open) return null;

  const drawerStyles = {
    position: 'absolute', inset: 0, zIndex: 60,
    display: 'flex',
  };
  const backdropStyles = {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,.5)',
    animation: 'cf-fade-in .15s ease-out',
  };
  const panelStyles = {
    position: 'relative', width: '82%', height: '100%',
    background: 'var(--panel)', borderRight: '1px solid var(--line)',
    display: 'flex', flexDirection: 'column',
    animation: 'cf-drawer-in .2s ease-out',
    overflow: 'hidden',
  };

  const menuItems = [
    { key: 'settings', icon: <Ic.Settings size={18}/>, label: 'Settings' },
    { key: 'models', icon: <Ic.Layers size={18}/>, label: 'Model Library' },
    { key: 'loras', icon: <Ic.Sparkle size={18}/>, label: 'LoRA Manager' },
    { key: 'about', icon: <Ic.Info size={16}/>, label: 'About' },
  ];

  return (
    <div style={drawerStyles}>
      <div style={backdropStyles} onClick={onClose}/>
      <div style={panelStyles}>
        {!screen && <DrawerMain items={menuItems} onNav={setScreen} onClose={onClose}/>}
        {screen === 'settings' && (
          <DrawerSettings
            onBack={() => setScreen(null)}
            settings={settings}
            onSettingsChange={onSettingsChange}
          />
        )}
        {screen === 'models' && <DrawerModelLibrary onBack={() => setScreen(null)}/>}
        {screen === 'loras' && <DrawerLoraManager onBack={() => setScreen(null)}/>}
        {screen === 'about' && <DrawerAbout onBack={() => setScreen(null)} settings={settings}/>}
      </div>
    </div>
  );
}

function DrawerHeader({ title, onBack, onClose }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 8,
      padding:'14px 14px', borderBottom:'1px solid var(--line)',
      flexShrink: 0,
    }}>
      {onBack && (
        <button className="cf-icon-btn" onClick={onBack}><Ic.ChevLeft size={18}/></button>
      )}
      <span style={{flex:1, fontWeight: 600, fontSize: 15}}>{title}</span>
      {onClose && (
        <button className="cf-icon-btn" onClick={onClose}><Ic.X size={16}/></button>
      )}
    </div>
  );
}

function DrawerMain({ items, onNav, onClose }) {
  return (
    <>
      <div style={{padding:'20px 18px 14px', display:'flex', alignItems:'center', gap: 12}}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background:'linear-gradient(155deg, oklch(0.32 0.04 250), oklch(0.22 0.04 250))',
          boxShadow:'inset 0 0 0 1px oklch(0.42 0.04 250 / .8)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <span style={{fontFamily:'var(--font-mono)', fontWeight:700, fontSize:14, color:'white'}}>CF</span>
        </div>
        <div>
          <div style={{fontWeight: 700, fontSize: 16, letterSpacing:'-0.01em'}}>CivitFree</div>
          <div className="mono mute" style={{fontSize: 11}}>local · v0.1.0</div>
        </div>
        <div style={{flex:1}}/>
        <button className="cf-icon-btn" onClick={onClose}><Ic.X size={16}/></button>
      </div>
      <div style={{flex:1, padding:'8px 0'}}>
        {items.map(it => (
          <button key={it.key} onClick={() => onNav(it.key)} style={{
            display:'flex', alignItems:'center', gap: 14, width:'100%',
            padding:'14px 20px', fontSize: 14, fontWeight: 500, color:'var(--text)',
            transition:'background .1s',
          }}
            onMouseEnter={e => e.currentTarget.style.background='var(--panel-2)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <span style={{color:'var(--text-dim)'}}>{it.icon}</span>
            <span style={{flex:1, textAlign:'left'}}>{it.label}</span>
            <Ic.ChevRight size={14} color="var(--text-mute)"/>
          </button>
        ))}
      </div>
      <div style={{padding:'14px 20px', borderTop:'1px solid var(--line-soft)', fontSize: 11, color:'var(--text-mute)', fontFamily:'var(--font-mono)'}}>
        GPU: RTX 3080 · 10 GB VRAM
      </div>
    </>
  );
}

const SAMPLER_OPTIONS = ['Euler a', 'Euler', 'DPM++ 2M', 'DPM++ 2M Karras', 'Heun', 'LCM'];
const SCHEDULER_OPTIONS = ['Normal', 'Karras', 'Exponential', 'SGM Uniform', 'Simple'];
const MODEL_OPTIONS = [
  'HomoSimile XL v4.0',
  'Pony Diffusion V6 v6.0',
  'Illustrious XL v0.1',
  'DreamShaper v8.0',
  'Flux.1 Dev fp16',
];
const SIZE_OPTIONS = ['832×1216', '1024×1024', '1216×832', '768×1344', '1344×768'];

function DrawerSettings({ onBack, settings, onSettingsChange }) {
  const s = settings || {};
  const set = (patch) => onSettingsChange && onSettingsChange(patch);

  const fieldStyle = {
    width:'100%', background:'var(--panel-2)', border:'1px solid var(--line)',
    borderRadius: 8, padding:'10px 12px', color:'var(--text)', fontSize: 13,
    fontFamily:'var(--font-mono)',
  };
  const selectStyle = {
    ...fieldStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    paddingRight: 32,
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ba1b0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, marginBottom: 6, color:'var(--text-dim)' };

  return (
    <>
      <DrawerHeader title="Settings" onBack={onBack}/>
      <div style={{flex:1, overflow:'auto', padding: 16, display:'flex', flexDirection:'column', gap: 18}}>
        <div>
          <div style={labelStyle}>Backend Profile</div>
          <div style={{display:'flex', gap: 6}}>
            {[{id:'steubenville', label:'Steubenville PC'},{id:'columbus', label:'Columbus PC'}].map(p => (
              <button key={p.id} onClick={() => set({ backendProfile: p.id })} style={{
                flex:1, padding:'10px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: s.backendProfile === p.id ? 'var(--accent-soft)' : 'var(--panel-2)',
                border: `1px solid ${s.backendProfile === p.id ? 'var(--accent-line)' : 'var(--line)'}`,
                color: s.backendProfile === p.id ? 'var(--accent)' : 'var(--text-dim)',
                textAlign:'center',
              }}>{p.label}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={labelStyle}>ComfyUI Backend URL</div>
          <input
            style={fieldStyle}
            value={s.backendUrl ?? ''}
            onChange={e => set({ backendUrl: e.target.value })}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>

        <div>
          <div style={labelStyle}>Default Model (display)</div>
          <select
            style={selectStyle}
            value={s.defaultModelName ?? ''}
            onChange={e => set({ defaultModelName: e.target.value })}
          >
            {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <div style={labelStyle}>Checkpoint filename (used to generate)</div>
          <input
            style={fieldStyle}
            value={s.checkpointFilename ?? ''}
            onChange={e => set({ checkpointFilename: e.target.value })}
            placeholder="e.g. dreamshaperXL_v85.safetensors"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <div className="mute" style={{fontSize: 10, marginTop: 4, lineHeight: 1.4}}>
            Exact filename from your ComfyUI <code>models/checkpoints/</code> folder. The Model picker can list local checkpoints when the backend is reachable; this field remains a manual override.
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
          <div>
            <div style={labelStyle}>Sampler</div>
            <select
              style={selectStyle}
              value={s.sampler ?? ''}
              onChange={e => set({ sampler: e.target.value })}
            >
              {SAMPLER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <div style={labelStyle}>Scheduler</div>
            <select
              style={selectStyle}
              value={s.scheduler ?? ''}
              onChange={e => set({ scheduler: e.target.value })}
            >
              {SCHEDULER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8}}>
          <div>
            <div style={labelStyle}>Steps</div>
            <input
              type="number" inputMode="numeric" min={1} max={150}
              style={{...fieldStyle, textAlign:'center'}}
              value={s.steps ?? 30}
              onChange={e => set({ steps: Math.max(1, Math.min(150, parseInt(e.target.value || '1', 10))) })}
            />
          </div>
          <div>
            <div style={labelStyle}>CFG</div>
            <input
              type="number" inputMode="decimal" min={1} max={30} step={0.5}
              style={{...fieldStyle, textAlign:'center'}}
              value={s.cfg ?? 7}
              onChange={e => set({ cfg: Math.max(1, Math.min(30, parseFloat(e.target.value || '1'))) })}
            />
          </div>
          <div>
            <div style={labelStyle}>Size</div>
            <select
              style={{...selectStyle, textAlign:'center'}}
              value={s.size ?? '832×1216'}
              onChange={e => set({ size: e.target.value })}
            >
              {SIZE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div style={labelStyle}>Cloud GPU Credentials <span className="cf-soon-badge">soon</span></div>
          <input
            style={fieldStyle}
            type="password"
            value={s.cloudGpuKey ?? ''}
            onChange={e => set({ cloudGpuKey: e.target.value })}
            placeholder="sk-…"
            autoComplete="off"
          />
        </div>

        <div>
          <div style={labelStyle}>CivitAI API Key <span className="cf-soon-badge">soon</span></div>
          <input
            style={fieldStyle}
            type="password"
            value={s.civitaiKey ?? ''}
            onChange={e => set({ civitaiKey: e.target.value })}
            placeholder="civ-…"
            autoComplete="off"
          />
          <div className="mute" style={{fontSize: 10, marginTop: 4, lineHeight: 1.4}}>
            Stored for future Browse CivitAI/download support; not required for current local Text→Image generation.
          </div>
        </div>

        <div>
          <div style={labelStyle}>PC Image Save Path <span className="cf-soon-badge">soon</span></div>
          <input
            style={fieldStyle}
            value={s.pcSavePath ?? ''}
            onChange={e => set({ pcSavePath: e.target.value })}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>

        <div>
          <div style={labelStyle}>Phone Download Path <span className="cf-soon-badge">soon</span></div>
          <input
            style={fieldStyle}
            value={s.phoneSavePath ?? ''}
            onChange={e => set({ phoneSavePath: e.target.value })}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      </div>
    </>
  );
}

function DrawerModelLibrary({ onBack }) {
  const [tab, setTab] = React.useState('local');
  const [filter, setFilter] = React.useState('All');
  const models = [
    { name:'HomoSimile XL', ver:'v4.0', size:'6.4 GB', base:'SDXL', loaded: true },
    { name:'Pony Diffusion V6', ver:'v6.0', size:'5.8 GB', base:'SDXL', loaded: false },
    { name:'Illustrious XL', ver:'v0.1', size:'6.9 GB', base:'Illustrious', loaded: false },
    { name:'DreamShaper', ver:'v8.0', size:'2.1 GB', base:'SD 1.5', loaded: false },
    { name:'Flux.1 Dev', ver:'fp16', size:'23.8 GB', base:'Flux', loaded: false },
  ];
  const bases = ['All','SDXL','Illustrious','Flux','SD 1.5'];
  const filtered = filter === 'All' ? models : models.filter(m => m.base === filter);

  return (
    <>
      <DrawerHeader title="Model Library" onBack={onBack}/>
      <div style={{padding:'10px 14px 6px', display:'flex', gap: 4}}>
        <button onClick={() => setTab('local')} style={{
          flex:1, padding:'9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign:'center',
          background: tab==='local' ? 'var(--panel-3)' : 'transparent',
          color: tab==='local' ? 'var(--text)' : 'var(--text-dim)',
          border: tab==='local' ? '1px solid var(--accent-line)' : '1px solid transparent',
        }}>Local Models</button>
        <button onClick={() => setTab('browse')} style={{
          flex:1, padding:'9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign:'center',
          background: tab==='browse' ? 'var(--panel-3)' : 'transparent',
          color: tab==='browse' ? 'var(--text)' : 'var(--text-dim)',
          border: tab==='browse' ? '1px solid var(--accent-line)' : '1px solid transparent',
        }}>Browse CivitAI</button>
      </div>
      <div style={{padding:'6px 14px 8px', display:'flex', gap: 4, overflowX:'auto'}}>
        {bases.map(b => (
          <button key={b} onClick={() => setFilter(b)} className={`cf-chip ${filter===b?'active':''}`} style={{fontSize:11, padding:'5px 10px'}}>
            {b}
          </button>
        ))}
      </div>
      <div style={{flex:1, overflow:'auto', padding:'0 14px'}}>
        {tab === 'local' ? filtered.map(m => (
          <div key={m.name} className="cf-model" style={{marginBottom: 8}}>
            <div className="thumb" style={{width:42, height:42}}/>
            <div className="meta" style={{flex:1}}>
              <div className="name" style={{fontSize:13}}>{m.name}</div>
              <div className="ver">{m.ver} · {m.size} · {m.base}</div>
            </div>
            {m.loaded && <span style={{fontSize:10, fontWeight:700, color:'var(--good)', fontFamily:'var(--font-mono)'}}>LOADED</span>}
          </div>
        )) : (
          <div style={{padding:'40px 0', textAlign:'center', color:'var(--text-mute)', fontSize: 13}}>
            <Ic.Search size={24} color="var(--text-mute)"/>
            <div style={{marginTop: 10}}>Search CivitAI models…</div>
            <div style={{marginTop: 16}}>
              <input style={{
                width:'100%', background:'var(--panel-2)', border:'1px solid var(--line)',
                borderRadius: 10, padding:'11px 14px', color:'var(--text)', fontSize: 13,
              }} placeholder="Search checkpoints…"/>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function DrawerLoraManager({ onBack }) {
  const [tab, setTab] = React.useState('local');
  const [typeFilter, setTypeFilter] = React.useState('All');
  const loras = [
    { name:'Aruto Fushibe · D_Cide Traumerei', type:'LoRA', base:'SDXL', size:'144 MB' },
    { name:'Uggu Bang · Artist', type:'LoRA', base:'Illustrious', size:'92 MB' },
    { name:'Ra4s Art Style', type:'LoRA', base:'SDXL', size:'184 MB' },
    { name:'Detail Tweaker XL', type:'LoRA', base:'SDXL', size:'36 MB' },
    { name:'EasyNegative', type:'Embedding', base:'SD 1.5', size:'24 KB' },
    { name:'LCMXL Accelerator', type:'LyCORIS', base:'SDXL', size:'68 MB' },
  ];
  const types = ['All','LoRA','DoRA','LyCORIS','Embedding'];
  const filtered = typeFilter === 'All' ? loras : loras.filter(l => l.type === typeFilter);

  return (
    <>
      <DrawerHeader title="LoRA Manager" onBack={onBack}/>
      <div style={{padding:'10px 14px 6px', display:'flex', gap: 4}}>
        <button onClick={() => setTab('local')} style={{
          flex:1, padding:'9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign:'center',
          background: tab==='local' ? 'var(--panel-3)' : 'transparent',
          color: tab==='local' ? 'var(--text)' : 'var(--text-dim)',
          border: tab==='local' ? '1px solid var(--accent-line)' : '1px solid transparent',
        }}>Local</button>
        <button onClick={() => setTab('browse')} style={{
          flex:1, padding:'9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign:'center',
          background: tab==='browse' ? 'var(--panel-3)' : 'transparent',
          color: tab==='browse' ? 'var(--text)' : 'var(--text-dim)',
          border: tab==='browse' ? '1px solid var(--accent-line)' : '1px solid transparent',
        }}>Browse CivitAI</button>
      </div>
      <div style={{padding:'6px 14px 8px', display:'flex', gap: 4, overflowX:'auto'}}>
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`cf-chip ${typeFilter===t?'active':''}`} style={{fontSize:11, padding:'5px 10px'}}>
            {t}
          </button>
        ))}
      </div>
      <div style={{flex:1, overflow:'auto', padding:'0 14px'}}>
        {tab === 'local' ? filtered.map(l => (
          <div key={l.name} className="cf-resource" style={{marginBottom: 6, padding:'10px 12px'}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.name}</div>
              <div className="mono mute" style={{fontSize:10, marginTop:2}}>{l.type} · {l.base} · {l.size}</div>
            </div>
          </div>
        )) : (
          <div style={{padding:'40px 0', textAlign:'center', color:'var(--text-mute)', fontSize: 13}}>
            <Ic.Search size={24} color="var(--text-mute)"/>
            <div style={{marginTop: 10}}>Search CivitAI resources…</div>
            <div style={{marginTop: 16}}>
              <input style={{
                width:'100%', background:'var(--panel-2)', border:'1px solid var(--line)',
                borderRadius: 10, padding:'11px 14px', color:'var(--text)', fontSize: 13,
              }} placeholder="Search LoRAs, embeddings…"/>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function DrawerAbout({ onBack, settings }) {
  const backendUrlDisplay = (() => {
    const raw = settings?.backendUrl ?? '';
    try {
      const u = new URL(raw);
      return u.host + (u.pathname === '/' ? '' : u.pathname);
    } catch {
      return raw || '—';
    }
  })();
  const infoRow = (label, value, color) => (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--line-soft)'}}>
      <span style={{fontSize:13, color:'var(--text-dim)'}}>{label}</span>
      <span style={{fontSize:13, fontFamily:'var(--font-mono)', fontWeight:500, color: color || 'var(--text)'}}>{value}</span>
    </div>
  );
  return (
    <>
      <DrawerHeader title="About" onBack={onBack}/>
      <div style={{flex:1, overflow:'auto', padding: 16}}>
        <div style={{textAlign:'center', padding:'24px 0 20px'}}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin:'0 auto 14px',
            background:'linear-gradient(155deg, oklch(0.32 0.04 250), oklch(0.22 0.04 250))',
            boxShadow:'inset 0 0 0 1px oklch(0.42 0.04 250 / .8)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{fontFamily:'var(--font-mono)', fontWeight:700, fontSize:22, color:'white'}}>CF</span>
          </div>
          <div style={{fontWeight:700, fontSize:20, letterSpacing:'-0.01em'}}>CivitFree</div>
          <div className="mono mute" style={{fontSize:12, marginTop:4}}>v0.1.0 · May 2026</div>
        </div>
        <div style={{padding:'8px 0'}}>
          {infoRow('GPU', 'NVIDIA RTX 3080')}
          {infoRow('VRAM', '10 GB')}
          {infoRow('ComfyUI', 'v0.3.10')}
          {infoRow('Backend URL', backendUrlDisplay)}
        </div>
      </div>
    </>
  );
}
