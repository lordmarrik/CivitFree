import React from 'react';
import { Ic } from '../shared/icons.jsx';
import { FakeImg } from '../shared/mockImages.jsx';
import { StatusBar, TopBar, Dock, SectionTitle } from '../shared/Shell.jsx';
import { SliderRow, ParamRow, CollapsibleCard, AspectRatioRow } from '../shared/controls.jsx';
import { SideDrawer } from '../components/Drawer.jsx';
import { ModelPicker, LoraPicker } from '../components/ModelPicker.jsx';
import { BottomSheet, SheetSection } from '../components/BottomSheet.jsx';
import { BackendSwitcher } from '../components/SortFilter.jsx';
import { submitWorkflow, waitForResult } from '../services/comfyClient.js';
import { buildTextToImageWorkflow, randomSeed } from '../services/buildWorkflow.js';
import { SAMPLER_OPTIONS } from '../services/samplerMap.js';
import { usePersisted } from '../shared/usePersisted.js';

function SoonBadge() {
  return <span className="cf-soon-badge">soon</span>;
}

export function VariantPersonalClassic({
  onTab,
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  loras = [],
  onAddLora,
  onUpdateLora,
  onRemoveLora,
  model,
  onModelChange,
  settings,
  onSettingsChange,
  pendingRemix,
  consumePendingSeed,
  consumePendingRemix,
}) {
  const [modality, setModality] = React.useState('image');
  const [tab, setTab] = React.useState('t2i');
  const [seedMode, setSeedMode] = usePersisted('seedMode', 'Random');
  const [seedInput, setSeedInput] = usePersisted('seedInput', '');
  const [clip] = React.useState(2);
  const [qty, setQty] = usePersisted('qty', 2);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [modelPickerOpen, setModelPickerOpen] = React.useState(false);
  const [loraPickerOpen, setLoraPickerOpen] = React.useState(false);
  const [backendOpen, setBackendOpen] = React.useState(false);
  const [samplerOpen, setSamplerOpen] = React.useState(false);
  const [soonNote, setSoonNote] = React.useState(null);

  // Generation params live in settings (single source of truth shared
  // with the Settings drawer); these helpers read/write through props.
  const cfg = settings?.cfg ?? 7;
  const steps = settings?.steps ?? 30;
  const sampler = settings?.sampler ?? 'Euler a';
  const setCfg = (v) => onSettingsChange && onSettingsChange({ cfg: v });
  const setSteps = (v) => onSettingsChange && onSettingsChange({ steps: v });
  const setSampler = (v) => onSettingsChange && onSettingsChange({ sampler: v });

  const ASPECT_TO_SIZE = { '2:3': '832×1216', '1:1': '1024×1024', '3:2': '1216×832' };
  const SIZE_TO_ASPECT = Object.fromEntries(Object.entries(ASPECT_TO_SIZE).map(([k, v]) => [v, k]));
  const aspect = SIZE_TO_ASPECT[settings?.size] ?? null;
  const setAspect = (a) => onSettingsChange && onSettingsChange({ size: ASPECT_TO_SIZE[a] });

  const safeModel = model || { name: 'HomoSimile XL', ver: 'v4.0', size: '6.4 GB', base: 'SDXL' };

  const [generating, setGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState(null);

  React.useEffect(() => {
    if (!pendingRemix) return;
    setTab('t2i');
    setSoonNote(null);
    setModality('image');
    const claimedSeed = consumePendingSeed && consumePendingSeed();
    if (typeof claimedSeed === 'number' && Number.isFinite(claimedSeed)) {
      setSeedMode('Custom');
      setSeedInput(String(claimedSeed));
    } else {
      setSeedMode('Random');
      setSeedInput('');
    }
    if (consumePendingRemix) consumePendingRemix();
  }, [pendingRemix, consumePendingRemix, consumePendingSeed]);

  const markSoon = (label) => {
    setSoonNote(`${label} is coming soon. Text→Image is the only wired workflow right now.`);
  };

  const selectFutureTab = (nextTab, label) => {
    setTab(nextTab);
    markSoon(label);
  };

  const handleGenerate = async () => {
    setGenError(null);
    if (tab !== 't2i') {
      setGenError('Only Text→Image is wired right now. This workflow is coming soon.');
      return;
    }
    const baseUrl = settings?.backendUrl;
    // Settings drawer's "Checkpoint filename" field is the authoritative
    // override — picking via ModelPicker writes through to it via
    // App.updateModel, and a manual edit there should also win. Fall
    // back to model.filename only if settings doesn't have one yet.
    const checkpoint = (settings?.checkpointFilename || '').trim() || (model && model.filename) || '';
    if (!baseUrl) {
      setGenError('Set the ComfyUI backend URL in Settings first.');
      return;
    }
    if (!checkpoint) {
      setGenError('Pick a checkpoint via the Model card (Change → list from your ComfyUI), or type a filename in Settings.');
      return;
    }
    if (!prompt || !prompt.trim()) {
      setGenError('Type a prompt before generating.');
      return;
    }
    const missingFilename = (loras || []).find(l => !l.filename || !l.filename.trim());
    if (missingFilename) {
      setGenError(
        `LoRA "${missingFilename.name}" needs its real ComfyUI filename ` +
        `(in the textbox under the strength slider). Or remove it.`
      );
      return;
    }

    let seed;
    if (seedMode === 'Custom') {
      const seedText = seedInput.trim();
      if (!/^\d+$/.test(seedText)) {
        setGenError('Enter a whole-number custom seed between 0 and 4294967295, or switch Seed to Random.');
        return;
      }
      const parsedSeed = Number(seedText);
      if (!Number.isInteger(parsedSeed) || parsedSeed < 0 || parsedSeed > 0xffffffff) {
        setGenError('Enter a whole-number custom seed between 0 and 4294967295, or switch Seed to Random.');
        return;
      }
      seed = parsedSeed;
    } else {
      seed = randomSeed();
    }
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
      batchSize: qty,
      loras: (loras || []).map(l => ({
        filename: l.filename.trim(),
        strength: l.strength ?? 0.8,
      })),
    });

    setGenerating(true);
    try {
      const submitRes = await submitWorkflow(baseUrl, workflow);
      const promptId = submitRes.prompt_id;
      const history = await waitForResult(baseUrl, promptId);
      const outputs = history?.outputs ?? {};
      if (Object.keys(outputs).length === 0) {
        throw new Error('Generation finished but ComfyUI returned no outputs.');
      }
      // Result is now visible on Screen B (Queue) and Screen C (Feed)
      // via the /history poll. Nothing to display inline.
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

        <div className="cf-section" style={{paddingTop: 12}}>
          <div className="cf-modality">
            <div className="mod-tabs">
              <button className={`mod-tab ${modality === 'image' ? 'active' : ''}`} onClick={() => setModality('image')}>
                <Ic.Image size={18}/>
              </button>
              <button className="mod-tab soon" disabled aria-label="Video generation coming soon">
                <Ic.Video size={18}/><SoonBadge/>
              </button>
              <button className="mod-tab soon" disabled aria-label="Music generation coming soon">
                <Ic.Music size={18}/><SoonBadge/>
              </button>
            </div>
            <div className="mode-pill">
              <span style={{flex:1, fontWeight: 500}}>Local pipeline</span>
              <span className="mono mute" style={{fontSize: 10}}>ComfyUI · local</span>
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
            <div className={`cf-tab ${tab === 't2i' ? 'active' : ''}`} onClick={() => { setTab('t2i'); setSoonNote(null); }}>Text → Image</div>
            <div className={`cf-tab ${tab === 'i2i' ? 'active' : ''} soon`} onClick={() => selectFutureTab('i2i', 'Image→Image')}>Image → Image <SoonBadge/></div>
            <div className={`cf-tab ${tab === 'inpaint' ? 'active' : ''} soon`} onClick={() => selectFutureTab('inpaint', 'Inpaint')}>Inpaint <SoonBadge/></div>
            <div className={`cf-tab ${tab === 'upscale' ? 'active' : ''} soon`} onClick={() => selectFutureTab('upscale', 'Upscale')}>Upscale <SoonBadge/></div>
          </div>
        </div>

        {soonNote && (
          <div className="cf-section" style={{paddingTop: 0, paddingBottom: 0}}>
            <div className="cf-soon-note">{soonNote}</div>
          </div>
        )}

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
                  <div style={{fontSize: 13, fontWeight: 500}}>Source picker coming soon</div>
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
                    <button key={s} className="cf-out-chip soon" style={{
                      flex: 1, justifyContent: 'center',
                      background: i === 0 ? 'var(--cyan-soft)' : undefined,
                      color: i === 0 ? 'var(--cyan)' : undefined,
                      borderColor: i === 0 ? 'var(--cyan)' : undefined,
                    }}>{s} <SoonBadge/></button>
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
              <div className="cf-add-empty">None loaded · Add local LoRAs from your ComfyUI</div>
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
                      onChange={s => onUpdateLora && onUpdateLora(l.id, { strength: s })}
                      displayValue={l.strength.toFixed(2)}
                    />
                    <input
                      className="cf-lora-filename"
                      value={l.filename ?? ''}
                      onChange={e => onUpdateLora && onUpdateLora(l.id, { filename: e.target.value })}
                      placeholder="filename, e.g. uggu_bang_xl.safetensors"
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      aria-label={`Filename for ${l.name}`}
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
            <button className="cf-out-chip soon" disabled><Ic.Image size={14}/> PNG <SoonBadge/></button>
          </div>
        </div>

        <div className="cf-section" style={{paddingBottom: 14}}>
          <CollapsibleCard title="Advanced">
            <ParamRow
              label="CFG Scale"
              slider={<SliderRow value={cfg} min={1} max={20} step={0.5} onChange={setCfg}/>}
            />
            <div>
              <div className="row between" style={{marginBottom: 10}}>
                <div className="label">Sampler <Ic.Info size={13}/></div>
              </div>
              <button className="cf-input row between" style={{cursor:'pointer', textAlign:'left'}} onClick={() => setSamplerOpen(true)}>
                <span>{sampler}</span>
                <Ic.ChevDown size={14} color="var(--text-dim)"/>
              </button>
            </div>
            <ParamRow
              label="Steps"
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
                  value={seedInput}
                  onChange={e => setSeedInput(e.target.value.replace(/[^0-9]/g, ''))}
                  disabled={seedMode === 'Random'}
                />
              </div>
            </div>
            <div>
              <div className="label" style={{marginBottom: 10}}>CLIP Skip <SoonBadge/></div>
              <div className="cf-input row between" style={{opacity: .65}}>
                <span>Not wired yet</span>
                <span className="mono mute">{clip}</span>
              </div>
            </div>
            <div>
              <div className="label" style={{marginBottom: 10}}>VAE <Ic.Info size={13}/></div>
              <button className="cf-action-btn soon"><Ic.Plus size={14}/> Select VAE <SoonBadge/></button>
            </div>
          </CollapsibleCard>
        </div>
      </div>
      <Dock
        label={tab === 't2i' ? 'Generate' : 'Coming soon'}
        personal
        gpu={settings?.backendProfile ? `Local ComfyUI · ${settings.backendProfile}` : 'Local ComfyUI'}
        status={tab === 't2i' ? 'ready' : 'soon'}
        qty={qty}
        onQty={setQty}
        onGpuClick={() => setBackendOpen(true)}
        onGenerate={tab === 't2i' ? handleGenerate : undefined}
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
        baseUrl={settings?.backendUrl}
        currentFilename={(settings?.checkpointFilename || '').trim() || safeModel?.filename}
      />
      <LoraPicker
        open={loraPickerOpen}
        onClose={() => setLoraPickerOpen(false)}
        onSelect={onAddLora}
        baseUrl={settings?.backendUrl}
      />
      <BottomSheet open={samplerOpen} onClose={() => setSamplerOpen(false)} title="Sampler">
        <SheetSection>
          {SAMPLER_OPTIONS.map(option => (
            <button
              key={option}
              className="cf-sheet-item"
              onClick={() => { setSampler(option); setSamplerOpen(false); }}
            >
              <span style={{flex: 1}}>{option}</span>
              {sampler === option && <Ic.Check size={16} color="var(--accent)"/>}
            </button>
          ))}
        </SheetSection>
      </BottomSheet>
      <BackendSwitcher open={backendOpen} onClose={() => setBackendOpen(false)} settings={settings} onSettingsChange={onSettingsChange}/>
    </div>
  );
}
