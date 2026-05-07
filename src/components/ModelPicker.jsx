import React from 'react';
import { Ic } from '../shared/icons.jsx';
import { PALETTES } from '../shared/mockImages.jsx';

function PickerCard({ name, type, base, version, size, palette, seed, onSelect, loaded }) {
  const p = PALETTES[(palette || 0) % PALETTES.length];
  const s = seed || 1234;
  const isGrid = (s % 3) !== 0;

  const previewCell = (i) => {
    const cs = s * (i + 7) * 13;
    const a = (cs * 13) % 360;
    return (
      <div key={i} style={{
        flex: 1, minHeight: 0,
        background: `
          radial-gradient(ellipse at ${30+(cs%40)}% ${20+(cs*3%40)}%, ${p[3]} 0%, transparent 35%),
          radial-gradient(ellipse at ${60+(cs*7%30)}% ${70+(cs*5%25)}%, ${p[2]} 0%, transparent 45%),
          linear-gradient(${a}deg, ${p[0]} 0%, ${p[1]} 100%)
        `,
      }}/>
    );
  };

  return (
    <div style={{
      background:'var(--panel)', border:'1px solid var(--line)', borderRadius: 14,
      overflow:'hidden', marginBottom: 10,
    }}>
      <div style={{
        width:'100%', aspectRatio: isGrid ? '4/3' : '3/2', position:'relative',
        display: isGrid ? 'grid' : 'block',
        gridTemplateColumns: isGrid ? '1fr 1fr 1fr' : undefined,
        gridTemplateRows: isGrid ? '1fr 1fr' : undefined,
        gap: 1, overflow:'hidden',
      }}>
        {isGrid ? (
          Array.from({length: 6}).map((_, i) => previewCell(i))
        ) : (
          <div style={{
            position:'absolute', inset: 0,
            background: `
              radial-gradient(ellipse at 40% 30%, ${p[3]} 0%, transparent 40%),
              radial-gradient(ellipse at 65% 70%, ${p[2]} 0%, transparent 50%),
              linear-gradient(${(s*13)%360}deg, ${p[0]} 0%, ${p[1]} 100%)
            `,
          }}/>
        )}

        <div style={{position:'absolute', top: 8, left: 8, display:'flex', gap: 4, zIndex: 2}}>
          <span style={{
            padding:'4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background:'rgba(0,0,0,.55)', backdropFilter:'blur(8px)', color:'white',
            fontFamily:'var(--font-mono)', letterSpacing:'.04em',
          }}>{type || 'Checkpoint'}</span>
          <span style={{
            padding:'4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background:'rgba(0,0,0,.55)', backdropFilter:'blur(8px)', color:'white',
            fontFamily:'var(--font-mono)', letterSpacing:'.04em',
          }}>{base}</span>
        </div>

        <div style={{position:'absolute', top: 8, right: 8, display:'flex', gap: 6, zIndex: 2}}>
          <button style={{
            width:28, height:28, borderRadius:'50%',
            background:'rgba(0,0,0,.45)', backdropFilter:'blur(8px)',
            display:'flex', alignItems:'center', justifyContent:'center', color:'white',
          }}><Ic.Info size={13}/></button>
          <button style={{
            width:28, height:28, borderRadius:'50%',
            background:'rgba(0,0,0,.45)', backdropFilter:'blur(8px)',
            display:'flex', alignItems:'center', justifyContent:'center', color:'white',
          }}><Ic.More size={13}/></button>
        </div>

        {loaded && (
          <div style={{
            position:'absolute', bottom: 8, left: 8, zIndex: 2,
            padding:'4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background:'oklch(0.40 0.12 165 / .8)', backdropFilter:'blur(8px)',
            color:'var(--good)', fontFamily:'var(--font-mono)', letterSpacing:'.08em',
          }}>LOADED</div>
        )}
      </div>

      <div style={{padding:'10px 12px 12px'}}>
        <div style={{fontWeight: 700, fontSize: 15, marginBottom: 6, letterSpacing:'-0.01em'}}>{name}</div>
        <div style={{display:'flex', gap: 8, alignItems:'center'}}>
          <div style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'var(--panel-2)', border:'1px solid var(--line)', borderRadius: 8,
            padding:'8px 10px', fontSize: 13, fontFamily:'var(--font-mono)', cursor:'pointer',
          }}>
            <span>{version || 'v1.0'}</span>
            <Ic.ChevDown size={10} color="var(--text-dim)"/>
          </div>
          <button onClick={onSelect} style={{
            padding:'8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background:'var(--cyan)', color:'oklch(0.12 0.02 220)',
            flexShrink: 0,
          }}>Select</button>
        </div>
        {size && <div className="mono mute" style={{fontSize:10, marginTop:6}}>{size}</div>}
      </div>
    </div>
  );
}

