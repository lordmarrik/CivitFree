// Variant 3: Image-to-image / Inpainting editor.
// Shows the full editor canvas with mask overlay, brush tools,
// strength slider, and a compact prompt at the bottom.

function VariantInpaint() {
  const [tool, setTool] = React.useState('brush');
  const [size, setSize] = React.useState(48);
  const [strength, setStrength] = React.useState(72);

  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="brush"/>
      <div className="cf-body" style={{display:'flex', flexDirection:'column'}}>

        <div className="cf-section" style={{padding:'12px 16px 4px'}}>
          <div className="cf-tabs">
            <div className={`cf-tab active`}>Inpaint</div>
            <div className={`cf-tab`}>Outpaint</div>
            <div className={`cf-tab`}>Variations</div>
          </div>
        </div>

        <div className="cf-paint">
          {/* Base image */}
          <div className="layer" style={{
            background:`
              radial-gradient(circle at 35% 30%, oklch(0.85 0.16 60) 0%, transparent 30%),
              radial-gradient(ellipse at 60% 70%, oklch(0.55 0.18 320) 0%, transparent 50%),
              linear-gradient(160deg, oklch(0.18 0.05 280), oklch(0.32 0.10 320) 60%, oklch(0.42 0.18 30))
            `
          }}>
            <div style={{position:'absolute', inset:0, background:'repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,.05) 8px 9px)'}}/>
          </div>

          {/* Mask overlay — magenta brush strokes representing painted region */}
          <svg className="layer" viewBox="0 0 300 400" style={{mixBlendMode: 'normal'}}>
            <defs>
              <filter id="goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6"/>
                <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"/>
              </filter>
            </defs>
            <g filter="url(#goo)" fill="oklch(0.68 0.22 340 / .55)">
              <circle cx="120" cy="160" r="36"/>
              <circle cx="155" cy="170" r="40"/>
              <circle cx="180" cy="200" r="34"/>
              <circle cx="200" cy="240" r="28"/>
              <circle cx="170" cy="260" r="30"/>
              <circle cx="135" cy="220" r="32"/>
            </g>
            <g stroke="oklch(0.78 0.22 340)" strokeWidth="1.5" fill="none" strokeDasharray="4 4">
              <path d="M85 130 Q140 90 220 150 Q260 220 200 290 Q140 320 100 260 Q70 200 85 130 Z"/>
            </g>
          </svg>

          {/* Top pill: file info */}
          <div className="topbar">
            <div className="pill"><Ic.Image size={12}/> source.png · 832×1216</div>
            <div style={{flex:1}}/>
            <button className="pill"><Ic.Undo size={13}/></button>
          </div>

          {/* Strength */}
          <div className="strength">
            <span style={{color:'var(--text)', fontWeight: 600, letterSpacing:'.06em', fontSize: 10}}>DENOISE</span>
            <input type="range" className="cf-slider" style={{flex:1}}
              value={strength} min={0} max={100} onChange={e => setStrength(parseFloat(e.target.value))}/>
            <span style={{color:'var(--text)', minWidth: 32, textAlign:'right'}}>{strength}%</span>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <button className={`tool ${tool==='brush'?'active':''}`} onClick={() => setTool('brush')}><Ic.Brush2 size={16}/></button>
            <button className={`tool ${tool==='eraser'?'active':''}`} onClick={() => setTool('eraser')}><Ic.Eraser size={16}/></button>
            <button className={`tool ${tool==='lasso'?'active':''}`} onClick={() => setTool('lasso')}><Ic.Lasso size={16}/></button>
            <button className={`tool ${tool==='wand'?'active':''}`} onClick={() => setTool('wand')}><Ic.Wand size={16}/></button>
          </div>
        </div>

        {/* Brush size */}
        <div className="cf-section" style={{paddingTop: 0}}>
          <div className="row between" style={{marginBottom: 8}}>
            <div className="label">Brush <span className="mute mono" style={{fontWeight:500, marginLeft: 4}}>{size}px</span></div>
            <Chips options={['S','M','L']} value={size <= 24 ? 'S' : size <= 60 ? 'M' : 'L'} onChange={v => setSize(v==='S'?16:v==='M'?48:96)}/>
          </div>
          <SliderRow value={size} min={4} max={120} onChange={setSize} displayValue={`${size}px`}/>
        </div>

        {/* Prompt to apply */}
        <div className="cf-section">
          <SectionTitle action={<><Ic.Sparkle size={13}/> Enhance</>}>Replace with</SectionTitle>
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

      </div>
      <Dock label="Inpaint" qty={4} price={8}/>
    </div>
  );
}

window.VariantInpaint = VariantInpaint;
