// Personal · Variant 1: generation panel — community/credit UI removed.
// Now interactive: hamburger → drawer, Change → model picker, Add → LoRA picker, GPU → backend switcher
function VariantPersonalClassic() {
  const [modality, setModality] = React.useState('image');
  const [tab, setTab] = React.useState('t2i');
  const [aspect, setAspect] = React.useState('2:3');
  const [cfgPreset, setCfgPreset] = React.useState('Creative');
  const [stepsPreset, setStepsPreset] = React.useState('High');
  const [samplerPreset, setSamplerPreset] = React.useState('Fast');
  const [seedMode, setSeedMode] = React.useState('Custom');
  const [cfg, setCfg] = React.useState(3);
  const [steps, setSteps] = React.useState(40);
  const [clip, setClip] = React.useState(2);

  // Overlay state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [modelPickerOpen, setModelPickerOpen] = React.useState(false);
  const [loraPickerOpen, setLoraPickerOpen] = React.useState(false);
  const [backendOpen, setBackendOpen] = React.useState(false);

  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="brush" personal onMenu={() => setDrawerOpen(true)}/>
      <div className="cf-body">
        <div className="cf-section" style={{paddingTop: 12}}>
          <div className="cf-modality">
            <div className="mod-tabs">
              <button className={`mod-tab ${modality === 'image' ? 'active' : ''}`} onClick={() => setModality('image')}>
                <Ic.Image size={18}/>
              </button>
              <button className={`mod-tab ${modality === 'video' ? 'active' : ''}`} onClick={() => setModality('video')}>
                <Ic.Video size={18}/>
              </button>
              <button className={`mod-tab ${modality === 'music' ? 'active' : ''}`} onClick={() => setModality('music')}>
                <Ic.Music size={18}/>
              </button>
            </div>
            <div className="mode-pill">
              <span style={{flex:1, fontWeight: 500}}>Local pipeline</span>
              <span className="mono mute" style={{fontSize: 10}}>diffusers · cuda</span>
            </div>
          </div>
        </div>

        <div className="cf-section" style={{paddingTop: 14}}>
          <div className="cf-card" style={{padding: '14px 14px'}}>
            <div style={{fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em'}}>Create Image</div>
            <div className="dim" style={{fontSize: 12, marginTop: 2}}>Generate an AI image from text</div>
          </div>
        </div>

        <div className="cf-section" style={{paddingTop: 12}}>
          <div className="cf-tabs cf-tabs-scroll">
            <div className={`cf-tab ${tab === 't2i' ? 'active' : ''}`} onClick={() => setTab('t2i')}>Text → Image</div>
            <div className={`cf-tab ${tab === 'i2i' ? 'active' : ''}`} onClick={() => setTab('i2i')}>Image → Image</div>
            <div className={`cf-tab ${tab === 'inpaint' ? 'active' : ''}`} onClick={() => setTab('inpaint')}>Inpaint</div>
            <div className={`cf-tab ${tab === 'upscale' ? 'active' : ''}`} onClick={() => setTab('upscale')}>Upscale</div>
          </div>
        </div>

        {tab !== 't2i' && (
          <div className="cf-section">
            <div className="cf-card" style={{padding: 12}}>
              <div className="row between" style={{marginBottom: 8}}>
                <div className="label">Input image</div>
                <span className="dim" style={{fontSize: 11}}>required</span>
              </div>
              <div style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: 14, border: '1.5px dashed var(--line)', borderRadius: 8,
                background: 'var(--panel-2)'
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 6,
                  background: 'var(--panel-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Ic.Image size={22} color="var(--text-dim)"/>
                </div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 13, fontWeight: 500}}>Tap to choose</div>
                  <div className="dim" style={{fontSize: 11, marginTop: 2}}>From recent runs · gallery · file</div>
                </div>
              </div>
              {tab === 'i2i' && (
                <div style={{marginTop: 12}}>
                  <div className="row between" style={{marginBottom: 6}}>
                    <span className="label" style={{fontSize: 12}}>Denoise strength</span>
                    <span className="mono" style={{fontSize: 12}}>0.55</span>
                  </div>
                  <div style={{height: 4, borderRadius: 2, background: 'var(--panel-3)', position: 'relative'}}>
                    <div style={{position:'absolute', inset:'0 45% 0 0', background:'var(--cyan)', borderRadius: 2}}/>
                  </div>
                  <div className="dim" style={{fontSize: 10, marginTop: 6, display:'flex', justifyContent:'space-between'}}>
                    <span>Stay close (0)</span>
                    <span>Free reinterpret (1)</span>
                  </div>
                </div>
              )}
              {tab === 'inpaint' && (
                <div className="dim" style={{fontSize: 11, marginTop: 10, lineHeight: 1.5}}>
                  Tap Open editor to paint a mask on the regions to regenerate, then return here.
                </div>
              )}
              {tab === 'upscale' && (
                <div style={{marginTop: 12, display:'flex', gap: 6}}>
                  {['2×', '3×', '4×'].map((s, i) => (
                    <button key={s} className="cf-out-chip" style={{
                      flex: 1, justifyContent: 'center',
                      background: i === 0 ? 'var(--cyan-soft)' : undefined,
                      color: i === 0 ? 'var(--cyan)' : undefined,
                      borderColor: i === 0 ? 'var(--cyan)' : undefined,
                    }}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="cf-section">
          <SectionTitle>Model</SectionTitle>
          <div className="cf-model">
            <div className="thumb"/>
            <div className="meta">
              <div className="name">HomoSimile XL</div>
              <div className="ver">v4.0 · 6.4 GB · loaded</div>
            </div>
            <button onClick={() => setModelPickerOpen(true)} style={{background:'var(--cyan-soft)', color:'var(--cyan)', padding:'5px 10px', borderRadius:6, fontSize:11, fontWeight:600}}>Change</button>
          </div>
        </div>

        <div className="cf-section">
          <div className="cf-card" style={{padding: '12px 14px'}}>
            <div className="row between" style={{marginBottom: 6}}>
              <div className="label">LoRAs &amp; Embeddings</div>
              <button onClick={() => setLoraPickerOpen(true)} style={{display:'flex', alignItems:'center', gap:4, color:'var(--cyan)', fontSize:12, fontWeight: 600}}>
                <Ic.Plus size={12}/> Add
              </button>
            </div>
            <div className="cf-add-empty">None loaded · 312 available locally</div>
          </div>
        </div>

        <div className="cf-section">
          <SectionTitle required>Prompt</SectionTitle>
          <textarea className="cf-textarea" defaultValue="(prompt)" placeholder="Describe what you'd like to see…"/>
        </div>

        <div className="cf-section">
          <SectionTitle>Negative Prompt</SectionTitle>
          <input className="cf-input" defaultValue="(negative)"/>
        </div>

        <div className="cf-section">
          <SectionTitle>Aspect Ratio</SectionTitle>
          <AspectRatioRow value={aspect} onChange={setAspect}/>
        </div>

        <div className="cf-section">
          <SectionTitle>Output Settings</SectionTitle>
          <div className="cf-out-row">
            <button className="cf-out-chip"><Ic.Image size={14}/> PNG</button>
            <button className="cf-out-chip"><Ic.Brush size={14}/> High</button>
          </div>
        </div>

        <div className="cf-section" style={{paddingBottom: 14}}>
          <CollapsibleCard title="Advanced">
            <ParamRow
              label="CFG Scale"
              presets={['Creative','Balanced','Precise']}
              presetValue={cfgPreset}
              onPreset={setCfgPreset}
              slider={<SliderRow value={cfg} min={1} max={20} onChange={setCfg}/>}
            />
            <div>
              <div className="row between" style={{marginBottom: 10}}>
                <div className="label">Sampler <Ic.Info size={13}/></div>
                <Chips options={['Fast','Popular']} value={samplerPreset} onChange={setSamplerPreset}/>
              </div>
              <div className="cf-input row between" style={{cursor:'pointer'}}>
                <span>Euler a</span>
                <Ic.ChevDown size={14} color="var(--text-dim)"/>
              </div>
            </div>
            <ParamRow
              label="Steps"
              presets={['Fast','Balanced','High']}
              presetValue={stepsPreset}
              onPreset={setStepsPreset}
              slider={<SliderRow value={steps} min={10} max={60} onChange={setSteps}/>}
            />
            <div>
              <div className="label" style={{marginBottom: 10}}>Seed</div>
              <div className="row" style={{gap: 10}}>
                <div className="cf-pill-toggle">
                  <button className={seedMode==='Random'?'on':''} onClick={() => setSeedMode('Random')}>Random</button>
                  <button className={seedMode==='Custom'?'on':''} onClick={() => setSeedMode('Custom')}>Custom</button>
                </div>
                <input className="cf-input mono" style={{flex:1}} defaultValue="687051578"/>
              </div>
            </div>
            <ParamRow
              label="CLIP Skip"
              slider={<SliderRow value={clip} min={1} max={4} onChange={setClip}/>}
            />
            <div>
              <div className="label" style={{marginBottom: 10}}>VAE <Ic.Info size={13}/></div>
              <button className="cf-action-btn"><Ic.Plus size={14}/> Select VAE</button>
            </div>
          </CollapsibleCard>
        </div>
      </div>
      <Dock label="Generate" personal etaSec={18} gpu="Cloud GPU" onGpuClick={() => setBackendOpen(true)}/>

      {/* Overlays */}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}/>
      <ModelPicker open={modelPickerOpen} onClose={() => setModelPickerOpen(false)}/>
      <LoraPicker open={loraPickerOpen} onClose={() => setLoraPickerOpen(false)}/>
      <BackendSwitcher open={backendOpen} onClose={() => setBackendOpen(false)}/>
    </div>
  );
}

window.VariantPersonalClassic = VariantPersonalClassic;