function PickerTabs({ tabs, active, onChange }) {
  return (
    <div style={{display:'flex', gap: 0, padding:'0 14px', overflowX:'auto', flexShrink:0, justifyContent:'center'}}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          padding:'10px 12px', fontSize: 13, fontWeight: 600, whiteSpace:'nowrap',
          color: active === t ? 'var(--warn)' : 'var(--text-dim)',
          borderBottom: active === t ? '2px solid var(--warn)' : '2px solid transparent',
          transition:'color .12s', flex: '1 0 auto', textAlign:'center',
        }}>{t}</button>
      ))}
    </div>
  );
}

function PickerCategories({ categories, active, onChange }) {
  return (
    <div style={{display:'flex', gap: 5, padding:'8px 14px', overflowX:'auto', flexShrink:0}}>
      {categories.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          padding:'6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, whiteSpace:'nowrap',
          background: active === c ? 'var(--panel-3)' : 'var(--panel-2)',
          color: active === c ? 'var(--text)' : 'var(--text-dim)',
          border: `1px solid ${active === c ? 'var(--line)' : 'transparent'}`,
        }}>{c}</button>
      ))}
    </div>
  );
}

function PickerSortRow() {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center', gap: 16,
      padding:'8px 14px', flexShrink:0,
    }}>
      <button style={{display:'flex', alignItems:'center', gap: 6, fontSize:13, color:'var(--text-dim)'}}>
        <Ic.SortDesc size={14}/> Relevance <Ic.ChevDown size={11}/>
      </button>
      <button style={{
        display:'flex', alignItems:'center', gap: 6, fontSize:13, color:'var(--text-dim)',
        padding:'6px 14px', borderRadius: 8, background:'var(--panel-2)', border:'1px solid var(--line)',
      }}>
        <Ic.Filter size={12}/> Filters <Ic.ChevDown size={11}/>
      </button>
      <button style={{
        width:32, height:32, borderRadius: 8, background:'var(--panel-2)', border:'1px solid var(--line)',
        display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-dim)',
      }}><Ic.Settings size={14}/></button>
    </div>
  );
}

