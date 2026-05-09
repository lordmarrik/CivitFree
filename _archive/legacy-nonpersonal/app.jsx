// App entry — wires variants into the design canvas.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#e056b3",
  "density": "regular",
  "showAnnotations": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply accent override
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
  }, [t.accent]);

  return (
    <>
      <DesignCanvas>
        <DCSection id="variants" title="CivitFree" subtitle="Mobile AI generation app — three flows in the same system">
          <DCArtboard id="classic" label="A · Generation panel" width={420} height={840}>
            <div style={{display:'flex', justifyContent:'center', padding:'15px 0'}}>
              <VariantClassic tweaks={t}/>
            </div>
          </DCArtboard>
          <DCArtboard id="gallery" label="B · Results & history" width={420} height={840}>
            <div style={{display:'flex', justifyContent:'center', padding:'15px 0'}}>
              <VariantGallery tweaks={t}/>
            </div>
          </DCArtboard>
          <DCArtboard id="inpaint" label="C · Inpainting editor" width={420} height={840}>
            <div style={{display:'flex', justifyContent:'center', padding:'15px 0'}}>
              <VariantInpaint tweaks={t}/>
            </div>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Theme"/>
        <TweakColor label="Accent" value={t.accent} onChange={v => setTweak('accent', v)}/>
        <TweakSection label="Layout"/>
        <TweakRadio label="Density" value={t.density}
          options={['compact','regular','comfy']}
          onChange={v => setTweak('density', v)}/>
        <TweakToggle label="Annotations" value={t.showAnnotations}
          onChange={v => setTweak('showAnnotations', v)}/>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
