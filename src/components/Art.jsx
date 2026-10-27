// Ilustraciones propias (SVG) para EcoCanje: no dependen de imágenes externas.

const C = { hoja: '#1f4a12', oliva: '#7d8f3a', lima: '#8fbf3a', maiz: '#f1a20d', azul: '#3f8fdc', crema: '#f9efd7', carton: '#c98b4a', rojo: '#d9533a' }

// Símbolo de reciclaje: dos arcos con flechas
const Cycle = ({ cx, cy, r = 7 }) => {
  const pt = (a) => [r * Math.cos((a * Math.PI) / 180), r * Math.sin((a * Math.PI) / 180)]
  const arc = (a0, a1) => {
    const [x0, y0] = pt(a0), [x1, y1] = pt(a1)
    return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`
  }
  const head = (a) => {
    const [x, y] = pt(a)
    const t = ((a + 90) * Math.PI) / 180
    const tx = Math.cos(t), ty = Math.sin(t), nx = -ty, ny = tx, s = r * 0.55
    return `M${x + tx * s} ${y + ty * s}L${x + nx * s * 0.8} ${y + ny * s * 0.8}L${x - nx * s * 0.8} ${y - ny * s * 0.8}z`
  }
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <path d={arc(205, 335)} fill="none" stroke="#fff" strokeWidth={Math.max(2, r * 0.28)} strokeLinecap="round" />
      <path d={arc(25, 155)} fill="none" stroke="#fff" strokeWidth={Math.max(2, r * 0.28)} strokeLinecap="round" />
      <path d={head(335)} fill="#fff" />
      <path d={head(155)} fill="#fff" />
    </g>
  )
}

// Tres tachos de colores con el símbolo de reciclaje
export function Bins({ className }) {
  const bins = [[10, '#f1a20d', '#d98a00'], [105, '#3f8fdc', '#2f6fb0'], [200, '#6fae2a', '#4f8a1a']]
  return (
    <svg className={className} viewBox="0 0 300 175" role="img" aria-label="Tachos para separar residuos">
      <ellipse cx="150" cy="166" rx="140" ry="7" fill="#000" opacity="0.15" />
      {bins.map(([x, c, d]) => (
        <g key={x}>
          <path d={`M${x + 8} 54h74l-6 108H${x + 14}z`} fill={c} />
          <rect x={x + 30} y="30" width="30" height="10" rx="4" fill={d} />
          <rect x={x} y="38" width="90" height="18" rx="6" fill={d} />
          <Cycle cx={x + 45} cy="108" r="15" />
        </g>
      ))}
    </svg>
  )
}

// Puesto de mercado con toldo y cajones de fruta
export function Stall({ className }) {
  const stripes = Array.from({ length: 8 }, (_, i) => i)
  const fruit = [[34, C.maiz], [100, C.rojo], [166, C.lima], [232, C.maiz]]
  return (
    <svg className={className} viewBox="0 0 320 215" role="img" aria-label="Puesto del Mercado Modelo">
      {stripes.map((i) => (
        <path key={i} d={`M${20 + i * 35} 34h35v26a17.5 17.5 0 0 1-35 0z`} fill={i % 2 ? '#1f4a12' : '#f1a20d'} />
      ))}
      <rect x="20" y="26" width="280" height="10" rx="3" fill="#d98a00" />
      <rect x="24" y="60" width="6" height="140" fill="#8a5a2b" />
      <rect x="290" y="60" width="6" height="140" fill="#8a5a2b" />
      <rect x="110" y="78" width="100" height="26" rx="5" fill="#fffaf0" />
      <text x="160" y="96" textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="15" fill="#1f4a12">Mercado Modelo</text>
      {fruit.map(([x, c]) => (
        <g key={x}>
          {[0, 1, 2, 3].map((k) => <circle key={k} cx={x + 10 + k * 14} cy={142 - (k % 2) * 6} r="9" fill={c} />)}
          <rect x={x} y="146" width="62" height="18" rx="3" fill="#a06a35" />
        </g>
      ))}
      <rect x="20" y="164" width="280" height="38" rx="4" fill={C.carton} />
      <rect x="20" y="164" width="280" height="8" fill="#8a5a2b" />
    </svg>
  )
}

const paths = {
  separa: (<><path d="M12 14h24l-2 28H14z" fill="#3f8fdc" /><rect x="9" y="9" width="30" height="6" rx="2" fill="#2f6fb0" /><Cycle cx="24" cy="29" r="6" /></>),
  entrega: (<><path d="M17 15c0-4 3-7 7-7s7 3 7 7l5 7c3 7 0 18-12 18S7 29 12 22z" fill="#d8c18a" /><path d="M18 15h12" stroke="#8a6a2b" strokeWidth="3" strokeLinecap="round" /><path d="M20 29h8M24 25v8" stroke="#8a6a2b" strokeWidth="2.5" strokeLinecap="round" /></>),
  acumula: (<><rect x="8" y="34" width="32" height="8" rx="2" fill={C.oliva} /><circle cx="24" cy="20" r="12" fill="#fffaf0" stroke={C.hoja} strokeWidth="3" /><path d="M24 20l6-5" stroke={C.rojo} strokeWidth="3" strokeLinecap="round" /><circle cx="24" cy="20" r="2" fill={C.hoja} /></>),
  canjea: (<><rect x="8" y="22" width="32" height="19" rx="2" fill={C.maiz} /><rect x="6" y="15" width="36" height="8" rx="2" fill="#d98a00" /><rect x="21" y="15" width="6" height="26" fill={C.rojo} /><path d="M24 15c-7-9-13-2-6 0zM24 15c7-9 13-2 6 0z" fill={C.rojo} /></>),
  valoriza: (<><path d="M24 40V24" stroke={C.hoja} strokeWidth="3" strokeLinecap="round" /><path d="M24 28c-9 0-11-7-11-11 9 0 11 5 11 11z" fill={C.lima} /><path d="M24 24c0-7 4-10 11-10 0 7-4 10-11 10z" fill="#6fae2a" /><path d="M13 41h22" stroke="#8a5a2b" strokeWidth="3" strokeLinecap="round" /></>),
  organico: (<><path d="M9 29C9 18 18 10 35 10c0 14-7 25-20 25-4 0-6-2-6-6z" fill={C.lima} /><path d="M11 38C18 29 25 22 34 14" stroke={C.hoja} strokeWidth="2.6" fill="none" strokeLinecap="round" /></>),
  carton: (<><path d="M6 15l18-8 18 8v19l-18 8-18-8z" fill={C.carton} /><path d="M6 15l18 8 18-8M24 23v19" stroke="#8a5a2b" strokeWidth="2" fill="none" /><rect x="17" y="11" width="14" height="5" fill="#e6bf8a" transform="rotate(-18 24 13)" /></>),
  pet: (<><rect x="19" y="3" width="10" height="5" rx="1.5" fill={C.hoja} /><path d="M20 8h8v5l3.5 5v21a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V18l3.5-5z" fill="#7cc4f0" stroke="#2f6f9f" strokeWidth="2" /><path d="M16.5 26h15" stroke="#2f6f9f" strokeWidth="2" /></>),
  latas: (<><rect x="13" y="9" width="22" height="31" rx="3" fill={C.rojo} /><rect x="13" y="20" width="22" height="9" fill={C.crema} /><ellipse cx="24" cy="9" rx="11" ry="3.2" fill="#e6e6e6" stroke="#9a9a9a" /></>),
  plasticos: (<><path d="M11 17h26l3 23a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" fill={C.maiz} /><path d="M17 17v-3a7 7 0 0 1 14 0v3" stroke="#a86b00" strokeWidth="2.8" fill="none" /></>),
  reloj: (<><circle cx="24" cy="25" r="17" fill="#fffaf0" stroke={C.hoja} strokeWidth="3" /><path d="M24 14v11l7 5" stroke={C.hoja} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>),
  camion: (<><rect x="4" y="14" width="25" height="20" rx="2" fill={C.oliva} /><path d="M29 20h9l6 7v7H29z" fill={C.hoja} /><circle cx="14" cy="36" r="5" fill="#333" /><circle cx="36" cy="36" r="5" fill="#333" /><Cycle cx="16" cy="24" r="5" /></>),
  arbol: (<><rect x="21" y="30" width="6" height="12" fill="#8a5a2b" /><circle cx="24" cy="20" r="12" fill="#6fae2a" /><circle cx="17" cy="25" r="7" fill={C.lima} /><circle cx="31" cy="24" r="7" fill={C.lima} /></>),
}

export function Icon({ name, size = 48 }) {
  return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">{paths[name]}</svg>
}
