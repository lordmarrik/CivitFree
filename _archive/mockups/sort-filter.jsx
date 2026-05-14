// Sort sheet, Filter sheet, Backend switcher — bottom sheet overlays

function SortSheet({ open, onClose }) {
  const [selected, setSelected] = React.useState('newest');
  return (
    <BottomSheet open={open} onClose={onClose} title="Sort by">
      <SheetSection>
        {[{id:'newest', label:'Newest first'}, {id:'oldest', label:'Oldest first'}].map(opt => (
          <button key={opt.id} className="cf-sheet-item" onClick={() => { setSelected(opt.id); onClose(); }}>
            <span style={{flex:1}}>{opt.label}</span>
            {selected === opt.id && <Ic.Check size={16} color="var(--accent)"/>}
          </button>
        ))}
      </SheetSection>
    </BottomSheet>
  );
}

function FilterSheet({ open, onClose }) {
  const [fav, setFav] = React.useState(false);
  const [genType, setGenType] = React.useState('All');
  const [hideFailed, setHideFailed] = React.useState(false);
  const genTypes = ['All','Text→Image','Image→Image','Inpaint','Upscale'];

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
          <div style={toggleStyle(fav)} onClick={() => setFav(!fav)}>
            <div style={dotStyle(fav)}/>
          </div>
        </div>
        <div style={{padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <span style={{fontSize:14}}>Hide failed</span>
          <div style={toggleStyle(hideFailed)} onClick={() => setHideFailed(!hideFailed)}>
            <div style={dotStyle(hideFailed)}/>
          </div>
        </div>
      </SheetSection>
      <SheetSection label="Generation Type">
        <div style={{padding:'8px 16px 12px', display:'flex', gap: 6, flexWrap:'wrap'}}>
          {genTypes.map(t => (
            <button key={t} onClick={() => setGenType(t)} className={`cf-chip ${genType===t?'active':''}`} style={{fontSize:12}}>
              {t}
            </button>
          ))}
        </div>
      </SheetSection>
      <SheetSection label="Model">
        <div style={{padding:'8px 16px 12px'}}>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'var(--panel-2)', border:'1px solid var(--line)', borderRadius: 8,
            padding:'10px 12px', fontSize: 13, cursor:'pointer',
          }}>
            <span style={{color:'var(--text-dim)'}}>All models</span>
            <Ic.ChevDown size={12} color="var(--text-mute)"/>
          </div>
        </div>
      </SheetSection>
      <SheetSection label="Date Range">
        <div style={{padding:'8px 16px 12px', display:'flex', gap: 6}}>
          {['All time','Today','This week','This month'].map(d => (
            <button key={d} className={`cf-chip ${d==='All time'?'active':''}`} style={{fontSize:11, padding:'5px 8px'}}>
              {d}
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

function BackendSwitcher({ open, onClose }) {
  const [backend, setBackend] = React.useState('cloud');
  return (
    <BottomSheet open={open} onClose={onClose} title="GPU Backend">
      <SheetSection>
        {[
          { id:'local', icon: <Ic.Cpu size={18}/>, label:'Local GPU', sub:'RTX 3080 · 10 GB', status:'connected', statusColor:'var(--good)' },
          { id:'cloud', icon: <Ic.Cloud size={18}/>, label:'Cloud GPU', sub:'A100 · 80 GB', status:'ready', statusColor:'var(--good)' },
        ].map(opt => (
          <button key={opt.id} className="cf-sheet-item" onClick={() => setBackend(opt.id)} style={{
            background: backend === opt.id ? 'var(--panel-2)' : 'transparent',
            borderLeft: backend === opt.id ? '3px solid var(--accent)' : '3px solid transparent',
          }}>
            <span style={{color: backend === opt.id ? 'var(--text)' : 'var(--text-dim)'}}>{opt.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight: 600}}>{opt.label}</div>
              <div className="mono mute" style={{fontSize:11, marginTop:2}}>{opt.sub}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <span className="mono" style={{fontSize:10, color: opt.statusColor}}>{opt.status}</span>
              {backend === opt.id && <div style={{marginTop:4}}><Ic.Check size={14} color="var(--accent)"/></div>}
            </div>
          </button>
        ))}
      </SheetSection>
    </BottomSheet>
  );
}

Object.assign(window, { SortSheet, FilterSheet, BackendSwitcher });