export function ModelPicker({ open, onClose }) {
  const [sourceTab, setSourceTab] = React.useState('local');
  const [browseTab, setBrowseTab] = React.useState('ALL');
  const [localTab, setLocalTab] = React.useState('ALL');
  const [category, setCategory] = React.useState(null);
  const [localCategory, setLocalCategory] = React.useState(null);
  const [search, setSearch] = React.useState('');

  if (!open) return null;

  const localModels = [
    { name:'HomoSimile XL', ver:'v4.0', size:'6.4 GB', base:'SDXL', palette:0, seed:3812, loaded:true, cat:'STYLE' },
    { name:'Pony Diffusion V6', ver:'v6.0', size:'5.8 GB', base:'SDXL', palette:1, seed:9145, cat:'CHARACTER' },
    { name:'Illustrious XL', ver:'v0.1', size:'6.9 GB', base:'IL', palette:2, seed:2204, cat:'STYLE' },
    { name:'DreamShaper', ver:'v8.0', size:'2.1 GB', base:'SD1', palette:3, seed:6877, cat:'CONCEPT' },
    { name:'Flux.1 Dev', ver:'fp16', size:'23.8 GB', base:'Flux', palette:4, seed:1190, cat:'BASE MODEL' },
  ];
  const browseModels = [
    { name:'WAI-illustrious-SDXL', ver:'v17.0', base:'IL', palette:5, seed:8842, cat:'STYLE' },
    { name:'MeinaMix', ver:'v11', base:'SD1', palette:6, seed:4321, cat:'CHARACTER' },
    { name:'AbsoluteReality', ver:'v1.8.1', base:'SD1', palette:7, seed:5559, cat:'CONCEPT' },
    { name:'CyberRealistic', ver:'v4.2', base:'SDXL', palette:0, seed:2018, cat:'STYLE' },
  ];
  const localTabs = ['ALL','FAVORITE','RECENT','LOADED'];
  const browseTabs = ['ALL','FEATURED','RECENT','LIKED','MINE'];
  const categories = ['CHARACTER','STYLE','CONCEPT','CLOTHING','BASE MODEL','POSES','BACKGROUND','TOOL','ASSETS','VEHICLE','BUILDINGS','OBJECTS','ANIMAL','ACTION'];

  const models = sourceTab === 'local' ? localModels : browseModels;
  const activeCat = sourceTab === 'local' ? localCategory : category;
  const filtered = models.filter(m =>
    (!search || m.name.toLowerCase().includes(search.toLowerCase())) &&
    (!activeCat || m.cat === activeCat)
  );

  return (
    <div style={{
      position:'absolute', inset: 0, zIndex: 70,
      background:'var(--bg-canvas)',
      display:'flex', flexDirection:'column',
      animation:'cf-fade-in .15s ease-out',
    }}>
      <div style={{display:'flex', alignItems:'center', gap: 8, padding:'12px 14px', flexShrink: 0}}>
        <span style={{fontWeight:600, fontSize:16, flex:1}}>Select Model</span>
        <button className="cf-icon-btn" onClick={onClose}><Ic.X size={18}/></button>
      </div>

      <div style={{padding:'0 14px 8px', display:'flex', gap: 4}}>
        {['local','browse'].map(t => (
          <button key={t} onClick={() => setSourceTab(t)} style={{
            flex:1, padding:'9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign:'center',
            background: sourceTab===t ? 'var(--panel-3)' : 'var(--panel)',
            color: sourceTab===t ? 'var(--text)' : 'var(--text-dim)',
            border: `1px solid ${sourceTab===t ? 'var(--accent-line)' : 'var(--line)'}`,
          }}>{t === 'local' ? 'Local Models' : 'Browse CivitAI'}</button>
        ))}
      </div>

      <div style={{padding:'0 14px 4px'}}>
        <div style={{
          display:'flex', alignItems:'center', gap: 8,
          background:'var(--panel)', border:'1px solid var(--line)', borderRadius: 10,
          padding:'0 12px',
        }}>
          <Ic.Search size={16} color="var(--text-mute)"/>
          <input
            style={{flex:1, background:'none', border:'none', padding:'11px 0', color:'var(--text)', fontSize:13, outline:'none'}}
            placeholder="Search…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <span style={{
            width:22, height:22, borderRadius:4, background:'var(--panel-3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-mute)',
          }}>/</span>
        </div>
      </div>

      {sourceTab === 'local' ? (
        <>
          <PickerTabs tabs={localTabs} active={localTab} onChange={setLocalTab}/>
          <PickerCategories categories={categories} active={localCategory} onChange={c => setLocalCategory(localCategory === c ? null : c)}/>
        </>
      ) : (
        <>
          <PickerTabs tabs={browseTabs} active={browseTab} onChange={setBrowseTab}/>
          <PickerCategories categories={categories} active={category} onChange={c => setCategory(category === c ? null : c)}/>
          <PickerSortRow/>
        </>
      )}

      <div style={{flex:1, overflow:'auto', padding:'8px 14px 14px'}}>
        {filtered.map(m => (
          <PickerCard
            key={m.name}
            name={m.name}
            type="Checkpoint"
            base={m.base}
            version={m.ver}
            size={m.size}
            palette={m.palette}
            seed={m.seed}
            loaded={m.loaded}
            onSelect={onClose}
          />
        ))}
      </div>
    </div>
  );
}

