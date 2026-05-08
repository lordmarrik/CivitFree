import React from 'react';
import { Ic } from '../shared/icons.jsx';
import { testConnection } from '../services/comfyClient.js';
import { useComfyList } from '../shared/useComfyList.js';

/**
 * Strip the file extension and try to split off a trailing _vXX so the
 * onboarding model card looks tidy without lying.
 */
function deriveDisplay(filename) {
  if (!filename) return { name: '', ver: '' };
  const stem = filename.replace(/\.[^.]+$/, '');
  const verMatch = stem.match(/[_-](v[\d.]+(?:[_-][\w]+)?)$/i);
  const name = verMatch ? stem.slice(0, verMatch.index) : stem;
  const ver = verMatch ? verMatch[1] : '';
  return { name, ver };
}

export function OnboardingFlow({ open, onClose, settings, onSettingsChange, onModelChange }) {
  const [step, setStep] = React.useState(1);
  const [url, setUrl] = React.useState(() => settings?.backendUrl ?? 'http://192.168.1.42:8188');
  const [testing, setTesting] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [testError, setTestError] = React.useState(null);
  const [selectedFilename, setSelectedFilename] = React.useState(() => settings?.checkpointFilename ?? '');

  const { items: checkpoints, loading: loadingCheckpoints, error: checkpointsError, reload: reloadCheckpoints }
    = useComfyList('checkpoints', url, { enabled: open && step === 2 });

  if (!open) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestError(null);
    setConnected(false);
    try {
      await testConnection(url);
      setConnected(true);
    } catch (err) {
      setTestError(err?.message || String(err));
      if (err?.hint) setTestError(prev => prev + '\n' + err.hint);
    } finally {
      setTesting(false);
    }
  };

  const handleDone = () => {
    const filename = selectedFilename.trim();
    const display = deriveDisplay(filename);
    if (onSettingsChange) {
      onSettingsChange({
        backendUrl: url,
        checkpointFilename: filename,
        defaultModelName: display.name + (display.ver ? ` ${display.ver}` : ''),
      });
    }
    if (onModelChange && filename) {
      onModelChange({
        name: display.name || filename,
        ver: display.ver || '',
        size: '',
        base: 'Checkpoint',
        filename,
      });
    }
    onClose && onClose();
  };

  const canFinish = selectedFilename.trim().length > 0;

  return (
    <div style={{
      position:'absolute', inset: 0, zIndex: 80,
      background:'var(--bg-canvas)',
      display:'flex', flexDirection:'column',
      animation:'cf-fade-in .15s ease-out',
    }}>
      <div style={{padding:'20px 18px 0', flexShrink: 0}}>
        <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 20}}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background:'linear-gradient(155deg, oklch(0.32 0.04 250), oklch(0.22 0.04 250))',
            boxShadow:'inset 0 0 0 1px oklch(0.42 0.04 250 / .8)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{fontFamily:'var(--font-mono)', fontWeight:700, fontSize:14, color:'white'}}>CF</span>
          </div>
          <div>
            <div style={{fontWeight: 700, fontSize: 18, letterSpacing:'-0.01em'}}>Welcome to CivitFree</div>
            <div className="mute" style={{fontSize: 12, marginTop: 2}}>Let's connect to your backend</div>
          </div>
        </div>
        <div style={{display:'flex', gap: 6, marginBottom: 16}}>
          <div style={{flex:1, height: 3, borderRadius: 2, background: 'var(--accent)'}}/>
          <div style={{flex:1, height: 3, borderRadius: 2, background: step >= 2 ? 'var(--accent)' : 'var(--panel-3)'}}/>
        </div>
      </div>

      {step === 1 && (
        <div style={{flex:1, padding:'0 18px', display:'flex', flexDirection:'column'}}>
          <div style={{fontSize: 16, fontWeight: 600, marginBottom: 6}}>Backend Connection</div>
          <div className="dim" style={{fontSize: 13, marginBottom: 20, lineHeight: 1.5}}>
            Enter your ComfyUI server address. Make sure it's running and accessible.
          </div>

          <div style={{fontSize: 12, fontWeight: 600, color:'var(--text-dim)', marginBottom: 6}}>ComfyUI URL</div>
          <input
            style={{
              width:'100%', background:'var(--panel)', border:'1px solid var(--line)',
              borderRadius: 10, padding:'12px 14px', color:'var(--text)', fontSize: 14,
              fontFamily:'var(--font-mono)',
            }}
            value={url} onChange={e => setUrl(e.target.value)}
            spellCheck={false} autoCapitalize="off" autoCorrect="off"
          />

          {connected && (
            <div style={{
              display:'flex', alignItems:'center', gap: 8,
              padding:'10px 12px', marginTop: 12, borderRadius: 8,
              background:'oklch(0.40 0.10 165 / .15)', border:'1px solid oklch(0.50 0.12 165 / .3)',
            }}>
              <Ic.Check size={16} color="var(--good)"/>
              <span style={{fontSize: 13, color:'var(--good)', fontWeight: 500}}>Connected successfully</span>
            </div>
          )}

          {testing && (
            <div style={{
              display:'flex', alignItems:'center', gap: 8,
              padding:'10px 12px', marginTop: 12, borderRadius: 8,
              background:'var(--panel-2)',
            }}>
              <div style={{
                width: 16, height: 16, borderRadius:'50%',
                border:'2px solid var(--text-dim)', borderTopColor:'var(--accent)',
                animation:'cf-spin .8s linear infinite',
              }}/>
              <span style={{fontSize: 13, color:'var(--text-dim)'}}>Testing connection…</span>
            </div>
          )}

          {testError && (
            <div style={{
              padding:'10px 12px', marginTop: 12, borderRadius: 8,
              background:'oklch(0.30 0.12 25 / .15)', border:'1px solid oklch(0.45 0.18 25 / .35)',
              color:'var(--bad)', fontSize: 12, lineHeight: 1.5,
              whiteSpace:'pre-wrap', wordBreak:'break-word',
            }}>
              <strong style={{display:'block', marginBottom: 4}}>Couldn't reach ComfyUI</strong>
              {testError}
            </div>
          )}

          <div style={{flex:1}}/>

          <div style={{padding:'16px 0 24px', display:'flex', gap: 8}}>
            <button onClick={handleTest} style={{
              flex:1, padding:'13px', borderRadius: 10,
              background:'var(--panel)', border:'1px solid var(--line)',
              fontWeight: 600, fontSize: 14, color:'var(--text)',
            }}>Test Connection</button>
            <button onClick={() => connected && setStep(2)} style={{
              flex:1, padding:'13px', borderRadius: 10,
              background: connected ? 'var(--accent)' : 'var(--panel-3)',
              fontWeight: 600, fontSize: 14,
              color: connected ? 'white' : 'var(--text-mute)',
              opacity: connected ? 1 : 0.6,
            }}>Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{flex:1, padding:'0 18px', display:'flex', flexDirection:'column'}}>
          <div style={{fontSize: 16, fontWeight: 600, marginBottom: 6}}>Pick a checkpoint</div>
          <div className="dim" style={{fontSize: 13, marginBottom: 16, lineHeight: 1.5}}>
            Loaded from your ComfyUI's <code>models/checkpoints/</code> folder.
          </div>

          <div style={{flex:1, overflow:'auto'}}>
            {loadingCheckpoints && (
              <div style={{padding:'40px 0', textAlign:'center', color:'var(--text-dim)', fontSize: 13, display:'flex', flexDirection:'column', alignItems:'center', gap: 10}}>
                <div style={{
                  width: 18, height: 18, borderRadius:'50%',
                  border:'2px solid var(--text-dim)', borderTopColor:'var(--accent)',
                  animation:'cf-spin .8s linear infinite',
                }}/>
                Loading from ComfyUI…
              </div>
            )}

            {checkpointsError && !loadingCheckpoints && (
              <div style={{display:'flex', flexDirection:'column', gap: 10}}>
                <div style={{
                  padding:'10px 12px', borderRadius: 8,
                  background:'oklch(0.30 0.12 25 / .15)', border:'1px solid oklch(0.45 0.18 25 / .35)',
                  color:'var(--bad)', fontSize: 12, lineHeight: 1.5, whiteSpace:'pre-wrap',
                }}>
                  <strong style={{display:'block', marginBottom: 4}}>Couldn't list checkpoints</strong>
                  {checkpointsError.message || String(checkpointsError)}
                  {checkpointsError.hint && <div style={{marginTop: 4}}>{checkpointsError.hint}</div>}
                </div>
                <button onClick={reloadCheckpoints} style={{
                  alignSelf:'flex-start', padding:'8px 12px', borderRadius: 8,
                  background:'var(--panel-2)', border:'1px solid var(--line)',
                  color:'var(--text)', fontSize: 12, fontWeight: 600,
                }}>Retry</button>
              </div>
            )}

            {!loadingCheckpoints && !checkpointsError && checkpoints.length === 0 && (
              <div style={{padding:'40px 0', textAlign:'center', color:'var(--text-mute)', fontSize: 13}}>
                No checkpoints found in <code>models/checkpoints/</code>.
              </div>
            )}

            {!loadingCheckpoints && !checkpointsError && checkpoints.map(filename => {
              const display = deriveDisplay(filename);
              const active = selectedFilename === filename;
              return (
                <button key={filename} onClick={() => setSelectedFilename(filename)} style={{
                  display:'flex', gap: 10, alignItems:'center', width:'100%',
                  background: active ? 'var(--panel-2)' : 'var(--panel)',
                  border: `1px solid ${active ? 'var(--cyan)' : 'var(--line)'}`,
                  borderRadius: 10, padding:'10px 12px', marginBottom: 6, textAlign:'left',
                }}>
                  <div style={{
                    width:40, height:40, borderRadius: 8, flexShrink: 0,
                    background:'linear-gradient(135deg, oklch(0.32 0.10 290), oklch(0.18 0.06 320))',
                  }}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                      {display.name || filename}
                    </div>
                    <div className="mono mute" style={{fontSize:10, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                      {filename}
                    </div>
                  </div>
                  {active && <Ic.Check size={16} color="var(--cyan)"/>}
                </button>
              );
            })}
          </div>

          <div style={{padding:'16px 0 24px'}}>
            <button
              onClick={canFinish ? handleDone : undefined}
              disabled={!canFinish}
              style={{
                width:'100%', padding:'14px', borderRadius: 10,
                background: canFinish ? 'var(--accent)' : 'var(--panel-3)',
                color: canFinish ? 'white' : 'var(--text-mute)',
                fontWeight: 600, fontSize: 15,
                opacity: canFinish ? 1 : 0.6,
                cursor: canFinish ? 'pointer' : 'not-allowed',
              }}
            >
              Done — Start Creating
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
