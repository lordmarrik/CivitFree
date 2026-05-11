import React from 'react';
import { Ic } from '../shared/icons.jsx';
import { FakeImg } from '../shared/mockImages.jsx';
import { StatusBar, TopBar } from '../shared/Shell.jsx';
import { SideDrawer } from '../components/Drawer.jsx';
import { ImageActionSheet } from '../components/BottomSheet.jsx';
import { SortSheet, FilterSheet } from '../components/SortFilter.jsx';
import { useComfyHistory } from '../shared/useComfyHistory.js';
import { usePersisted } from '../shared/usePersisted.js';
import { imageUrl as comfyImageUrl } from '../services/comfyClient.js';
import { paletteForFilename, seedHashForFilename } from '../services/historyParser.js';

function imageKey({ filename, type, subfolder }) {
  return [type || 'output', subfolder || '', filename || ''].join('/');
}

function runTime(run) {
  return run?.completedAt ?? run?.startedAt ?? 0;
}

function sortRuns(runs, sortOrder) {
  return [...(runs || [])].sort((a, b) => sortOrder === 'oldest' ? runTime(a) - runTime(b) : runTime(b) - runTime(a));
}


function remixPayloadFromRun(run, { withSeed = false } = {}) {
  const loraNames = Array.isArray(run?.loraNames) ? run.loraNames : [];
  const payload = {
    prompt: run?.prompt || '',
    negPrompt: run?.negPrompt || '',
    loraNames,
    resourceNames: loraNames,
  };
  if (run?.checkpoint) payload.checkpoint = run.checkpoint;
  if (run?.sampler) payload.sampler = run.sampler;
  if (run?.scheduler) payload.scheduler = run.scheduler;
  if (typeof run?.width === 'number' && run.width > 0) payload.width = run.width;
  if (typeof run?.height === 'number' && run.height > 0) payload.height = run.height;
  if (typeof run?.cfg === 'number' && run.cfg > 0) payload.cfg = run.cfg;
  if (typeof run?.steps === 'number' && run.steps > 0) payload.steps = run.steps;
  if (withSeed && typeof run?.seed === 'number' && Number.isFinite(run.seed)) {
    payload.seed = run.seed;
  }
  return payload;
}

