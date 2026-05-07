import React from 'react';
import { Ic } from '../shared/icons.jsx';

export function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="cf-sheet-backdrop" onClick={onClose}>
      <div className="cf-sheet" onClick={e => e.stopPropagation()}>
        <div className="cf-sheet-handle"/>
        {title && <div className="cf-sheet-title">{title}</div>}
        <div className="cf-sheet-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export function SheetSection({ label, children }) {
  return (
    <div className="cf-sheet-section">
      {label && <div className="cf-sheet-section-label">{label}</div>}
      {children}
    </div>
  );
}

export function SheetItem({ icon, label, danger, soon, onClick }) {
  return (
    <button
      className={`cf-sheet-item ${danger ? 'danger' : ''} ${soon ? 'soon' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span style={{flex: 1, textAlign: 'left'}}>{label}</span>
      {soon && <span className="cf-sheet-soon">soon</span>}
    </button>
  );
}

export function ImageActionSheet({ open, onClose, seed, palette, prompt, onInpaint, onRemix }) {
  const fireRemix = (withSeed) => {
    if (onRemix) onRemix({ prompt, seed: withSeed ? seed : undefined, palette });
    onClose && onClose();
  };
  const fireInpaint = () => {
    if (onInpaint) onInpaint({ seed, palette });
    onClose && onClose();
  };
  return (
    <BottomSheet open={open} onClose={onClose} title={seed ? `#${seed}` : 'Actions'}>
      <SheetSection label="Remix">
        <SheetItem icon={<Ic.Refresh size={16}/>} label="Remix" onClick={() => fireRemix(false)}/>
        <SheetItem icon={<Ic.Refresh size={16}/>} label="Remix (with seed)" onClick={() => fireRemix(true)}/>
      </SheetSection>
      <SheetSection label="Image">
        <SheetItem icon={<Ic.Sparkle size={16}/>} label="Image Variations" soon onClick={onClose}/>
        <SheetItem icon={<Ic.Image size={16}/>} label="Image to Image" soon onClick={onClose}/>
        <SheetItem icon={<Ic.Brush2 size={16}/>} label="Inpaint" onClick={fireInpaint}/>
        <SheetItem icon={<Ic.Wand size={16}/>} label="Face Fix" soon onClick={onClose}/>
        <SheetItem icon={<Ic.ChevUp size={16}/>} label="Upscale" soon onClick={onClose}/>
        <SheetItem icon={<Ic.Eraser size={16}/>} label="Remove Background" soon onClick={onClose}/>
      </SheetSection>
      <SheetSection label="Video">
        <SheetItem icon={<Ic.Video size={16}/>} label="Image to Video" soon onClick={onClose}/>
      </SheetSection>
      <SheetSection>
        <SheetItem icon={<Ic.Download size={16}/>} label="Download" soon onClick={onClose}/>
        <SheetItem icon={<Ic.Trash size={16}/>} label="Delete" danger soon onClick={onClose}/>
      </SheetSection>
    </BottomSheet>
  );
}
