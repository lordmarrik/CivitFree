import React from 'react';
import { Ic } from '../shared/icons.jsx';
import { FakeImg } from '../shared/mockImages.jsx';
import { StatusBar, TopBar, Dock, SectionTitle } from '../shared/Shell.jsx';
import { Chips, SliderRow } from '../shared/controls.jsx';
import { SideDrawer } from '../components/Drawer.jsx';
import { BackendSwitcher } from '../components/SortFilter.jsx';

export function VariantPersonalInpaint({ onTab, source }) {
  const [activeTab, setActiveTab] = React.useState('inpaint');
  const [tool, setTool] = React.useState('brush');
  const [size, setSize] = React.useState(48);
  const [denoise, setDenoise] = React.useState(72);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [backendOpen, setBackendOpen] = React.useState(false);
  const [outDirs, setOutDirs] = React.useState({ top: false, bottom: true, left: false, right: true });
  const [outPx, setOutPx] = React.useState(256);
  const [varQty, setVarQty] = React.useState(4);

  const toggleDir = (d) => setOutDirs(prev => ({...prev, [d]: !prev[d]}));

  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="brush" personal onMenu={() => setDrawerOpen(true)} onTab={onTab}/>
      <div className="cf-body" style={{display:'flex', flexDirection:'column'}}>

        <div className="cf-section" style={{padding:'12px 16px 4px'}}>
          <div className="cf-tabs">
            {['Inpaint','Outpaint','Variations'].map(t => (
              <div key={t} className={`cf-tab ${activeTab === t.toLowerCase() ? 'active' : ''}`}
                onClick={() => setActiveTab(t.toLowerCase())}>{t}</div>
            ))}
          </div>
        </div>

        {activeTab === 'inpaint' && (
          <>
            <div className="cf-paint">
              {source ? (
                <FakeImg palette={source.palette} seed={source.seed}/>
              ) : (
                <div className="layer" style={{
                  background:`
                    radial-gradient(circle at 35% 30%, oklch(0.85 0.16 60) 0%, transparent 30%),
                    radial-gradient(ellipse at 60% 70%, oklch(0.55 0.18 320) 0%, transparent 50%),
                    linear-gradient(160deg, oklch(0.18 0.05 280), oklch(0.32 0.10 320) 60%, oklch(0.42 0.18 30))
                  `
                }}>
                  <div style={{position:'absolute', inset:0, background:'repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,.05) 8px 9px)'}}/>
                </div>
              )}

              <svg className="layer" viewBox="0 0 300 400">
                <defs>
                  <filter id="goo2"><feGaussianBlur in="SourceGraphic" stdDeviation="6"/>
                    <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"/>
                  </filter>
                </defs>
                <g filter="url(#goo2)" fill="oklch(0.68 0.22 340 / .55)">
                  <circle cx="120" cy="160" r="36"/><circle cx="155" cy="170" r="40"/>
                  <circle cx="180" cy="200" r="34"/><circle cx="200" cy="240" r="28"/>
                  <circle cx="170" cy="260" r="30"/><circle cx="135" cy="220" r="32"/>
                </g>
                <g stroke="oklch(0.78 0.22 340)" strokeWidth="1.5" fill="none" strokeDasharray="4 4">
                  <path d="M85 130 Q140 90 220 150 Q260 220 200 290 Q140 320 100 260 Q70 200 85 130 Z"/>
                </g>
              </svg>

              <div className="topbar">
                <div className="pill"><Ic.Image size={12}/> {source ? `seed ${source.seed} · 832×1216` : 'source.png · 832×1216'}</div>
                <div style={{flex:1}}/>
                <button className="pill"><Ic.Undo size={13}/></button>
                <button className="pill"><Ic.Redo size={13}/></button>
                <button className="pill" style={{color:'var(--text)'}}><Ic.Maximize size={13}/></button>
              </div>

              <div className="toolbar">
                {[
                  ['brush', <Ic.Brush2 size={16}/>],
                  ['eraser', <Ic.Eraser size={16}/>],
                  ['lasso', <Ic.Lasso size={16}/>],
                  ['wand', <Ic.Wand size={16}/>],
                ].map(([id, icon]) => (
                  <button key={id} className={`tool ${tool===id?'active':''}`} onClick={() => setTool(id)}>{icon}</button>
                ))}
              </div>
            </div>

            <div className="cf-section" style={{paddingTop: 8}}>
              <div className="row between" style={{marginBottom: 8}}>
                <div className="label">Brush <span className="mute mono" style={{fontWeight:500, marginLeft: 4}}>{size}px</span></div>
                <Chips options={['S','M','L']} value={size <= 24 ? 'S' : size <= 60 ? 'M' : 'L'} onChange={v => setSize(v==='S'?16:v==='M'?48:96)}/>
              </div>
              <SliderRow value={size} min={4} max={120} onChange={setSize} displayValue={`${size}px`}/>
            </div>

            <div className="cf-section" style={{paddingTop: 4}}>
              <div className="row between" style={{marginBottom: 8}}>
                <div className="label">Denoise</div>
                <span className="mono" style={{fontSize: 12}}>{denoise}%</span>
              </div>
              <SliderRow value={denoise} min={0} max={100} onChange={setDenoise} displayValue={`${denoise}%`}/>
              <div className="dim" style={{fontSize: 10, marginTop: 6, display:'flex', justifyContent:'space-between'}}>
                <span>Subtle (0)</span>
                <span>Full repaint (100)</span>
              </div>
            </div>

            <div className="cf-section">
              <SectionTitle>Replace with</SectionTitle>
              <textarea className="cf-textarea" defaultValue="a wild iris, in shadow" style={{minHeight: 60}}/>
            </div>

            <div className="cf-section" style={{paddingBottom: 14}}>
              <div className="row" style={{gap: 8}}>
                <div className="cf-out-chip" style={{flex:1, justifyContent:'center'}}>
                  <Ic.Image size={14}/> Match source
                </div>
                <div className="cf-out-chip" style={{flex:1, justifyContent:'center'}}>
                  <Ic.Sparkle size={12}/> Soft edges
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'outpaint' && (
          <>
            <div className="cf-paint" style={{aspectRatio:'1/1'}}>
              <div className="layer" style={{
                background:'linear-gradient(160deg, oklch(0.18 0.05 280), oklch(0.32 0.10 320) 60%, oklch(0.42 0.18 30))',
              }}>
                <div style={{position:'absolute', inset:0, background:'repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,.05) 8px 9px)'}}/>
              </div>

              <div style={{
                position:'absolute', top:'20%', left:'15%', right:'15%', bottom:'20%',
                border:'2px dashed var(--cyan)', borderRadius: 4, opacity:.6,
              }}/>

              {[
                { dir:'top', active: outDirs.top, style:{top:8, left:'50%', transform:'translateX(-50%)'} },
                { dir:'bottom', active: outDirs.bottom, style:{bottom:8, left:'50%', transform:'translateX(-50%)'} },
                { dir:'left', active: outDirs.left, style:{left:8, top:'50%', transform:'translateY(-50%)'} },
                { dir:'right', active: outDirs.right, style:{right:8, top:'50%', transform:'translateY(-50%)'} },
              ].map(({dir, active, style}) => (
                <button key={dir} onClick={() => toggleDir(dir)} style={{
                  position:'absolute', ...style, zIndex: 2,
                  width: 36, height: 36, borderRadius: 10,
                  background: active ? 'var(--accent)' : 'rgba(11,13,18,.7)',
                  backdropFilter:'blur(14px)',
                  border: active ? '1px solid oklch(0.78 0.20 340)' : '1px solid rgba(255,255,255,.06)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color: active ? 'white' : 'var(--text-dim)',
                }}>
                  {dir === 'top' && <Ic.ArrowUp size={16}/>}
                  {dir === 'bottom' && <Ic.ArrowDown size={16}/>}
                  {dir === 'left' && <Ic.ArrowLeft size={16}/>}
                  {dir === 'right' && <Ic.ArrowRight size={16}/>}
                </button>
              ))}

              <div className="topbar">
                <div className="pill"><Ic.Image size={12}/> {source ? `seed ${source.seed} · 832×1216` : 'source.png · 832×1216'}</div>
                <div style={{flex:1}}/>
                <button className="pill"><Ic.Maximize size={13}/></button>
              </div>
            </div>

            <div className="cf-section" style={{paddingTop: 8}}>
              <div className="row between" style={{marginBottom: 8}}>
                <div className="label">Extend by</div>
                <span className="mono" style={{fontSize: 12}}>{outPx}px</span>
              </div>
              <SliderRow value={outPx} min={64} max={1024} step={64} onChange={setOutPx} displayValue={`${outPx}px`}/>
            </div>

            <div className="cf-section" style={{paddingTop: 4}}>
              <div className="row between" style={{marginBottom: 8}}>
                <div className="label">Denoise</div>
                <span className="mono" style={{fontSize: 12}}>{denoise}%</span>
              </div>
              <SliderRow value={denoise} min={0} max={100} onChange={setDenoise} displayValue={`${denoise}%`}/>
            </div>

            <div className="cf-section">
              <SectionTitle>Fill with</SectionTitle>
              <textarea className="cf-textarea" defaultValue="continue the landscape, matching lighting and atmosphere" style={{minHeight: 60}}/>
            </div>

            <div className="cf-section" style={{paddingBottom: 14}}>
              <div className="row" style={{gap: 6, flexWrap:'wrap'}}>
                <div style={{
                  padding:'6px 10px', borderRadius: 6, fontSize: 11, fontFamily:'var(--font-mono)',
                  background: outDirs.top ? 'var(--accent-soft)' : 'var(--panel-2)',
                  color: outDirs.top ? 'var(--accent)' : 'var(--text-mute)',
                  border: `1px solid ${outDirs.top ? 'var(--accent-line)' : 'var(--line)'}`,
                }}>↑ Top</div>
                <div style={{
                  padding:'6px 10px', borderRadius: 6, fontSize: 11, fontFamily:'var(--font-mono)',
                  background: outDirs.bottom ? 'var(--accent-soft)' : 'var(--panel-2)',
                  color: outDirs.bottom ? 'var(--accent)' : 'var(--text-mute)',
                  border: `1px solid ${outDirs.bottom ? 'var(--accent-line)' : 'var(--line)'}`,
                }}>↓ Bottom</div>
                <div style={{
                  padding:'6px 10px', borderRadius: 6, fontSize: 11, fontFamily:'var(--font-mono)',
                  background: outDirs.left ? 'var(--accent-soft)' : 'var(--panel-2)',
                  color: outDirs.left ? 'var(--accent)' : 'var(--text-mute)',
                  border: `1px solid ${outDirs.left ? 'var(--accent-line)' : 'var(--line)'}`,
                }}>← Left</div>
                <div style={{
                  padding:'6px 10px', borderRadius: 6, fontSize: 11, fontFamily:'var(--font-mono)',
                  background: outDirs.right ? 'var(--accent-soft)' : 'var(--panel-2)',
                  color: outDirs.right ? 'var(--accent)' : 'var(--text-mute)',
                  border: `1px solid ${outDirs.right ? 'var(--accent-line)' : 'var(--line)'}`,
                }}>→ Right</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'variations' && (
          <>
            <div style={{
              margin:'12px', aspectRatio:'3/4', borderRadius: 14,
              overflow:'hidden', position:'relative', background:'var(--panel-3)',
            }}>
              {source ? (
                <FakeImg palette={source.palette} seed={source.seed}/>
              ) : (
                <div style={{
                  position:'absolute', inset: 0,
                  background:`
                    radial-gradient(circle at 35% 30%, oklch(0.85 0.16 60) 0%, transparent 30%),
                    radial-gradient(ellipse at 60% 70%, oklch(0.55 0.18 320) 0%, transparent 50%),
                    linear-gradient(160deg, oklch(0.18 0.05 280), oklch(0.32 0.10 320) 60%, oklch(0.42 0.18 30))
                  `
                }}>
                  <div style={{position:'absolute', inset:0, background:'repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,.05) 8px 9px)'}}/>
                </div>
              )}
              <div style={{
                position:'absolute', top:10, left:10,
                background:'rgba(11,13,18,.7)', backdropFilter:'blur(14px)',
                border:'1px solid rgba(255,255,255,.06)',
                borderRadius: 8, padding:'6px 10px', fontSize: 11,
                fontFamily:'var(--font-mono)', color:'var(--text)',
                display:'flex', alignItems:'center', gap: 6,
              }}>
                <Ic.Image size={12}/> {source ? `seed ${source.seed} · 832×1216` : 'source.png · 832×1216'}
              </div>
              <div style={{
                position:'absolute', bottom:10, left:10, right:10,
                background:'rgba(11,13,18,.7)', backdropFilter:'blur(14px)',
                border:'1px solid rgba(255,255,255,.06)',
                borderRadius: 10, padding:'10px 12px',
                fontSize: 11, color:'var(--text-dim)', textAlign:'center',
              }}>
                Source image — variations will be generated from this
              </div>
            </div>

            <div className="cf-section" style={{paddingTop: 4}}>
              <div className="row between" style={{marginBottom: 8}}>
                <div className="label">Denoise</div>
                <span className="mono" style={{fontSize: 12}}>{denoise}%</span>
              </div>
              <SliderRow value={denoise} min={0} max={100} onChange={setDenoise} displayValue={`${denoise}%`}/>
              <div className="dim" style={{fontSize: 10, marginTop: 6, display:'flex', justifyContent:'space-between'}}>
                <span>Subtle variation (0)</span>
                <span>Wild reinterpret (100)</span>
              </div>
            </div>

            <div className="cf-section">
              <SectionTitle>Prompt override <span className="mute" style={{fontWeight:400, fontSize:11}}>(optional)</span></SectionTitle>
              <textarea className="cf-textarea" placeholder="Leave empty to use original prompt…" style={{minHeight: 60}}/>
            </div>
          </>
        )}
      </div>

      <Dock
        label={activeTab === 'inpaint' ? 'Inpaint' : activeTab === 'outpaint' ? 'Outpaint' : 'Generate Variations'}
        qty={activeTab === 'variations' ? varQty : 4}
        onQty={activeTab === 'variations' ? setVarQty : undefined}
        personal etaSec={12} gpu="Cloud GPU"
        onGpuClick={() => setBackendOpen(true)}
      />

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}/>
      <BackendSwitcher open={backendOpen} onClose={() => setBackendOpen(false)}/>
    </div>
  );
}
