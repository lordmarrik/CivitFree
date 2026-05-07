import React from 'react';
import { Ic } from './icons.jsx';

export function Chips({ options, value, onChange, color = 'magenta' }) {
  return (
    <div className="cf-chips">
      {options.map(o => (
        <button
          key={o}
          className={`cf-chip ${value === o ? 'active' : ''} ${color === 'cyan' && value === o ? 'cyan' : ''}`}
          onClick={() => onChange && onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function NumInput({ value }) {
  return (
    <div className="cf-num-input">
      <span>{value}</span>
      <span className="arrows">
        <Ic.CaretUp size={9}/>
        <Ic.CaretDown size={9}/>
      </span>
    </div>
  );
}

export function SliderRow({ value, min = 0, max = 100, step = 1, onChange, displayValue }) {
  return (
    <div className="cf-slider-row">
      <input
        type="range" className="cf-slider"
        value={value} min={min} max={max} step={step}
        onChange={e => onChange && onChange(parseFloat(e.target.value))}
      />
      <NumInput value={displayValue ?? value}/>
    </div>
  );
}

export function ParamRow({ label, presets, presetValue, onPreset, presetColor, slider, hint, children }) {
  return (
    <div>
      <div className="row between" style={{marginBottom: 10}}>
        <div className="label">
          <span>{label}</span>
          <Ic.Info size={13}/>
        </div>
        {presets && (
          <Chips options={presets} value={presetValue} onChange={onPreset} color={presetColor}/>
        )}
      </div>
      {slider}
      {children}
      {hint && <div className="mute mono" style={{fontSize: 10, marginTop: 6}}>{hint}</div>}
    </div>
  );
}

export function CollapsibleCard({ title, defaultOpen = true, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={`cf-card collapsible ${open ? '' : 'collapsed'}`}>
      <div className="head" onClick={() => setOpen(!open)}>
        <span className="ttl">{title}</span>
        <span className="chev"><Ic.ChevUp size={14}/></span>
      </div>
      <div className="body">{children}</div>
    </div>
  );
}

export function AspectRatioRow({ value, onChange }) {
  const opts = [
    { id: '2:3', label: '2:3', px: '832×1216', cls: 'frame-23' },
    { id: '1:1', label: '1:1', px: '1024×1024', cls: 'frame-11' },
    { id: '3:2', label: '3:2', px: '1216×832', cls: 'frame-32' },
  ];
  return (
    <div className="cf-ratio-row">
      {opts.map(o => (
        <button
          key={o.id}
          className={`cf-ratio ${value === o.id ? 'active' : ''}`}
          onClick={() => onChange && onChange(o.id)}
        >
          <div className={`frame ${o.cls}`}/>
          <div className="label">{o.label}</div>
          <div className="px">{o.px}</div>
        </button>
      ))}
    </div>
  );
}
