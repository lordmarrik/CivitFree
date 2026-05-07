// Variant 1: Classic generation panel — everything visible
function VariantClassic({ tweaks }) {
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

  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="brush"/>
      <div className="cf-body">
        <div className="cf-section" style={{paddingTop: 12}}>
          <ModalityBar modality={modality} mode="Eco" onModality={setModality}/>
        </div>

        <div className="cf-section" style={{paddingTop: 14}}>
          <div className="cf-card" style={{padding: '14px 14px'}}>
            <div style={{fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em'}}>Create Image</div>
            <div className="dim" style={{fontSize: 12, marginTop: 2}}>Generate an AI image from text</div>
          </div>
        </div>

        <div className="cf-section" style={{paddingTop: 12}}>
          <div className="cf-tabs">
            <div className={`cf-tab ${tab === 't2i' ? 'active' : ''}`} onClick={() => setTab('t2i')}>Text to Image</div>
            <div className={`cf-tab ${tab === 'i2i' ? 'active' : ''}`} onClick={() => setTab('i2i')}>Image Variations</div>
          </div>
        </div>

        <div className="cf-section">
          <SectionTitle>Model</SectionTitle>
          <ModelCard/>
        </div>

        <div className="cf-section">
          <div className="cf-card" style={{padding: '12px 14px'}}>
            <div className="row between" style={{marginBottom: 6}}>
              <div className="label">Additional Resources <span className="mute mono" style={{fontSize: 11, fontWeight: 500, marginLeft: 4}}>0/12</span></div>
              <button style={{display:'flex', alignItems:'center', gap:4, color:'var(--cyan)', fontSize:12, fontWeight: 600}}>
                <Ic.Plus size={12}/> Add
              </button>
            </div>
            <div className="cf-add-empty">No resources selected</div>
          </div>
        </div>

        <div className="cf-section">
          <SectionTitle required action={<><Ic.Sparkle size={13}/> Enhance</>}>Prompt</SectionTitle>
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
            <button className="cf-out-chip"><Ic.Image size={14}/> JPEG</button>
            <button className="cf-out-chip">
              <Ic.Brush size={14}/>
              <span>High</span>
              <span className="bolt"><Ic.Bolt size={11}/></span>
              <span className="strike">10</span>
            </button>
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
            <div className="cf-notice">
              <div className="cf-checkbox"/>
              <div>
                <div className="nm">Enhanced Compatibility</div>
                <div className="desc">We've updated our generation engine for better performance, but older prompts may look different. Turn this on to make new generations look more like your earlier ones.</div>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
      <Dock label="Generate"/>
    </div>
  );
}

window.VariantClassic = VariantClassic;
