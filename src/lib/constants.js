export const DISTRITOS = [
  'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chorrillos', 'Cieneguilla',
  'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina',
  'La Victoria', 'Lince', 'Los Olivos', 'Lurigancho', 'Lurín', 'Magdalena del Mar',
  'Miraflores', 'Pachacámac', 'Pueblo Libre', 'Puente Piedra', 'Rímac',
  'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores',
  'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santiago de Surco',
  'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'
]

// Carreras oficiales de la Universidad de Lima
export const CARRERAS = [
  'Administración',
  'Arquitectura',
  'Comunicación',
  'Contabilidad y Finanzas',
  'Derecho',
  'Economía',
  'Ingeniería Ambiental',
  'Ingeniería Civil',
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Mecatrónica',
  'Marketing',
  'Negocios Internacionales',
  'Psicología',
]

// Horario de clases: 7:00 am a 10:00 pm
export const HORARIOS = [
  '7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am',
  '12:00 pm', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm',
  '5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm', '9:00 pm', '10:00 pm',
]

// Distritos colindantes (aproximado) para el matching por cercanía.
// Permite sugerir compañeros de zonas vecinas, no solo del distrito exacto.
export const DISTRITOS_VECINOS = {
  'Ate': ['Santa Anita', 'San Luis', 'El Agustino', 'La Molina', 'San Borja', 'Lurigancho', 'San Juan de Lurigancho'],
  'Barranco': ['Miraflores', 'Chorrillos', 'Santiago de Surco'],
  'Breña': ['Jesús María', 'Pueblo Libre', 'La Victoria', 'Lince'],
  'Carabayllo': ['Comas', 'Puente Piedra', 'San Martín de Porres'],
  'Chorrillos': ['Barranco', 'Santiago de Surco', 'San Juan de Miraflores', 'Villa El Salvador'],
  'Cieneguilla': ['Pachacámac', 'La Molina', 'Lurigancho'],
  'Comas': ['Carabayllo', 'Independencia', 'Los Olivos', 'San Martín de Porres', 'Puente Piedra'],
  'El Agustino': ['La Victoria', 'San Luis', 'Ate', 'Santa Anita', 'Rímac', 'San Juan de Lurigancho'],
  'Independencia': ['Comas', 'Los Olivos', 'San Martín de Porres', 'Rímac', 'San Juan de Lurigancho'],
  'Jesús María': ['Breña', 'Pueblo Libre', 'Magdalena del Mar', 'San Isidro', 'Lince'],
  'La Molina': ['Ate', 'Santiago de Surco', 'Cieneguilla'],
  'La Victoria': ['El Agustino', 'San Luis', 'San Borja', 'San Isidro', 'Lince', 'Breña'],
  'Lince': ['Jesús María', 'San Isidro', 'La Victoria', 'Magdalena del Mar'],
  'Los Olivos': ['Comas', 'Independencia', 'San Martín de Porres', 'Puente Piedra'],
  'Lurigancho': ['Ate', 'Santa Anita', 'San Juan de Lurigancho', 'Cieneguilla'],
  'Lurín': ['Pachacámac', 'Villa El Salvador', 'Villa María del Triunfo'],
  'Magdalena del Mar': ['San Isidro', 'Jesús María', 'Pueblo Libre', 'San Miguel', 'Lince'],
  'Miraflores': ['Barranco', 'Santiago de Surco', 'San Isidro', 'Surquillo'],
  'Pachacámac': ['Cieneguilla', 'La Molina', 'Villa María del Triunfo', 'Lurín', 'Villa El Salvador'],
  'Pueblo Libre': ['Magdalena del Mar', 'San Miguel', 'Jesús María', 'Breña'],
  'Puente Piedra': ['Carabayllo', 'Comas', 'Los Olivos', 'San Martín de Porres'],
  'Rímac': ['San Juan de Lurigancho', 'Independencia', 'San Martín de Porres', 'El Agustino'],
  'San Borja': ['San Isidro', 'Santiago de Surco', 'Surquillo', 'La Victoria', 'San Luis', 'Ate'],
  'San Isidro': ['Miraflores', 'Surquillo', 'Lince', 'San Borja', 'Magdalena del Mar', 'Jesús María', 'La Victoria'],
  'San Juan de Lurigancho': ['Rímac', 'El Agustino', 'Independencia', 'Lurigancho', 'San Martín de Porres', 'Ate'],
  'San Juan de Miraflores': ['Santiago de Surco', 'Chorrillos', 'Villa María del Triunfo', 'Villa El Salvador'],
  'San Luis': ['La Victoria', 'San Borja', 'Ate', 'El Agustino', 'Santa Anita'],
  'San Martín de Porres': ['Los Olivos', 'Independencia', 'Comas', 'Rímac', 'Carabayllo', 'Puente Piedra'],
  'San Miguel': ['Magdalena del Mar', 'Pueblo Libre'],
  'Santa Anita': ['Ate', 'San Luis', 'El Agustino', 'Lurigancho', 'San Juan de Lurigancho'],
  'Santiago de Surco': ['Miraflores', 'Barranco', 'San Borja', 'Surquillo', 'Chorrillos', 'San Juan de Miraflores', 'La Molina'],
  'Surquillo': ['Miraflores', 'San Isidro', 'Santiago de Surco', 'San Borja'],
  'Villa El Salvador': ['Chorrillos', 'San Juan de Miraflores', 'Villa María del Triunfo', 'Lurín', 'Pachacámac'],
  'Villa María del Triunfo': ['San Juan de Miraflores', 'Villa El Salvador', 'Pachacámac', 'Lurín'],
}