export function LoraPicker({ open, onClose }) {
  const [sourceTab, setSourceTab] = React.useState('local');
  const [browseTab, setBrowseTab] = React.useState('ALL');
  const [localTab, setLocalTab] = React.useState('ALL');
  const [category, setCategory] = React.useState(null);
  const [localCategory, setLocalCategory] = React.useState(null);
  const [search, setSearch] = React.useState('');

  if (!open) return null;

  const localLoras = [
    { name:'Aruto Fushibe · D_Cide Traumerei', type:'LoRA', base:'SDXL', size:'144 MB', palette:0, seed:7721, cat:'CHARACTER' },
    { name:'Uggu Bang · Artist', type:'LoRA', base:'IL', size:'92 MB', palette:1, seed:3344, cat:'STYLE' },
    { name:'Ra4s Art Style', type:'LoRA', base:'SDXL', size:'184 MB', palette:2, seed:8801, cat:'STYLE' },
    { name:'Detail Tweaker XL', type:'LoRA', base:'SDXL', size:'36 MB', palette:3, seed:1155, cat:'CONCEPT' },
    { name:'EasyNegative', type:'Embedding', base:'SD1', size:'24 KB', palette:4, seed:6622, cat:'CONCEPT' },
    { name:'LCMXL Accelerator', type:'LyCORIS', base:'SDXL', size:'68 MB', palette:5, seed:9988, cat:'BASE MODEL' },
  ];
  const browseLoras = [
    { name:'Flat Color Anime', type:'LoRA', base:'SDXL', palette:6, seed:2233, cat:'STYLE' },
    { name:'Add More Details', type:'LoRA', base:'SDXL', palette:7, seed:4455, cat:'CONCEPT' },
    { name:'Neon Style', type:'LoRA', base:'SDXL', palette:0, seed:6677, cat:'STYLE' },
  ];
  const localTabs = ['ALL','FAVORITE','RECENT','LOADED'];
  const browseTabs = ['ALL','FEATURED','RECENT','LIKED','MINE'];
  const categories = ['CHARACTER','STYLE','CONCEPT','CLOTHING','BASE MODEL','POSES','BACKGROUND','TOOL','ASSETS','VEHICLE','BUILDINGS','OBJECTS','ANIMAL','ACTION'];

  const loras = sourceTab === 'local' ? localLoras : browseLoras;
  const activeCat = sourceTab === 'local' ? localCategory : category;
  const filtered = loras.filter(l =>
    (!search || l.name.toLowerCase().includes(search.toLowerCase())) &&
    (!activeCat || l.cat === activeCat)
  );

  return (
    <div style={{
      position:'absolute', inset: 0, zIndex: 70,
      background:'var(--bg-canvas)',
      display:'flex', flexDirection:'column',
      animation:'cf-fade-in .15s ease-out',
    }}>
      <div style={{display:'flex', alignItems:'center', gap: 8, padding:'12px 14px', flexShrink: 0}}>
        <span style={{fontWeight:600, fontSize:16, flex:1}}>Add Resource</span>
        <button className="cf-icon-btn" onClick={onClose}><Ic.X size={18}/></button>
      </div>

      <div style={{padding:'0 14px 8px', display:'flex', gap: 4}}>
        {['local','browse'].map(t => (
          <button key={t} onClick={() => setSourceTab(t)} style={{
            flex:1, padding:'9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign:'center',
            background: sourceTab===t ? 'var(--panel-3)' : 'var(--panel)',
            color: sourceTab===t ? 'var(--text)' : 'var(--text-dim)',
            border: `1px solid ${sourceTab===t ? 'var(--accent-line)' : 'var(--line)'}`,
          }}>{t === 'local' ? 'Local' : 'Browse CivitAI'}</button>
        ))}
      </div>

      <div style={{padding:'0 14px 4px'}}>
        <div style={{
          display:'flex', alignItems:'center', gap: 8,
          background:'var(--panel)', border:'1px solid var(--line)', borderRadius: 10,
          padding:'0 12px',
        }}>
          <Ic.Search size={16} color="var(--text-mute)"/>
          <input
            style={{flex:1, background:'none', border:'none', padding:'11px 0', color:'var(--text)', fontSize:13, outline:'none'}}
            placeholder="Search LoRAs, embeddings…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <span style={{
            width:22, height:22, borderRadius:4, background:'var(--panel-3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-mute)',
          }}>/</span>
        </div>
      </div>

      {sourceTab === 'local' ? (
        <>
          <PickerTabs tabs={localTabs} active={localTab} onChange={setLocalTab}/>
          <PickerCategories categories={categories} active={localCategory} onChange={c => setLocalCategory(localCategory === c ? null : c)}/>
        </>
      ) : (
        <>
          <PickerTabs tabs={browseTabs} active={browseTab} onChange={setBrowseTab}/>
          <PickerCategories categories={categories} active={category} onChange={c => setCategory(category === c ? null : c)}/>
          <PickerSortRow/>
        </>
      )}

      <div style={{flex:1, overflow:'auto', padding:'8px 14px 14px'}}>
        {filtered.map(l => (
          <PickerCard
            key={l.name}
            name={l.name}
            type={l.type || 'LoRA'}
            base={l.base}
            version={l.ver || 'v1.0'}
            size={l.size}
            palette={l.palette}
            seed={l.seed}
            onSelect={onClose}
          />
        ))}
      </div>
    </div>
  );
}
