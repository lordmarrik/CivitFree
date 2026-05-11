import React from 'react';
import { Ic } from '../shared/icons.jsx';
import { PALETTES } from '../shared/mockImages.jsx';
import { useComfyList } from '../shared/useComfyList.js';

/**
 * Friendly display fields derived from a raw filename like
 * "dreamshaperXL_v85.safetensors". The PickerCard gets fed these so
 * each real file shows up with a stable palette (hashed from the name)
 * and a guess at the version suffix. Best effort, not authoritative.
 */
function deriveDisplayFields(filename) {
  const stem = filename.replace(/\.[^.]+$/, '');
  let palette = 0;
  for (let i = 0; i < stem.length; i++) palette = (palette + stem.charCodeAt(i)) % PALETTES.length;
  let seed = 0;
  for (let i = 0; i < stem.length; i++) seed = (seed * 31 + stem.charCodeAt(i)) >>> 0;
  // Try to split off a trailing _vXX or _vXX_X
  const verMatch = stem.match(/[_-](v[\d.]+(?:[_-][\w]+)?)$/i);
  const name = verMatch ? stem.slice(0, verMatch.index) : stem;
  const ver = verMatch ? verMatch[1] : '';
  return { name, ver, palette, seed };
}

/**
 * Render a list with a loading or error state. baseUrl is the backend
 * URL we'll actually fetch against, kind is 'checkpoints' or 'loras'.
 */
function FetchedList({ baseUrl, kind, enabled, search, renderItem, emptyMessage }) {
  const { items, loading, error, reload } = useComfyList(kind, baseUrl, { enabled });
  if (!baseUrl) {
    return (
      <div style={{padding:'40px 18px', textAlign:'center', color:'var(--text-mute)', fontSize: 13}}>
        No backend URL configured. Open Settings → ComfyUI Backend URL, then reopen this picker.
      </div>
    );
  }
  if (loading) {
    return (
      <div style={{padding:'40px 18px', textAlign:'center', color:'var(--text-dim)', fontSize: 13, display:'flex', flexDirection:'column', alignItems:'center', gap: 10}}>
        <div style={{
          width: 18, height: 18, borderRadius:'50%',
          border:'2px solid var(--text-dim)', borderTopColor:'var(--accent)',
          animation:'cf-spin .8s linear infinite',
        }}/>
        Loading from ComfyUI…
      </div>
    );
  }
  if (error) {
    return (
      <div style={{padding:'18px', display:'flex', flexDirection:'column', gap: 10}}>
        <div style={{
          padding:'10px 12px', borderRadius: 8,
          background:'oklch(0.30 0.12 25 / .15)', border:'1px solid oklch(0.45 0.18 25 / .35)',
          color:'var(--bad)', fontSize: 12, lineHeight: 1.5, whiteSpace:'pre-wrap',
        }}>
          <strong style={{display:'block', marginBottom: 4}}>Couldn't load list</strong>
          {error.message || String(error)}
          {error.hint && <div style={{marginTop: 4}}>{error.hint}</div>}
        </div>
        <button onClick={reload} style={{
          alignSelf:'flex-start', padding:'8px 12px', borderRadius: 8,
          background:'var(--panel-2)', border:'1px solid var(--line)',
          color:'var(--text)', fontSize: 12, fontWeight: 600,
        }}>Retry</button>
      </div>
    );
  }
  const filtered = search
    ? items.filter(f => f.toLowerCase().includes(search.toLowerCase()))
    : items;
  if (filtered.length === 0) {
    return (
      <div style={{padding:'40px 18px', textAlign:'center', color:'var(--text-mute)', fontSize: 13}}>
        {search ? 'No matches.' : (emptyMessage || 'No items found.')}
      </div>
    );
  }
  return <>{filtered.map(renderItem)}</>;
}

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


export function ModelPicker({ open, onClose, onSelect, baseUrl, currentFilename }) {
  const [sourceTab, setSourceTab] = React.useState('local');
  const [browseTab, setBrowseTab] = React.useState('ALL');
  const [search, setSearch] = React.useState('');

  if (!open) return null;

  const browseTabs = ['ALL','FEATURED','RECENT','LIKED','MINE'];

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
          }}>{t === 'local' ? 'On your ComfyUI' : 'Browse CivitAI'}</button>
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
            placeholder={sourceTab === 'local' ? 'Search local checkpoints…' : 'Search…'}
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {sourceTab === 'browse' && (
        <>
          <PickerTabs tabs={browseTabs} active={browseTab} onChange={setBrowseTab}/>
          <div style={{padding:'8px 14px 0', fontSize: 11, color:'var(--text-mute)'}}>
            Browse CivitAI is not wired yet — coming later.
          </div>
        </>
      )}

      <div style={{flex:1, overflow:'auto', padding:'8px 14px 14px'}}>
        {sourceTab === 'local' ? (
          <FetchedList
            baseUrl={baseUrl}
            kind="checkpoints"
            enabled={open && sourceTab === 'local'}
            search={search}
            emptyMessage="No checkpoints found in models/checkpoints/."
            renderItem={(filename) => {
              const fields = deriveDisplayFields(filename);
              return (
                <PickerCard
                  key={filename}
                  name={fields.name || filename}
                  type="Checkpoint"
                  base={'safetensors'}
                  version={fields.ver || ''}
                  size={filename}
                  palette={fields.palette}
                  seed={fields.seed}
                  loaded={currentFilename && filename === currentFilename}
                  onSelect={() => {
                    if (onSelect) {
                      onSelect({
                        name: fields.name || filename,
                        ver: fields.ver || '',
                        size: '',
                        base: 'Checkpoint',
                        filename,
                      });
                    }
                    onClose && onClose();
                  }}
                />
              );
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export function LoraPicker({ open, onClose, onSelect, baseUrl }) {
  const [sourceTab, setSourceTab] = React.useState('local');
  const [browseTab, setBrowseTab] = React.useState('ALL');
  const [search, setSearch] = React.useState('');

  if (!open) return null;

  const browseTabs = ['ALL','FEATURED','RECENT','LIKED','MINE'];

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
          }}>{t === 'local' ? 'On your ComfyUI' : 'Browse CivitAI'}</button>
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
            placeholder={sourceTab === 'local' ? 'Search local LoRAs…' : 'Search…'}
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {sourceTab === 'browse' && (
        <>
          <PickerTabs tabs={browseTabs} active={browseTab} onChange={setBrowseTab}/>
          <div style={{padding:'8px 14px 0', fontSize: 11, color:'var(--text-mute)'}}>
            Browse CivitAI is not wired yet — coming later.
          </div>
        </>
      )}

      <div style={{flex:1, overflow:'auto', padding:'8px 14px 14px'}}>
        {sourceTab === 'local' ? (
          <FetchedList
            baseUrl={baseUrl}
            kind="loras"
            enabled={open && sourceTab === 'local'}
            search={search}
            emptyMessage="No LoRAs found in models/loras/."
            renderItem={(filename) => {
              const fields = deriveDisplayFields(filename);
              return (
                <PickerCard
                  key={filename}
                  name={fields.name || filename}
                  type="LoRA"
                  base="safetensors"
                  version={fields.ver || ''}
                  size={filename}
                  palette={fields.palette}
                  seed={fields.seed}
                  onSelect={() => {
                    if (onSelect) {
                      onSelect({
                        id: filename,
                        name: fields.name || filename,
                        ver: fields.ver || '',
                        palette: fields.palette,
                        seed: fields.seed,
                        filename,
                      });
                    }
                    onClose && onClose();
                  }}
                />
              );
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
