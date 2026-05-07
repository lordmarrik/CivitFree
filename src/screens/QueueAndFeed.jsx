import React from 'react';
import { Ic } from '../shared/icons.jsx';
import { FakeImg } from '../shared/mockImages.jsx';
import { StatusBar, TopBar } from '../shared/Shell.jsx';
import { SideDrawer } from '../components/Drawer.jsx';
import { BottomSheet, SheetSection, SheetItem, ImageActionSheet } from '../components/BottomSheet.jsx';
import { SortSheet, FilterSheet } from '../components/SortFilter.jsx';

function FeedCard({ palette, seed, liked, onAction }) {
  const [isLiked, setLiked] = React.useState(liked);
  const fire = () => onAction && onAction({ seed, palette });
  return (
    <div className="cf-feed-card">
      <div className="img">
        <FakeImg palette={palette} seed={seed}/>
        <div className="check"/>
        <button className="more" onClick={fire}><Ic.More size={16}/></button>
      </div>
      <div className="actions">
        <button className={isLiked?'liked':''} onClick={() => setLiked(!isLiked)}>
          <Ic.Heart size={14} fill={isLiked?'currentColor':'none'}/>
        </button>
        <button onClick={fire}><Ic.Wand size={14}/></button>
        <button><Ic.Download size={14}/></button>
      </div>
    </div>
  );
}

function RunCard({ count, time, prompt, negPrompt, resources, palettes, seeds, status, onImageAction, onRunRemix }) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div className="cf-run-card">
      <div className="head">
        <span className="count-pill"><Ic.ImgIcon size={11}/> {count}</span>
        <span className="time">{time}</span>
        {status === 'done' && <span className="time" style={{color:'var(--good)'}}>· done</span>}
        {status === 'running' && <span className="status"/>}
        <div className="actions">
          <button onClick={() => onRunRemix && onRunRemix(prompt)} aria-label="Remix run"><Ic.Refresh size={14}/></button>
          <button><Ic.Info size={14}/></button>
          <button className="danger"><Ic.Trash size={14}/></button>
        </div>
      </div>
      <div className="body">
        <div className="cf-tag">CREATE IMAGE</div>
        <div className={expanded ? "promptline expanded" : "promptline"} onClick={() => setExpanded(!expanded)}>
          {prompt} {!expanded && <span className="more">Show more</span>}
          {expanded && <span className="more">Show less</span>}
        </div>
        {negPrompt && (
          <div className="promptline" style={{fontSize: 11, color: 'var(--text-mute)', marginBottom: 8, WebkitLineClamp: expanded ? 'unset' : 2}}>
            <span style={{color: 'var(--bad)', fontWeight: 600, fontSize: 10}}>NEG</span> {negPrompt}
          </div>
        )}
        {resources.map(r => (
          <div key={r} className="cf-resource">
            <span className="name">{r}</span>
            <button className="add"><Ic.Plus size={12}/></button>
          </div>
        ))}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 6, marginTop: 10}}>
          {palettes.map((p, i) => (
            <FeedCard
              key={i}
              palette={p}
              seed={seeds[i]}
              onAction={(meta) => onImageAction && onImageAction({ ...meta, prompt })}
            />
          ))}
        </div>
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

const RUNS = [
  {
    count: 4, time: '14:21', status: 'running',
    prompt: 'masterpiece, best quality, amazing quality, very aesthetic, a desert temple glowing at dusk, volumetric lighting, intricate stonework…',
    negPrompt: 'low quality, blurry, deformed',
    resources: ['HomoSimile XL · v4.0', 'Aruto Fushibe · D_Cide Traumer…', 'Uggu Bang · Artist · IL v1.0', 'Ra4s Art Style · v1.0'],
    palettes: [0, 1, 2, 3],
    seeds: [3812, 9145, 2204, 6877],
  },
  {
    count: 2, time: '14:09', status: 'done',
    prompt: 'vintage portrait, 35mm film, soft window light, melancholy expression',
    negPrompt: 'cartoon, anime',
    resources: ['HomoSimile XL · v4.0'],
    palettes: [4, 5],
    seeds: [1190, 8842],
  },
  {
    count: 4, time: '13:48', status: 'done',
    prompt: 'isometric pixel city, neon signage, rain-slick streets at night',
    negPrompt: 'photorealistic, 3d render',
    resources: ['Pixel Art LoRA · v2.1', 'Neon City · IL v1.0'],
    palettes: [6, 7],
    seeds: [4321, 5559],
  },
];

export function VariantPersonalQueue({ onTab, onSendToInpaint, onRemix, settings, onSettingsChange }) {
  const [activeAction, setActiveAction] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);

  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="clock" personal onMenu={() => setDrawerOpen(true)} onTab={onTab}/>
      <div className="cf-body" style={{padding: 0}}>
        <SortFilterRow onSort={() => setSortOpen(true)} onFilter={() => setFilterOpen(true)}/>
        {RUNS.map(r => (
          <RunCard
            key={r.time}
            {...r}
            onImageAction={setActiveAction}
            onRunRemix={(prompt) => onRemix && onRemix({ prompt })}
          />
        ))}
        <div style={{height: 14}}/>
      </div>
      <ImageActionSheet
        open={activeAction !== null}
        onClose={() => setActiveAction(null)}
        seed={activeAction?.seed}
        palette={activeAction?.palette}
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

  const items = [
    [0, 3812], [1, 9145], [2, 2204], [3, 6877],
    [4, 1190], [5, 8842], [6, 4321], [7, 5559],
    [0, 2018], [1, 7720], [2, 3344], [3, 8801],
  ];
  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="grid" personal onMenu={() => setDrawerOpen(true)} onTab={onTab}/>
      <div className="cf-body" style={{padding: 0}}>
        <SortFilterRow onSort={() => setSortOpen(true)} onFilter={() => setFilterOpen(true)}/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, padding: 12}}>
          {items.map(([p, s], i) => (
            <FeedCard
              key={i}
              palette={p}
              seed={s}
              liked={i % 5 === 0}
              onAction={setActiveAction}
            />
          ))}
        </div>
        <div style={{height: 14}}/>
      </div>
      <ImageActionSheet
        open={activeAction !== null}
        onClose={() => setActiveAction(null)}
        seed={activeAction?.seed}
        palette={activeAction?.palette}
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
