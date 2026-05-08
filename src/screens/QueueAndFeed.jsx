import React from 'react';
import { Ic } from '../shared/icons.jsx';
import { FakeImg } from '../shared/mockImages.jsx';
import { StatusBar, TopBar } from '../shared/Shell.jsx';
import { SideDrawer } from '../components/Drawer.jsx';
import { BottomSheet, SheetSection, SheetItem, ImageActionSheet } from '../components/BottomSheet.jsx';
import { SortSheet, FilterSheet } from '../components/SortFilter.jsx';
import { useComfyHistory } from '../shared/useComfyHistory.js';
import { imageUrl as comfyImageUrl } from '../services/comfyClient.js';
import { paletteForFilename, seedHashForFilename } from '../services/historyParser.js';

/**
 * Real-image card. If we have a baseUrl + filename, render a real
 * <img>; otherwise fall back to the deterministic gradient placeholder
 * keyed off the filename so the card still has shape.
 */
function ResultTile({ baseUrl, filename, type, subfolder, alt, onAction }) {
  const haveUrl = baseUrl && filename;
  const url = haveUrl ? comfyImageUrl(baseUrl, { filename, type, subfolder }) : '';
  return (
    <div className="cf-feed-card">
      <div className="img">
        {haveUrl ? (
          <img
            src={url}
            alt={alt || filename}
            style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', background:'var(--panel-3)'}}
          />
        ) : (
          <FakeImg palette={paletteForFilename(filename || alt || 'x')} seed={seedHashForFilename(filename || alt || 'x')}/>
        )}
        <div className="check"/>
        <button className="more" onClick={() => onAction && onAction({ filename, url })}><Ic.More size={16}/></button>
      </div>
      <div className="actions">
        <button><Ic.Heart size={14}/></button>
        <button onClick={() => onAction && onAction({ filename, url })}><Ic.Wand size={14}/></button>
        <button><Ic.Download size={14}/></button>
      </div>
    </div>
  );
}

