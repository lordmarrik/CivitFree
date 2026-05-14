import React from 'react';
import { Ic } from '../shared/icons.jsx';
import { BottomSheet, SheetSection } from './BottomSheet.jsx';

export function SortSheet({ open, onClose, value = 'newest', onChange }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Sort by">
      <SheetSection>
        {[{id:'newest', label:'Newest first'}, {id:'oldest', label:'Oldest first'}].map(opt => (
          <button key={opt.id} className="cf-sheet-item" onClick={() => { onChange && onChange(opt.id); onClose && onClose(); }}>
            <span style={{flex:1}}>{opt.label}</span>
            {value === opt.id && <Ic.Check size={16} color="var(--accent)"/>}
          </button>
        ))}
      </SheetSection>
    </BottomSheet>
  );
}

export function FilterSheet({ open, onClose, filters, onChange }) {
  const current = filters || { favoritesOnly: false, hideFailed: false };
  const patch = (next) => onChange && onChange({ ...current, ...next });

  const toggleStyle = (on) => ({
    width: 36, height: 20, borderRadius: 999, position:'relative', cursor:'pointer',
    background: on ? 'var(--accent-soft)' : 'var(--panel-3)',
    boxShadow: on ? 'inset 0 0 0 1px var(--accent-line)' : 'none',
    flexShrink: 0,
  });
  const dotStyle = (on) => ({
    position:'absolute', top: 2, left: on ? 18 : 2,
    width: 16, height: 16, borderRadius: '50%',
    background: on ? 'var(--accent)' : 'var(--text-dim)',
    transition: 'left .18s, background .18s',
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Filters">
      <SheetSection>
        <div style={{padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <span style={{fontSize:14}}>Favorited only</span>
          <div style={toggleStyle(current.favoritesOnly)} onClick={() => patch({ favoritesOnly: !current.favoritesOnly })}>
            <div style={dotStyle(current.favoritesOnly)}/>
          </div>
        </div>
        <div style={{padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <span style={{fontSize:14}}>Hide failed</span>
          <div style={toggleStyle(current.hideFailed)} onClick={() => patch({ hideFailed: !current.hideFailed })}>
            <div style={dotStyle(current.hideFailed)}/>
          </div>
        </div>
      </SheetSection>
      <SheetSection label="Generation Type">
        <div style={{padding:'8px 16px 12px', display:'flex', gap: 6, flexWrap:'wrap'}}>
          {['All','Text→Image','Image→Image','Inpaint','Upscale'].map((t, i) => (
            <button key={t} className={`cf-chip ${i === 0 ? 'active' : 'soon'}`} style={{fontSize:12}}>
              {t}{i > 0 && <span className="cf-soon-badge">soon</span>}
            </button>
          ))}
        </div>
      </SheetSection>
      <SheetSection label="Model">
        <div style={{padding:'8px 16px 12px'}}>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'var(--panel-2)', border:'1px solid var(--line)', borderRadius: 8,
            padding:'10px 12px', fontSize: 13,
          }}>
            <span style={{color:'var(--text-dim)'}}>All models</span>
            <span className="cf-sheet-soon">soon</span>
          </div>
        </div>
      </SheetSection>
      <SheetSection label="Date Range">
        <div style={{padding:'8px 16px 12px', display:'flex', gap: 6}}>
          {['All time','Today','This week','This month'].map((d, i) => (
            <button key={d} className={`cf-chip ${i === 0 ? 'active' : 'soon'}`} style={{fontSize:11, padding:'5px 8px'}}>
              {d}{i > 0 && <span className="cf-soon-badge">soon</span>}
            </button>
          ))}
        </div>
      </SheetSection>
      <div style={{padding:'12px 16px'}}>
        <button style={{
          width:'100%', padding:'12px', borderRadius: 10,
          background:'var(--accent)', color:'white', fontWeight: 600, fontSize: 14,
        }} onClick={onClose}>Apply Filters</button>
      </div>
    </BottomSheet>
  );
}

export function BackendSwitcher({ open, onClose, settings, onSettingsChange }) {
  const backend = settings?.backendProfile || 'local';
  const isLocalActive = backend !== 'cloud';
  const setBackend = (id) => {
    if (id === 'local') onSettingsChange && onSettingsChange({ backendProfile: backend === 'cloud' ? 'local' : backend });
  };
  return (
    <BottomSheet open={open} onClose={onClose} title="Backend">
      <SheetSection>
        {[
          { id:'local', icon: <Ic.Cpu size={18}/>, label:'Local ComfyUI', sub: settings?.backendUrl || 'Set backend URL in Settings', status:'active', statusColor:'var(--good)' },
          { id:'cloud', icon: <Ic.Cloud size={18}/>, label:'Cloud GPU', sub:'Remote execution is not wired yet', status:'soon', statusColor:'var(--warn)', soon: true },
        ].map(opt => (
          <button key={opt.id} className={`cf-sheet-item ${opt.soon ? 'soon' : ''}`} onClick={() => setBackend(opt.id)} style={{
            background: (opt.id === 'local' ? isLocalActive : backend === opt.id) ? 'var(--panel-2)' : 'transparent',
            borderLeft: (opt.id === 'local' ? isLocalActive : backend === opt.id) ? '3px solid var(--accent)' : '3px solid transparent',
          }}>
            <span style={{color: (opt.id === 'local' ? isLocalActive : backend === opt.id) ? 'var(--text)' : 'var(--text-dim)'}}>{opt.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight: 600}}>{opt.label}</div>
              <div className="mono mute" style={{fontSize:11, marginTop:2}}>{opt.sub}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <span className="mono" style={{fontSize:10, color: opt.statusColor}}>{opt.status}</span>
              {opt.soon ? <div className="cf-sheet-soon" style={{marginTop:4}}>soon</div> : isLocalActive && <div style={{marginTop:4}}><Ic.Check size={14} color="var(--accent)"/></div>}
            </div>
          </button>
        ))}
      </SheetSection>
    </BottomSheet>
  );
}