function sanitizeFilename(filename) {
  return (filename || 'civitfree-output.png').replace(/[\\/:*?"<>|]+/g, '_');
}

async function downloadUrl(url, filename) {
  if (!url) throw new Error('No image URL available for download.');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}).`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = sanitizeFilename(filename);
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}

function FavoriteIcon({ active }) {
  return <Ic.Heart size={14} color={active ? 'var(--accent)' : undefined}/>;
}

/**
 * Real-image card. If we have a baseUrl + filename, render a real
 * <img>; otherwise fall back to the deterministic gradient placeholder
 * keyed off the filename so the card still has shape.
 */
function ResultTile({ baseUrl, filename, type, subfolder, alt, onAction, favorite, selected, onToggleSelected, onToggleFavorite, onDownload }) {
  const haveUrl = baseUrl && filename;
  const url = haveUrl ? comfyImageUrl(baseUrl, { filename, type, subfolder }) : '';
  const meta = { filename, type, subfolder, url };
  return (
    <div className={`cf-feed-card ${favorite ? 'favorited' : ''} ${selected ? 'selected' : ''}`}>
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
        <button
          className={selected ? 'check active' : 'check'}
          onClick={() => onToggleSelected && onToggleSelected(meta)}
          aria-label={selected ? 'Deselect image' : 'Select image'}
        >
          {selected && <Ic.Check size={12}/>}
        </button>
        <button className="more" onClick={() => onAction && onAction(meta)}><Ic.More size={16}/></button>
      </div>
      <div className="actions">
        <button onClick={() => onToggleFavorite && onToggleFavorite(meta)} aria-label={favorite ? 'Unfavorite image' : 'Favorite image'}><FavoriteIcon active={favorite}/></button>
        <button onClick={() => onAction && onAction(meta)} aria-label="Image actions"><Ic.Wand size={14}/></button>
        <button onClick={() => onDownload && onDownload(meta)} aria-label="Download image"><Ic.Download size={14}/></button>
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

function RunCard({ run, baseUrl, onImageAction, onRunRemix, favorites, selectedImages, onToggleSelected, onToggleFavorite, onDownload }) {
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
        {run.status === 'queued' && <span className="time" style={{color:'var(--warn)'}}>· queued</span>}
        {run.status === 'error' && <span className="time" style={{color:'var(--bad)'}}>· error</span>}
        <div className="actions">
          <button onClick={() => onRunRemix && onRunRemix(remixPayloadFromRun(run))} aria-label="Remix run"><Ic.Refresh size={14}/></button>
          <button className="soon" aria-label="Run info coming soon"><Ic.Info size={14}/></button>
          <button className="danger soon" aria-label="Delete coming soon"><Ic.Trash size={14}/></button>
        </div>
      </div>
      <div className="body">
        <div className="cf-tag">CREATE IMAGE</div>
        <div className={expanded ? 'promptline expanded' : 'promptline'} onClick={() => setExpanded(!expanded)}>
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
            {run.images.map((img, i) => {
              const key = imageKey(img);
              return (
                <ResultTile
                  key={img.filename + i}
                  baseUrl={baseUrl}
                  filename={img.filename}
                  type={img.type}
                  subfolder={img.subfolder}
                  alt={`Result ${i + 1}`}
                  favorite={!!favorites[key]}
                  selected={!!selectedImages?.[key]}
                  onToggleSelected={onToggleSelected}
                  onToggleFavorite={onToggleFavorite}
                  onDownload={onDownload}
                  onAction={(meta) => onImageAction && onImageAction({ ...meta, seed: run.seed, remixPayload: remixPayloadFromRun(run) })}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SortFilterRow({ onSort, onFilter, sortOrder, filters, totalCount = 0, selectedCount = 0, allSelected = false, onSelectAll, onBatchFavorite, onBatchDownload }) {
  const filterCount = (filters?.favoritesOnly ? 1 : 0) + (filters?.hideFailed ? 1 : 0);
  return (
    <div className="cf-sort-row">
      <span className="item" onClick={onSort} style={{cursor:'pointer'}}><Ic.SortDesc size={14}/> {sortOrder === 'oldest' ? 'Oldest' : 'Newest'} <Ic.ChevDown size={12}/></span>
      <span className="item muted" onClick={onFilter} style={{cursor:'pointer'}}><Ic.Filter size={14}/> Filters{filterCount ? ` (${filterCount})` : ''} <Ic.ChevDown size={12}/></span>
      <button className={`right cf-select-all ${allSelected ? 'active' : ''}`} onClick={onSelectAll} disabled={!totalCount}>
        <span className="checkbox">{allSelected && <Ic.Check size={12}/>}</span>
        {allSelected ? 'Clear all' : 'Select all'}
      </button>
      {selectedCount > 0 && (
        <div className="cf-batch-bar">
          <span>{selectedCount} selected</span>
          <button onClick={onBatchFavorite}><Ic.Heart size={13}/> Favorite</button>
          <button onClick={onBatchDownload}><Ic.Download size={13}/> Download</button>
        </div>
      )}
    </div>
  );
}

function HistoryEmpty({ loading, error, onReload, kind, filtered }) {
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
      {filtered
        ? 'No matching items. Try changing filters.'
        : kind === 'feed'
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
  const [sortOrder, setSortOrder] = usePersisted('queueSort', 'newest');
  const [filters, setFilters] = usePersisted('queueFilters', { favoritesOnly: false, hideFailed: false });
  const [favorites, setFavorites] = usePersisted('imageFavorites', {});
  const [selectedImages, setSelectedImages] = usePersisted('selectedImages', {});
  const [downloadError, setDownloadError] = React.useState(null);

  const baseUrl = settings?.backendUrl;
  const { runs, loading, error, reload } = useComfyHistory(baseUrl);

  const toggleFavorite = (img) => {
    const key = imageKey(img);
    setFavorites(prev => {
      const next = { ...(prev || {}) };
      if (next[key]) delete next[key];
      else next[key] = { filename: img.filename, type: img.type, subfolder: img.subfolder, savedAt: Date.now() };
      return next;
    });
  };

  const toggleSelected = (img) => {
    const key = imageKey(img);
    setSelectedImages(prev => {
      const next = { ...(prev || {}) };
      if (next[key]) delete next[key];
      else next[key] = { filename: img.filename, type: img.type, subfolder: img.subfolder, savedAt: Date.now() };
      return next;
    });
  };

  const handleDownload = async (img) => {
    setDownloadError(null);
    try {
      await downloadUrl(img.url || comfyImageUrl(baseUrl, img), img.filename);
    } catch (err) {
      setDownloadError(err?.message || String(err));
    }
  };

  const visibleRuns = React.useMemo(() => {
    let out = sortRuns(runs, sortOrder);
    if (filters?.hideFailed) out = out.filter(r => r.status !== 'error');
    if (filters?.favoritesOnly) out = out.filter(r => r.images.some(img => favorites[imageKey(img)]));
    return out;
  }, [runs, sortOrder, filters, favorites]);

  const visibleImages = React.useMemo(() => visibleRuns.flatMap(run => run.images), [visibleRuns]);
  const selectedVisible = visibleImages.filter(img => selectedImages?.[imageKey(img)]);
  const allSelected = visibleImages.length > 0 && selectedVisible.length === visibleImages.length;

  const toggleSelectAll = () => {
    setSelectedImages(prev => {
      const next = { ...(prev || {}) };
      if (allSelected) {
        visibleImages.forEach(img => delete next[imageKey(img)]);
      } else {
        visibleImages.forEach(img => {
          next[imageKey(img)] = { filename: img.filename, type: img.type, subfolder: img.subfolder, savedAt: Date.now() };
        });
      }
      return next;
    });
  };

  const favoriteSelected = () => {
    setFavorites(prev => {
      const next = { ...(prev || {}) };
      selectedVisible.forEach(img => {
        next[imageKey(img)] = { filename: img.filename, type: img.type, subfolder: img.subfolder, savedAt: Date.now() };
      });
      return next;
    });
  };

  const downloadSelected = async () => {
    setDownloadError(null);
    try {
      for (const img of selectedVisible) {
        await downloadUrl(comfyImageUrl(baseUrl, img), img.filename);
      }
    } catch (err) {
      setDownloadError(err?.message || String(err));
    }
  };

  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="clock" personal onMenu={() => setDrawerOpen(true)} onTab={onTab}/>
      <div className="cf-body" style={{padding: 0}}>
        <SortFilterRow
          onSort={() => setSortOpen(true)}
          onFilter={() => setFilterOpen(true)}
          sortOrder={sortOrder}
          filters={filters}
          totalCount={visibleImages.length}
          selectedCount={selectedVisible.length}
          allSelected={allSelected}
          onSelectAll={toggleSelectAll}
          onBatchFavorite={favoriteSelected}
          onBatchDownload={downloadSelected}
        />
        {downloadError && <div className="cf-inline-error">Download failed: {downloadError}</div>}
        {visibleRuns.length === 0
          ? <HistoryEmpty loading={loading} error={error} onReload={reload} kind="queue" filtered={runs.length > 0}/>
          : visibleRuns.map(run => (
              <RunCard
                key={run.promptId}
                run={run}
                baseUrl={baseUrl}
                favorites={favorites || {}}
                selectedImages={selectedImages || {}}
                onToggleSelected={toggleSelected}
                onToggleFavorite={toggleFavorite}
                onDownload={handleDownload}
                onImageAction={setActiveAction}
                onRunRemix={onRemix}
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
        prompt={activeAction?.remixPayload?.prompt}
        remixPayload={activeAction?.remixPayload}
        onInpaint={onSendToInpaint}
        onRemix={onRemix}
        onDownload={() => activeAction && handleDownload(activeAction)}
      />
      <SortSheet open={sortOpen} onClose={() => setSortOpen(false)} value={sortOrder} onChange={setSortOrder}/>
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onChange={setFilters}/>
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
  const [sortOrder, setSortOrder] = usePersisted('feedSort', 'newest');
  const [filters, setFilters] = usePersisted('feedFilters', { favoritesOnly: false, hideFailed: false });
  const [favorites, setFavorites] = usePersisted('imageFavorites', {});
  const [selectedImages, setSelectedImages] = usePersisted('selectedImages', {});
  const [downloadError, setDownloadError] = React.useState(null);

  const baseUrl = settings?.backendUrl;
  const { runs, loading, error, reload } = useComfyHistory(baseUrl);

  const toggleFavorite = (img) => {
    const key = imageKey(img);
    setFavorites(prev => {
      const next = { ...(prev || {}) };
      if (next[key]) delete next[key];
      else next[key] = { filename: img.filename, type: img.type, subfolder: img.subfolder, savedAt: Date.now() };
      return next;
    });
  };

  const toggleSelected = (img) => {
    const key = imageKey(img);
    setSelectedImages(prev => {
      const next = { ...(prev || {}) };
      if (next[key]) delete next[key];
      else next[key] = { filename: img.filename, type: img.type, subfolder: img.subfolder, savedAt: Date.now() };
      return next;
    });
  };

  const handleDownload = async (img) => {
    setDownloadError(null);
    try {
      await downloadUrl(img.url || comfyImageUrl(baseUrl, img), img.filename);
    } catch (err) {
      setDownloadError(err?.message || String(err));
    }
  };

  const flatTiles = React.useMemo(() => {
    let sourceRuns = runs || [];
    if (filters?.hideFailed) sourceRuns = sourceRuns.filter(r => r.status !== 'error');
    sourceRuns = sortRuns(sourceRuns, sortOrder);
    const out = [];
    for (const run of sourceRuns) {
      for (const img of run.images) {
        const key = imageKey(img);
        if (filters?.favoritesOnly && !favorites[key]) continue;
        out.push({
          key: run.promptId + ':' + img.filename,
          favoriteKey: key,
          filename: img.filename,
          type: img.type,
          subfolder: img.subfolder,
          seed: run.seed,
          remixPayload: remixPayloadFromRun(run),
          runTime: runTime(run),
        });
      }
    }
    return out;
  }, [runs, sortOrder, filters, favorites]);

  const visibleImages = React.useMemo(() => flatTiles.map(({ filename, type, subfolder }) => ({ filename, type, subfolder })), [flatTiles]);
  const selectedVisible = visibleImages.filter(img => selectedImages?.[imageKey(img)]);
  const allSelected = visibleImages.length > 0 && selectedVisible.length === visibleImages.length;

  const toggleSelectAll = () => {
    setSelectedImages(prev => {
      const next = { ...(prev || {}) };
      if (allSelected) {
        visibleImages.forEach(img => delete next[imageKey(img)]);
      } else {
        visibleImages.forEach(img => {
          next[imageKey(img)] = { filename: img.filename, type: img.type, subfolder: img.subfolder, savedAt: Date.now() };
        });
      }
      return next;
    });
  };

  const favoriteSelected = () => {
    setFavorites(prev => {
      const next = { ...(prev || {}) };
      selectedVisible.forEach(img => {
        next[imageKey(img)] = { filename: img.filename, type: img.type, subfolder: img.subfolder, savedAt: Date.now() };
      });
      return next;
    });
  };

  const downloadSelected = async () => {
    setDownloadError(null);
    try {
      for (const img of selectedVisible) {
        await downloadUrl(comfyImageUrl(baseUrl, img), img.filename);
      }
    } catch (err) {
      setDownloadError(err?.message || String(err));
    }
  };

  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="grid" personal onMenu={() => setDrawerOpen(true)} onTab={onTab}/>
      <div className="cf-body" style={{padding: 0}}>
        <SortFilterRow
          onSort={() => setSortOpen(true)}
          onFilter={() => setFilterOpen(true)}
          sortOrder={sortOrder}
          filters={filters}
          totalCount={visibleImages.length}
          selectedCount={selectedVisible.length}
          allSelected={allSelected}
          onSelectAll={toggleSelectAll}
          onBatchFavorite={favoriteSelected}
          onBatchDownload={downloadSelected}
        />
        {downloadError && <div className="cf-inline-error">Download failed: {downloadError}</div>}
        {flatTiles.length === 0
          ? <HistoryEmpty loading={loading} error={error} onReload={reload} kind="feed" filtered={runs.length > 0}/>
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
                  favorite={!!favorites[t.favoriteKey]}
                  selected={!!selectedImages?.[t.favoriteKey]}
                  onToggleSelected={toggleSelected}
                  onToggleFavorite={toggleFavorite}
                  onDownload={handleDownload}
                  onAction={(meta) => setActiveAction({ ...meta, seed: t.seed, remixPayload: t.remixPayload })}
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
        prompt={activeAction?.remixPayload?.prompt}
        remixPayload={activeAction?.remixPayload}
        onInpaint={onSendToInpaint}
        onRemix={onRemix}
        onDownload={() => activeAction && handleDownload(activeAction)}
      />
      <SortSheet open={sortOpen} onClose={() => setSortOpen(false)} value={sortOrder} onChange={setSortOrder}/>
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onChange={setFilters}/>
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
}
