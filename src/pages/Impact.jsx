import { useWallet } from '../context/WalletContext.jsx'
import { KG_PER_TREE_CO2, fmtDate, num } from '../lib/constants.js'
import { Icon } from '../components/Art.jsx'

export default function Impact() {
  const { deposits, family } = useWallet()
  const kg = deposits.reduce((s, d) => s + Number(d.kg), 0)
  const co2 = deposits.reduce((s, d) => s + Number(d.co2_kg), 0)
  const byMat = {}
  deposits.forEach((d) => {
    const n = d.materials?.name || 'Otros'
    byMat[n] = (byMat[n] || 0) + Number(d.kg)
  })
  const rows = Object.entries(byMat).sort((a, b) => b[1] - a[1])
  const max = rows[0]?.[1] || 1
  const trees = Math.min(12, Math.round(co2 / KG_PER_TREE_CO2))

  return (
    <section className="wrap pad">
      <h1>Mi impacto ambiental</h1>
      <p className="sub">{family ? 'Lo que lograron entre todos en tu familia.' : 'Lo que lograste al separar y entregar tus residuos.'} El CO₂ es un estimado con factores referenciales.</p>

      <div className="stats">
        <div className="stat main"><small>CO₂ evitado</small><b>{num(co2)} kg</b></div>
        <div className="stat"><small>Residuos recuperados</small><b>{num(kg)} kg</b></div>
        <div className="stat"><small>Equivale a árboles al año</small><b>{num(co2 / KG_PER_TREE_CO2)}</b></div>
      </div>

      {trees > 0 && (
        <div className="card forest" aria-label={`Equivale a ${trees} árboles`}>
          {Array.from({ length: trees }, (_, i) => <Icon key={i} name="arbol" size={44} />)}
          <p>Tu aporte equivale a unos {num(co2 / KG_PER_TREE_CO2)} árboles trabajando durante un año.</p>
        </div>
      )}

      <div className="card">
        <h2>Residuos por tipo</h2>
        {rows.length === 0 ? (
          <p>Todavía no hay entregas registradas. Tu primer pesaje aparecerá aquí.</p>
        ) : (
          <ul className="bars">
            {rows.map(([name, v]) => (
              <li key={name}>
                <span>{name}</span>
                <div className="bar"><i style={{ width: `${(v / max) * 100}%` }} /></div>
                <b>{num(v)} kg</b>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deposits.length > 0 && (
        <div className="card">
          <h2>Historial</h2>
          <div className="scroll">
            <table>
              <thead><tr><th>Fecha</th><th>Material</th><th>Peso</th><th>CO₂ evitado</th></tr></thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d.id}><td>{fmtDate(d.created_at)}</td><td>{d.materials?.name}</td><td>{num(d.kg)} kg</td><td>{num(d.co2_kg, 2)} kg</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
