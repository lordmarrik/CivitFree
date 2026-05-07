// Variant 2: Generation results gallery + history feed.
// Shows recent runs as clusters, each with the prompt, seeds, grid of images.

const PALETTES = [
  ['#1d2240','#3a2563','#7d3a8a','#d65a8a'],
  ['#0f1f29','#244a3f','#5e8a4f','#c8c266'],
  ['#2a1217','#5c2531','#a93958','#f4a07a'],
  ['#15202b','#23425b','#3e7b9c','#7fc4d8'],
  ['#211418','#532935','#a04a52','#e0a585'],
  ['#0e1a2c','#1b3553','#3e6792','#a3c4dd'],
  ['#251c2f','#4a2e63','#8a4f9e','#d8a6e0'],
  ['#1a1614','#3a2b22','#7a5238','#d39d61'],
];

function FakeImg({ palette, seed, ratio = '2/3' }) {
  // Generate a deterministic colored "image" from a seeded gradient + accents
  const p = PALETTES[palette % PALETTES.length];
  const a = (seed * 13) % 360;
  const b = (seed * 47) % 360;
  return (
    <div className="layer" style={{
      background: `
        radial-gradient(ellipse at ${30 + (seed % 40)}% ${20 + (seed * 3 % 40)}%, ${p[3]} 0%, transparent 35%),
        radial-gradient(ellipse at ${60 + (seed * 7 % 30)}% ${70 + (seed * 5 % 25)}%, ${p[2]} 0%, transparent 45%),
        linear-gradient(${a}deg, ${p[0]} 0%, ${p[1]} 100%)
      `,
    }}>
      <div style={{
        position:'absolute', inset:0,
        background: `repeating-linear-gradient(${b}deg, transparent 0 6px, rgba(255,255,255,.03) 6px 7px)`
      }}/>
    </div>
  );
}

function GenCard({ palette, seed, ratio, liked }) {
  const [isLiked, setLiked] = React.useState(liked);
  return (
    <div className={`cf-gen-card ${ratio === '1:1' ? 'r1' : ratio === '3:4' ? 'r3' : ''}`}>
      <FakeImg palette={palette} seed={seed}/>
      <button className={`heart ${isLiked ? 'liked' : ''}`} onClick={() => setLiked(!isLiked)}>
        <Ic.Heart size={13} fill={isLiked ? 'currentColor' : 'none'}/>
      </button>
      <div className="meta">
        <span className="seedtag">#{seed}</span>
      </div>
    </div>
  );
}

function RunHeader({ when, prompt }) {
  return (
    <div className="cf-run-head">
      <span className="when">{when}</span>
      <span className="prompt">{prompt}</span>
      <button className="reuse">Reuse</button>
    </div>
  );
}

function VariantGallery() {
  return (
    <div className="cf-frame">
      <StatusBar/>
      <TopBar active="grid"/>
      <div className="cf-body">

        <div className="cf-progress-card">
          <div className="row">
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, oklch(0.45 0.18 340), oklch(0.40 0.16 220))',
              display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              <Ic.Sparkle size={16} color="white"/>
            </div>
            <div style={{flex:1}}>
              <div className="lbl">Generating · 4 of 4</div>
              <div className="small mute" style={{marginTop: 2}}>step 26/40 · Euler a · seed 687051578</div>
            </div>
            <div className="pct mono">62%</div>
          </div>
          <div className="bar"><i style={{inset: '0 38% 0 0'}}/></div>
        </div>

        <RunHeader when="14:21" prompt='"a desert temple glowing at dusk, volumetric…"'/>
        <div className="cf-gallery-grid">
          <GenCard palette={0} seed={3812} liked/>
          <GenCard palette={1} seed={9145}/>
          <GenCard palette={2} seed={2204}/>
          <GenCard palette={3} seed={6877}/>
        </div>

        <RunHeader when="14:09" prompt='"vintage portrait, 35mm film, soft window light"'/>
        <div className="cf-gallery-grid">
          <GenCard palette={4} seed={1190}/>
          <GenCard palette={5} seed={8842} liked/>
        </div>

        <RunHeader when="13:48" prompt='"isometric pixel city, neon signage"'/>
        <div className="cf-gallery-grid">
          <GenCard palette={6} seed={4321}/>
          <GenCard palette={7} seed={5559}/>
          <GenCard palette={0} seed={2018}/>
          <GenCard palette={1} seed={7720}/>
        </div>

        <div style={{height: 14}}/>
      </div>

      {/* Compact prompt redock */}
      <div className="cf-dock">
        <div className="cf-dock-row1">
          <div className="cf-queue-bar">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`seg ${i < 9 ? 'lit' : ''}`}/>
            ))}
          </div>
          <span className="cf-link">View queue</span>
          <span className="cf-breakdown">Breakdown <Ic.Info size={12}/></span>
        </div>
        <div className="cf-dock-row2">
          <div className="cf-qty">
            <div className="num">4</div>
            <div className="lbl">QTY</div>
            <div className="arrows">
              <Ic.CaretUp size={9}/>
              <Ic.CaretDown size={9}/>
            </div>
          </div>
          <button className="cf-generate">
            <span>Generate again</span>
            <span className="price"><Ic.Bolt size={11} color="oklch(0.85 0.18 70)"/>20<Ic.ChevDown size={10}/></span>
          </button>
          <button className="cf-history-btn"><Ic.Refresh size={18}/></button>
        </div>
      </div>
    </div>
  );
}

window.VariantGallery = VariantGallery;
window.FakeImg = FakeImg;
window.GenCard = GenCard;
window.RunHeader = RunHeader;
