// Bottom sheet overlay — slides up from the bottom of the phone frame.
// Must be rendered inside a .cf-frame (position: relative) to stay contained.

function BottomSheet({ open, onClose, title, children }) {
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

function SheetSection({ label, children }) {
  return (
    <div className="cf-sheet-section">
      {label && <div className="cf-sheet-section-label">{label}</div>}
      {children}
    </div>
  );
}

function SheetItem({ icon, label, danger, onClick }) {
  return (
    <button className={`cf-sheet-item ${danger ? 'danger' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Pre-built image action sheet
function ImageActionSheet({ open, onClose, seed }) {
  return (
    <BottomSheet open={open} onClose={onClose} title={seed ? `#${seed}` : 'Actions'}>
      <SheetSection label="Remix">
        <SheetItem icon={<Ic.Refresh size={16}/>} label="Remix" onClick={onClose}/>
        <SheetItem icon={<Ic.Refresh size={16}/>} label="Remix (with seed)" onClick={onClose}/>
      </SheetSection>
      <SheetSection label="Image">
        <SheetItem icon={<Ic.Sparkle size={16}/>} label="Image Variations" onClick={onClose}/>
        <SheetItem icon={<Ic.Image size={16}/>} label="Image to Image" onClick={onClose}/>
        <SheetItem icon={<Ic.Brush2 size={16}/>} label="Inpaint" onClick={onClose}/>
        <SheetItem icon={<Ic.Wand size={16}/>} label="Face Fix" onClick={onClose}/>
        <SheetItem icon={<Ic.ChevUp size={16}/>} label="Upscale" onClick={onClose}/>
        <SheetItem icon={<Ic.Eraser size={16}/>} label="Remove Background" onClick={onClose}/>
      </SheetSection>
      <SheetSection label="Video">
        <SheetItem icon={<Ic.Video size={16}/>} label="Image to Video" onClick={onClose}/>
      </SheetSection>
      <SheetSection>
        <SheetItem icon={<Ic.Download size={16}/>} label="Download" onClick={onClose}/>
        <SheetItem icon={<Ic.Trash size={16}/>} label="Delete" danger onClick={onClose}/>
      </SheetSection>
    </BottomSheet>
  );
}

window.BottomSheet = BottomSheet;
window.SheetSection = SheetSection;
window.SheetItem = SheetItem;
window.ImageActionSheet = ImageActionSheet;
