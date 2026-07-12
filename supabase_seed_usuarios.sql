-- ============================================================
-- CARPOOL ULIMA - Datos de prueba: 209 usuarios (91% pasajeros / 9% conductores)
-- Ejecutar en el SQL Editor de Supabase (usa el rol admin, así salta la RLS).
--
-- Distribución:
--   Lince 39 (36 pas / 3 cond) · Villa María del Triunfo 45 (41/4)
--   Jesús María 41 (37/4) · La Molina 41 (37/4) · Santiago de Surco 43 (39/4)
--   Total: 209 (190 pasajeros = 90.9% · 19 conductores = 9.1%)
--
-- Códigos y correos: 8 dígitos, año 2020–2026 (########@aloe.ulima.edu.pe).
-- El script elige automáticamente códigos que NO existan ya en la tabla, así
-- se ven reales y es IMPOSIBLE que choquen con alumnos reales.
-- Son solo para poblar matching, mapa y estadísticas: no tienen cuenta de
-- Auth, no inician sesión.
--
-- ⚠️ Ejecutar UNA sola vez. Para re-generar (o borrar estos datos de prueba),
--    corre la limpieza — elimina los usuarios sin cuenta de Auth (los de seed):
--   DELETE FROM usuarios u WHERE NOT EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id);
-- ============================================================

WITH cfg(distrito, n_pas, n_cond) AS (
  VALUES
    ('Lince', 36, 3),
    ('Villa María del Triunfo', 41, 4),
    ('Jesús María', 37, 4),
    ('La Molina', 37, 4),
    ('Santiago de Surco', 39, 4)
),
expanded AS (
  SELECT distrito, 'pasajero'::text AS tipo, generate_series(1, n_pas) FROM cfg
  UNION ALL
  SELECT distrito, 'conductor'::text AS tipo, generate_series(1, n_cond) FROM cfg
),
numbered AS (
  SELECT distrito, tipo, row_number() OVER () AS rn FROM expanded
),
-- Códigos candidatos 2020–2026 (8 dígitos) que NO existan ya como código ni correo
codigos AS (
  SELECT codigo, row_number() OVER (ORDER BY random()) AS idx
  FROM (
    SELECT lpad((yr * 10000 + seq)::text, 8, '0') AS codigo
    FROM generate_series(2020, 2026) AS yr,
         generate_series(0, 9999) AS seq
  ) c
  WHERE codigo NOT IN (SELECT codigo_ulima FROM usuarios)
    AND (codigo || '@aloe.ulima.edu.pe') NOT IN (SELECT correo FROM usuarios)
),
d AS (
  SELECT
    ARRAY['Ana','Luis','María','José','Carla','Jorge','Lucía','Diego','Sofía','Miguel','Valeria','Andrés','Camila','Fernando','Daniela','Gabriel','Paola','Ricardo','Andrea','Sebastián','Rosa','Carlos','Elena','Manuel','Isabel','Fabrizio','Claudia','Renzo','Patricia','Alonso'] AS pn,
    ARRAY['García','Rodríguez','Martínez','López','Gonzáles','Pérez','Sánchez','Ramírez','Torres','Flores','Rivera','Díaz','Vásquez','Castillo','Rojas','Mendoza','Cruz','Morales','Ortiz','Gutiérrez','Chávez','Ramos','Herrera','Medina','Aguilar','Vargas','Campos','Núñez','Salazar','Paredes'] AS an,
    ARRAY['Administración de Empresas','Arquitectura','Ciencias de la Comunicación','Contabilidad','Derecho','Economía','Ingeniería Civil','Ingeniería de Sistemas','Ingeniería Industrial','Psicología','Nutrición','Traducción e Interpretación'] AS carr,
    ARRAY['7:00 am','8:00 am','9:00 am','10:00 am','11:00 am'] AS hent,
    ARRAY['12:00 pm','1:00 pm','2:00 pm','3:00 pm'] AS hsal,
    ARRAY['Toyota Corolla','Kia Rio','Hyundai Accent','Nissan Sentra','Volkswagen Gol','Chevrolet Sail','Suzuki Swift','Toyota Yaris'] AS autos
)
INSERT INTO usuarios (
  id, codigo_ulima, nombre_completo, correo, telefono, carrera, distrito,
  tipo_usuario, horario_entrada, horario_salida, mostrar_telefono,
  modelo_auto, placa_auto, asientos_disponibles, activo
)
SELECT
  gen_random_uuid(),
  cd.codigo,
  d.pn[1 + floor(random() * array_length(d.pn, 1))::int] || ' ' ||
    d.an[1 + floor(random() * array_length(d.an, 1))::int] || ' ' ||
    d.an[1 + floor(random() * array_length(d.an, 1))::int],
  cd.codigo || '@aloe.ulima.edu.pe',
  '9' || lpad(floor(random() * 100000000)::int::text, 8, '0'),
  d.carr[1 + floor(random() * array_length(d.carr, 1))::int],
  n.distrito,
  n.tipo,
  d.hent[1 + floor(random() * array_length(d.hent, 1))::int],
  CASE WHEN random() < 0.6 THEN d.hsal[1 + floor(random() * array_length(d.hsal, 1))::int] END,
  (random() < 0.85),
  CASE WHEN n.tipo = 'conductor'
       THEN d.autos[1 + floor(random() * array_length(d.autos, 1))::int] || ' ' || (2015 + floor(random() * 9))::int::text END,
  CASE WHEN n.tipo = 'conductor'
       THEN chr(65 + floor(random() * 26)::int) || chr(65 + floor(random() * 26)::int) || chr(65 + floor(random() * 26)::int)
            || '-' || lpad(floor(random() * 1000)::int::text, 3, '0') END,
  CASE WHEN n.tipo = 'conductor' THEN 1 + floor(random() * 4)::int END,
  true
FROM numbered n
JOIN codigos cd ON cd.idx = n.rn
CROSS JOIN d;

-- Verificación (debe sumar 209; 190 pasajeros y 19 conductores):
SELECT distrito, tipo_usuario, count(*)
FROM usuarios u
WHERE NOT EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id)
GROUP BY distrito, tipo_usuario
ORDER BY distrito, tipo_usuario;
