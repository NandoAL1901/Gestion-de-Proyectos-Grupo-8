-- ============================================================
-- CARPOOL ULIMA - Corregir carreras a la lista oficial
-- Reasigna una carrera válida (al azar) a cualquier usuario cuya carrera
-- ya no exista en la lista oficial de la Universidad de Lima.
-- Ejecutar en el SQL Editor de Supabase. Seguro de re-ejecutar.
-- ============================================================

UPDATE usuarios
SET carrera = (ARRAY[
  'Administración', 'Arquitectura', 'Comunicación', 'Contabilidad y Finanzas',
  'Derecho', 'Economía', 'Ingeniería Ambiental', 'Ingeniería Civil',
  'Ingeniería de Sistemas', 'Ingeniería Industrial', 'Ingeniería Mecatrónica',
  'Marketing', 'Negocios Internacionales', 'Psicología'
])[1 + floor(random() * 14)::int]
WHERE carrera NOT IN (
  'Administración', 'Arquitectura', 'Comunicación', 'Contabilidad y Finanzas',
  'Derecho', 'Economía', 'Ingeniería Ambiental', 'Ingeniería Civil',
  'Ingeniería de Sistemas', 'Ingeniería Industrial', 'Ingeniería Mecatrónica',
  'Marketing', 'Negocios Internacionales', 'Psicología'
);

-- Verificación: no debe quedar ninguna carrera fuera de la lista (0 filas)
SELECT carrera, count(*)
FROM usuarios
WHERE carrera NOT IN (
  'Administración', 'Arquitectura', 'Comunicación', 'Contabilidad y Finanzas',
  'Derecho', 'Economía', 'Ingeniería Ambiental', 'Ingeniería Civil',
  'Ingeniería de Sistemas', 'Ingeniería Industrial', 'Ingeniería Mecatrónica',
  'Marketing', 'Negocios Internacionales', 'Psicología'
)
GROUP BY carrera;
