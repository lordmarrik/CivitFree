import React from 'react';
import { Ic } from '../shared/icons.jsx';
import { FakeImg } from '../shared/mockImages.jsx';
import { StatusBar, TopBar, Dock, SectionTitle } from '../shared/Shell.jsx';
import { Chips, SliderRow, ParamRow, CollapsibleCard, AspectRatioRow } from '../shared/controls.jsx';
import { SideDrawer } from '../components/Drawer.jsx';
import { ModelPicker, LoraPicker } from '../components/ModelPicker.jsx';
import { BackendSwitcher } from '../components/SortFilter.jsx';
import {
  submitWorkflow,
  waitForResult,
  imageUrl as comfyImageUrl,
  extractImagesFromHistory,
} from '../services/comfyClient.js';
import { buildTextToImageWorkflow, randomSeed } from '../services/buildWorkflow.js';

export function VariantPersonalClassic({
  onTab,
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  loras = [],
  onAddLora,
  onUpdateLoraStrength,
  onRemoveLora,
  model,
  onModelChange,
  settings,
  onSettingsChange,
}) {
  const [modality, setModality] = React.useState('image');
  const [tab, setTab] = React.useState('t2i');
  const [aspect, setAspect] = React.useState('2:3');
  const [seedMode, setSeedMode] = React.useState('Custom');
  const [cfg, setCfg] = React.useState(3);
  const [steps, setSteps] = React.useState(40);
  const [sampler, setSampler] = React.useState('Euler a');
  const [clip, setClip] = React.useState(2);
  const [qty, setQty] = React.useState(2);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [modelPickerOpen, setModelPickerOpen] = React.useState(false);
  const [loraPickerOpen, setLoraPickerOpen] = React.useState(false);
  const [backendOpen, setBackendOpen] = React.useState(false);

  const CFG_PRESETS = { Creative: 3, Balanced: 7, Precise: 12 };
  const STEPS_PRESETS = { Fast: 20, Balanced: 30, High: 50 };
  const SAMPLER_PRESETS = { Fast: 'Euler a', Popular: 'DPM++ 2M Karras' };

  const cfgPreset = Object.keys(CFG_PRESETS).find(k => CFG_PRESETS[k] === cfg) || null;
  const stepsPreset = Object.keys(STEPS_PRESETS).find(k => STEPS_PRESETS[k] === steps) || null;
  const samplerPreset = Object.keys(SAMPLER_PRESETS).find(k => SAMPLER_PRESETS[k] === sampler) || null;

  const safeModel = model || { name: 'HomoSimile XL', ver: 'v4.0', size: '6.4 GB', base: 'SDXL' };

  const [generating, setGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState(null);
  const [latestResult, setLatestResult] = React.useState(null);

  const handleGenerate = async () => {
    setGenError(null);
    const baseUrl = settings?.backendUrl;
    const checkpoint = settings?.checkpointFilename;
    if (!baseUrl) {
      setGenError('Set the ComfyUI backend URL in Settings first.');
      return;
    }
    if (!checkpoint) {
      setGenError('Set the Checkpoint filename in Settings first (the actual file in your ComfyUI models/checkpoints folder).');
      return;
    }
    if (!prompt || !prompt.trim()) {
      setGenError('Type a prompt before generating.');
      return;
    }

    const seed = randomSeed();
    const workflow = buildTextToImageWorkflow({
      checkpointFilename: checkpoint,
      prompt,
      negativePrompt,
      sampler,
      scheduler: settings?.scheduler ?? 'Normal',
      cfg,
      steps,
      seed,
      size: settings?.size ?? '832×1216',
      loras: (loras || []).map(l => ({
        filename: l.filename || l.name,
        strength: l.strength ?? 0.8,
      })),
    });

    setGenerating(true);
    try {
      const submitRes = await submitWorkflow(baseUrl, workflow);
      const promptId = submitRes.prompt_id;
      const history = await waitForResult(baseUrl, promptId);
      const images = extractImagesFromHistory(history);
      if (images.length === 0) {
        throw new Error('Generation finished but ComfyUI returned no images.');
      }
      const first = images[0];
      setLatestResult({
        url: comfyImageUrl(baseUrl, first),
        filename: first.filename,
        seed,
        prompt,
        promptId,
      });
    } catch (err) {
      const msg = err?.message || String(err);
      const hint = err?.hint ? `\n${err.hint}` : '';
      setGenError(msg + hint);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="brush" personal onMenu={() => setDrawerOpen(true)} onTab={onTab}/>
      <div className="cf-body">
        {genError && (
          <div className="cf-section" style={{paddingTop: 12, paddingBottom: 0}}>
            <div className="cf-error-banner">
              <strong>Generate failed</strong>
              <span>{genError}</span>
              <button onClick={() => setGenError(null)} aria-label="Dismiss"><Ic.X size={14}/></button>
            </div>
          </div>
        )}

        {latestResult && (
          <div className="cf-section" style={{paddingTop: 12, paddingBottom: 0}}>
            <div className="cf-result-card">
              <img src={latestResult.url} alt={`Result · seed ${latestResult.seed}`}/>
              <div className="meta">
                <span className="label">Latest result</span>
                <span className="seed mono">seed {latestResult.seed}</span>
                <button onClick={() => setLatestResult(null)} className="dismiss" aria-label="Dismiss result">
                  <Ic.X size={14}/>
                </button>
              </div>
            </div>
          </div>
        )}

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
              <span className="mono mute" style={{fontSize: 10}}>ComfyUI · CUDA</span>
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
              <div className="name">{safeModel.name}</div>
              <div className="ver">
                {safeModel.ver}
                {safeModel.size ? ` · ${safeModel.size}` : ''}
                {' · '}{safeModel.base || 'loaded'}
              </div>
            </div>
            <button onClick={() => setModelPickerOpen(true)} style={{background:'var(--cyan-soft)', color:'var(--cyan)', padding:'5px 10px', borderRadius:6, fontSize:11, fontWeight:600}}>Change</button>
          </div>
        </div>

        <div className="cf-section">
          <div className="cf-card" style={{padding: '12px 14px'}}>
            <div className="row between" style={{marginBottom: loras.length ? 10 : 6}}>
              <div className="label">
                <span>Additional Resources</span>
                {loras.length > 0 && (
                  <span className="mute mono" style={{fontSize: 11, marginLeft: 6, fontWeight: 500}}>
                    {loras.length}/12
                  </span>
                )}
              </div>
              <button onClick={() => setLoraPickerOpen(true)} style={{display:'flex', alignItems:'center', gap:4, color:'var(--cyan)', fontSize:12, fontWeight: 600}}>
                <Ic.Plus size={12}/> Add
              </button>
            </div>
            {loras.length === 0 ? (
              <div className="cf-add-empty">None loaded · 312 available locally</div>
            ) : (
              <>
                <div className="cf-lora-section-label">LoRA</div>
                {loras.map(l => (
                  <div key={l.id} className="cf-lora-row">
                    <div className="head">
                      <div className="thumb"><FakeImg palette={l.palette} seed={l.seed}/></div>
                      <div className="meta">
                        <div className="name">{l.name}</div>
                        <div className="ver">({l.ver})</div>
                      </div>
                      <button
                        className="remove"
                        onClick={() => onRemoveLora && onRemoveLora(l.id)}
                        aria-label={`Remove ${l.name}`}
                      >
                        <Ic.X size={14}/>
                      </button>
                    </div>
                    <SliderRow
                      value={l.strength}
                      min={0} max={1} step={0.05}
                      onChange={s => onUpdateLoraStrength && onUpdateLoraStrength(l.id, s)}
                      displayValue={l.strength.toFixed(2)}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="cf-section">
          <SectionTitle required>Prompt</SectionTitle>
          <textarea
            className="cf-textarea"
            value={prompt ?? ''}
            onChange={e => onPromptChange && onPromptChange(e.target.value)}
            placeholder="Describe what you'd like to see…"
          />
        </div>

        <div className="cf-section">
          <SectionTitle>Negative Prompt</SectionTitle>
          <input
            className="cf-input"
            value={negativePrompt ?? ''}
            onChange={e => onNegativePromptChange && onNegativePromptChange(e.target.value)}
            placeholder="e.g. blurry, low quality, deformed"
          />
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
              onPreset={(p) => setCfg(CFG_PRESETS[p])}
              slider={<SliderRow value={cfg} min={1} max={20} onChange={setCfg}/>}
            />
            <div>
              <div className="row between" style={{marginBottom: 10}}>
                <div className="label">Sampler <Ic.Info size={13}/></div>
                <Chips
                  options={['Fast','Popular']}
                  value={samplerPreset}
                  onChange={(p) => setSampler(SAMPLER_PRESETS[p])}
                />
              </div>
              <div className="cf-input row between" style={{cursor:'pointer'}}>
                <span>{sampler}</span>
                <Ic.ChevDown size={14} color="var(--text-dim)"/>
              </div>
            </div>
            <ParamRow
              label="Steps"
              presets={['Fast','Balanced','High']}
              presetValue={stepsPreset}
              onPreset={(p) => setSteps(STEPS_PRESETS[p])}
              slider={<SliderRow value={steps} min={10} max={60} onChange={setSteps}/>}
            />
            <div>
              <div className="label" style={{marginBottom: 10}}>Seed</div>
              <div className="row" style={{gap: 10}}>
                <div className="cf-pill-toggle">
                  <button className={seedMode==='Random'?'on':''} onClick={() => setSeedMode('Random')}>Random</button>
                  <button className={seedMode==='Custom'?'on':''} onClick={() => setSeedMode('Custom')}>Custom</button>
                </div>
                <input
                  className="cf-input mono"
                  style={{flex:1}}
                  placeholder={seedMode === 'Random' ? 'auto' : 'enter seed…'}
                  disabled={seedMode === 'Random'}
                />
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
      <Dock
        label="Generate"
        personal
        etaSec={18}
        gpu="Cloud GPU"
        qty={qty}
        onQty={setQty}
        onGpuClick={() => setBackendOpen(true)}
        onGenerate={handleGenerate}
        generating={generating}
      />

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
      <ModelPicker
        open={modelPickerOpen}
        onClose={() => setModelPickerOpen(false)}
        onSelect={onModelChange}
      />
      <LoraPicker
        open={loraPickerOpen}
        onClose={() => setLoraPickerOpen(false)}
        onSelect={onAddLora}
      />
      <BackendSwitcher open={backendOpen} onClose={() => setBackendOpen(false)}/>
    </div>
  );
}
