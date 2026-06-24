# 🚗 Carpool Ulima — Grupo 8

Plataforma web de carpooling exclusiva para estudiantes de la Universidad de Lima.

---

## ⚙️ Configuración en 3 pasos

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto gratuito
2. En el SQL Editor, ejecuta el contenido de `supabase_schema.sql`
3. En **Project Settings → API**, copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 2. Crear archivo `.env`

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

### 3. Instalar y correr

```bash
npm install
npm run dev
```

Abre http://localhost:5173

---

## Funcionalidades implementadas

- Registro con correo @aloe.ulima.edu.pe obligatorio
- Código de alumno de 8 dígitos numéricos obligatorio
- Número de teléfono guardado en BD (para grupos de WhatsApp)
- Dos tipos de usuario: conductor y pasajero
- Matching por distrito de residencia
- Contacto directo por WhatsApp
- Diseño responsive (móvil y desktop)

---

Proyecto académico · Grupo 8 · Universidad de Lima · 2026
