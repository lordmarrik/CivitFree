/* eslint-disable react-refresh/only-export-components -- Mock image palettes and FakeImg intentionally share a module. */
export const PALETTES = [
  ['#1d2240','#3a2563','#7d3a8a','#d65a8a'],
  ['#0f1f29','#244a3f','#5e8a4f','#c8c266'],
  ['#2a1217','#5c2531','#a93958','#f4a07a'],
  ['#15202b','#23425b','#3e7b9c','#7fc4d8'],
  ['#211418','#532935','#a04a52','#e0a585'],
  ['#0e1a2c','#1b3553','#3e6792','#a3c4dd'],
  ['#251c2f','#4a2e63','#8a4f9e','#d8a6e0'],
  ['#1a1614','#3a2b22','#7a5238','#d39d61'],
];

export function FakeImg({ palette, seed }) {
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