function relativeTime(ms) {
  if (!ms) return '';
  const diffSec = Math.floor((Date.now() - ms) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function RunCard({ run, baseUrl, onImageAction, onRunRemix }) {
  const [expanded, setExpanded] = React.useState(false);
  const time = relativeTime(run.completedAt || run.startedAt);
  const count = run.images.length;
  return (
    <div className="cf-run-card">
      <div className="head">
        <span className="count-pill"><Ic.ImgIcon size={11}/> {count}</span>
        <span className="time">{time || run.promptId.slice(0, 8)}</span>
        {run.status === 'success' && <span className="time" style={{color:'var(--good)'}}>· done</span>}
        {run.status === 'running' && <span className="status"/>}
        {run.status === 'error' && <span className="time" style={{color:'var(--bad)'}}>· error</span>}
        <div className="actions">
          <button onClick={() => onRunRemix && onRunRemix(run)} aria-label="Remix run"><Ic.Refresh size={14}/></button>
          <button><Ic.Info size={14}/></button>
          <button className="danger"><Ic.Trash size={14}/></button>
        </div>
      </div>
      <div className="body">
        <div className="cf-tag">CREATE IMAGE</div>
        <div className={expanded ? "promptline expanded" : "promptline"} onClick={() => setExpanded(!expanded)}>
          {run.prompt || <span className="mute">(no prompt)</span>}{' '}
          {run.prompt && (!expanded
            ? <span className="more">Show more</span>
            : <span className="more">Show less</span>)}
        </div>
        {run.negPrompt && (
          <div className="promptline" style={{fontSize: 11, color: 'var(--text-mute)', marginBottom: 8, WebkitLineClamp: expanded ? 'unset' : 2}}>
            <span style={{color: 'var(--bad)', fontWeight: 600, fontSize: 10}}>NEG</span> {run.negPrompt}
          </div>
        )}
        {run.loraNames.length > 0 && run.loraNames.map(n => (
          <div key={n} className="cf-resource">
            <span className="name">{n}</span>
          </div>
        ))}
        {run.images.length > 0 && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 6, marginTop: 10}}>
            {run.images.map((img, i) => (
              <ResultTile
                key={img.filename + i}
                baseUrl={baseUrl}
                filename={img.filename}
                type={img.type}
                subfolder={img.subfolder}
                alt={`Result ${i + 1}`}
                onAction={(meta) => onImageAction && onImageAction({ ...meta, prompt: run.prompt, seed: run.seed })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SortFilterRow({ onSort, onFilter }) {
  return (
    <div className="cf-sort-row">
      <span className="item" onClick={onSort} style={{cursor:'pointer'}}><Ic.SortDesc size={14}/> Newest <Ic.ChevDown size={12}/></span>
      <span className="item muted" onClick={onFilter} style={{cursor:'pointer'}}><Ic.Filter size={14}/> Filters <Ic.ChevDown size={12}/></span>
      <span className="right">Select all <span className="checkbox"/></span>
    </div>
  );
}

function RunRemixSheet({ open, onClose }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Remix Run">
      <SheetSection>
        <SheetItem icon={<Ic.Refresh size={16}/>} label="Remix" onClick={onClose}/>
        <SheetItem icon={<Ic.Refresh size={16}/>} label="Remix (with seed)" onClick={onClose}/>
      </SheetSection>
    </BottomSheet>
  );
}

function HistoryEmpty({ loading, error, onReload, kind }) {
  if (loading) {
    return (
      <div style={{padding:'40px 18px', textAlign:'center', color:'var(--text-dim)', fontSize: 13, display:'flex', flexDirection:'column', alignItems:'center', gap: 10}}>
        <div style={{
          width: 18, height: 18, borderRadius:'50%',
          border:'2px solid var(--text-dim)', borderTopColor:'var(--accent)',
          animation:'cf-spin .8s linear infinite',
        }}/>
        Loading history from ComfyUI…
      </div>
    );
  }
  if (error) {
    return (
      <div style={{padding:'18px', display:'flex', flexDirection:'column', gap: 10}}>
        <div style={{
          padding:'10px 12px', borderRadius: 8,
          background:'oklch(0.30 0.12 25 / .15)', border:'1px solid oklch(0.45 0.18 25 / .35)',
          color:'var(--bad)', fontSize: 12, lineHeight: 1.5, whiteSpace:'pre-wrap',
        }}>
          <strong style={{display:'block', marginBottom: 4}}>Couldn't load history</strong>
          {error.message || String(error)}
          {error.hint && <div style={{marginTop: 4}}>{error.hint}</div>}
        </div>
        <button onClick={onReload} style={{
          alignSelf:'flex-start', padding:'8px 12px', borderRadius: 8,
          background:'var(--panel-2)', border:'1px solid var(--line)',
          color:'var(--text)', fontSize: 12, fontWeight: 600,
        }}>Retry</button>
      </div>
    );
  }
  return (
    <div style={{padding:'40px 18px', textAlign:'center', color:'var(--text-mute)', fontSize: 13}}>
      {kind === 'feed'
        ? 'No images yet. Generate something on Screen A.'
        : 'No runs yet. Generate something on Screen A.'}
    </div>
  );
}

export function VariantPersonalQueue({ onTab, onSendToInpaint, onRemix, settings, onSettingsChange }) {
  const [activeAction, setActiveAction] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const baseUrl = settings?.backendUrl;
  const { runs, loading, error, reload } = useComfyHistory(baseUrl);

  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="clock" personal onMenu={() => setDrawerOpen(true)} onTab={onTab}/>
      <div className="cf-body" style={{padding: 0}}>
        <SortFilterRow onSort={() => setSortOpen(true)} onFilter={() => setFilterOpen(true)}/>
        {runs.length === 0
          ? <HistoryEmpty loading={loading} error={error} onReload={reload} kind="queue"/>
          : runs.map(run => (
              <RunCard
                key={run.promptId}
                run={run}
                baseUrl={baseUrl}
                onImageAction={setActiveAction}
                onRunRemix={(r) => onRemix && onRemix({ prompt: r.prompt, seed: r.seed })}
              />
            ))
        }
        <div style={{height: 14}}/>
      </div>
      <ImageActionSheet
        open={activeAction !== null}
        onClose={() => setActiveAction(null)}
        seed={activeAction?.seed}
        palette={undefined}
        prompt={activeAction?.prompt}
        onInpaint={onSendToInpaint}
        onRemix={onRemix}
      />
      <SortSheet open={sortOpen} onClose={() => setSortOpen(false)}/>
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)}/>
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
}

export function VariantPersonalFeed({ onTab, onSendToInpaint, onRemix, settings, onSettingsChange }) {
  const [activeAction, setActiveAction] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const baseUrl = settings?.backendUrl;
  const { runs, loading, error, reload } = useComfyHistory(baseUrl);

  // Flatten newest-first: each image becomes a tile, carrying its run's
  // prompt/seed for the action sheet.
  const flatTiles = React.useMemo(() => {
    const out = [];
    for (const run of runs) {
      for (const img of run.images) {
        out.push({
          key: run.promptId + ':' + img.filename,
          filename: img.filename,
          type: img.type,
          subfolder: img.subfolder,
          prompt: run.prompt,
          seed: run.seed,
        });
      }
    }
    return out;
  }, [runs]);

  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="grid" personal onMenu={() => setDrawerOpen(true)} onTab={onTab}/>
      <div className="cf-body" style={{padding: 0}}>
        <SortFilterRow onSort={() => setSortOpen(true)} onFilter={() => setFilterOpen(true)}/>
        {flatTiles.length === 0
          ? <HistoryEmpty loading={loading} error={error} onReload={reload} kind="feed"/>
          : (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, padding: 12}}>
              {flatTiles.map(t => (
                <ResultTile
                  key={t.key}
                  baseUrl={baseUrl}
                  filename={t.filename}
                  type={t.type}
                  subfolder={t.subfolder}
                  alt={t.filename}
                  onAction={(meta) => setActiveAction({ ...meta, prompt: t.prompt, seed: t.seed })}
                />
              ))}
            </div>
          )
        }
        <div style={{height: 14}}/>
      </div>
      <ImageActionSheet
        open={activeAction !== null}
        onClose={() => setActiveAction(null)}
        seed={activeAction?.seed}
        prompt={activeAction?.prompt}
        onInpaint={onSendToInpaint}
        onRemix={onRemix}
      />
      <SortSheet open={sortOpen} onClose={() => setSortOpen(false)}/>
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)}/>
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
}
