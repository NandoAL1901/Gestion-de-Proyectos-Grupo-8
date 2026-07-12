import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabase'
import { DISTRITOS_GEO, LIMA_CENTRO } from '../lib/distritos_geo'
import s from './Mapa.module.css'

export default function Mapa({ usuario }) {
  const divRef = useRef(null)
  const mapRef = useRef(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false

    const run = async () => {
      const { data } = await supabase.from('usuarios_directorio').select('distrito, tipo_usuario')
      if (cancel) return

      // Agrupa compañeros por distrito
      const porDistrito = {}
      for (const u of data || []) {
        const d = porDistrito[u.distrito] || (porDistrito[u.distrito] = { total: 0, conductores: 0, pasajeros: 0 })
        d.total++
        if (u.tipo_usuario === 'conductor') d.conductores++
        else d.pasajeros++
      }

      // Inicializa el mapa una sola vez
      if (!mapRef.current && divRef.current) {
        const map = L.map(divRef.current, { scrollWheelZoom: true }).setView(LIMA_CENTRO, 11)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 18,
        }).addTo(map)
        mapRef.current = map
      }

      const map = mapRef.current
      if (!map) return

      Object.entries(porDistrito).forEach(([distrito, c]) => {
        const geo = DISTRITOS_GEO[distrito]
        if (!geo) return
        const esMio = distrito === usuario.distrito
        const marker = L.circleMarker(geo, {
          radius: Math.min(10 + c.total * 3, 28),
          color: esMio ? '#1C1C1A' : '#2D6A4F',
          weight: esMio ? 3 : 1.5,
          fillColor: '#2D6A4F',
          fillOpacity: 0.35,
        }).addTo(map)
        marker.bindPopup(
          `<strong>${distrito}</strong>${esMio ? ' (tu distrito)' : ''}<br/>` +
          `${c.total} estudiante${c.total !== 1 ? 's' : ''}<br/>` +
          `${c.conductores} conductor(es) · ${c.pasajeros} pasajero(s)`
        )
      })

      setLoading(false)
    }

    run()
    return () => {
      cancel = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [usuario.distrito])

  return (
    <div className={s.page}>
      <div className={s.inner}>
        <div className={s.header}>
          <h1 className={s.title}>Mapa de zonas</h1>
          <p className={s.subtitle}>Dónde están los compañeros de Carpool Ulima por distrito. El tamaño del círculo refleja cuántos hay.</p>
        </div>

        <div className={s.mapWrap}>
          <div ref={divRef} className={s.map} />
          {loading && <div className={s.overlay}>Cargando mapa...</div>}
        </div>

        <div className={s.legend}>
          <div className={s.legendItem}><span className={s.dot} /> Distrito con compañeros</div>
          <div className={s.legendItem}><span className={`${s.dot} ${s.dotMine}`} /> Tu distrito ({usuario.distrito})</div>
          <div className={s.legendItem}>Haz clic en un círculo para ver el detalle</div>
        </div>
      </div>
    </div>
  )
}
