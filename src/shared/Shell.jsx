import React from 'react';
import { Ic } from './icons.jsx';

export function StatusBar({ time = '14:22' }) {
  return (
    <div className="cf-statusbar">
      <span>{time}</span>
      <span className="right">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" opacity=".5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" opacity=".3"/>
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M1 3.5C3 1.5 5.5 .5 8 .5s5 1 7 3" strokeLinecap="round"/>
          <path d="M3.5 5.5C4.8 4.4 6.4 3.8 8 3.8s3.2.6 4.5 1.7" strokeLinecap="round"/>
          <circle cx="8" cy="9" r="1.2" fill="currentColor"/>
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none" stroke="currentColor" strokeWidth="0.8">
          <rect x="0.5" y="0.5" width="20" height="10" rx="2"/>
          <rect x="2" y="2" width="14" height="7" rx="1" fill="currentColor"/>
          <rect x="21" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor"/>
        </svg>
      </span>
    </div>
  );
}

export function TopBar({ active = 'brush', settings = false, onTab, personal = false, onMenu, onBookmark }) {
  const tab = (key, icon) => (
    <button className={`cf-icon-btn ${active === key ? 'active' : ''}`} onClick={() => onTab && onTab(key)}>
      {icon}
    </button>
  );
  return (
    <div className="cf-topbar">
      <div className="cf-logo" onClick={onMenu} style={personal ? {background: 'linear-gradient(155deg, oklch(0.32 0.04 250), oklch(0.22 0.04 250))', boxShadow:'inset 0 0 0 1px oklch(0.42 0.04 250 / .8)', cursor:'pointer'} : null}>
        {personal ? <Ic.Menu size={18}/> : 'CF'}
      </div>
      <button className="cf-icon-btn" title="Presets" onClick={onBookmark}><Ic.Bookmark size={18}/></button>
      {!personal && <button className="cf-icon-btn"><Ic.Help size={18}/></button>}
      {personal && <span style={{fontSize: 13, fontWeight: 600, marginLeft: 4, letterSpacing: '-0.01em'}}>CivitFree <span className="mute mono" style={{fontWeight: 500, fontSize: 10, marginLeft: 4}}>local</span></span>}
      <div style={{flex: 1}}/>
      {tab('brush', <Ic.Brush size={18}/>)}
      {tab('clock', <Ic.Clock size={18}/>)}
      {tab('grid', <Ic.Grid size={16}/>)}
      {!personal && <>
        <div style={{width: 4}}/>
        <div className={`cf-toggle-pill ${settings ? 'on' : ''}`}/>
      </>}
    </div>
  );
}

export function Dock({ qty = 2, price = 5, label = 'Generate', personal = false, etaSec, gpu, onGpuClick, onQty }) {
  return (
    <div className="cf-dock">
      <div className="cf-dock-row1" onClick={personal ? onGpuClick : undefined} style={personal ? {cursor:'pointer'} : undefined}>
        {personal ? (
          <>
            <span className="mono mute" style={{fontSize: 11}}>{gpu || 'Cloud GPU'}</span>
            <span className="cf-link" style={{color:'var(--text-dim)'}}>·</span>
            <span className="mono" style={{fontSize: 11, color: 'var(--good)'}}>idle</span>
            <div style={{flex:1}}/>
            <span className="mono mute" style={{fontSize: 11}}>~{etaSec || 18}s</span>
          </>
        ) : (
          <>
            <div className="cf-queue-bar">
              {Array.from({length: 14}).map((_, i) => (
                <div key={i} className={`seg ${i < 3 ? 'lit' : ''}`}/>
              ))}
            </div>
            <span className="cf-link">View queue</span>
            <span className="cf-breakdown">Breakdown <Ic.Info size={12}/></span>
          </>
        )}
      </div>
      {personal && (
        <div style={{display:'flex', alignItems:'center', gap: 10, padding:'0 0 8px', marginBottom: 2}}>
          <span className="mono mute" style={{fontSize: 11, flexShrink: 0}}>QTY</span>
          <div style={{
            flex: 1, display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'var(--panel)', border:'1px solid var(--line)', borderRadius: 10,
            padding:'8px 10px', fontFamily:'var(--font-mono)', fontSize: 15, fontWeight: 600
          }}>
            <button
              style={{width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-dim)'}}
              onClick={() => onQty && onQty(Math.max(1, qty - 1))}
            >
              <Ic.Minus size={14}/>
            </button>
            <span>{qty}</span>
            <button
              style={{width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-dim)'}}
              onClick={() => onQty && onQty(Math.min(9999, qty + 1))}
            >
              <Ic.Plus size={14}/>
            </button>
          </div>
        </div>
      )}
      <div className="cf-dock-row2">
        {!personal && (
          <div className="cf-qty">
            <div className="num">{qty}</div>
            <div className="lbl">QTY</div>
            <div className="arrows">
              <Ic.CaretUp size={9}/>
              <Ic.CaretDown size={9}/>
            </div>
          </div>
        )}
        <button className="cf-generate">
          <span>{label}</span>
          {!personal && (
            <span className="price">
              <Ic.Bolt size={11} color="oklch(0.85 0.18 70)"/>
              {price}
              <Ic.ChevDown size={10}/>
            </span>
          )}
        </button>
        {!personal && <button className="cf-history-btn"><Ic.Refresh size={18}/></button>}
      </div>
    </div>
  );
}

export function SectionTitle({ children, required, action }) {
  return (
    <h3 className="cf-section-title">
      <span>{children}</span>
      <Ic.Info size={13}/>
      {required && <span className="req">*</span>}
      {action && <span className="right">{action}</span>}
    </h3>
  );
}
