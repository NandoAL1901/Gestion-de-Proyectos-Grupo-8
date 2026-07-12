# 🚗 Carpool Ulima — Grupo 8

Plataforma web de carpooling exclusiva para estudiantes de la Universidad de Lima.

---

## ⚙️ Configuración en 3 pasos

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto gratuito
2. En el SQL Editor, ejecuta el contenido de `supabase_schema.sql` (es idempotente: puedes re-ejecutarlo sin perder datos)
3. En **Authentication → Providers → Email**, **desactiva "Confirm email"**. El registro crea la cuenta y el perfil en un solo paso, y necesita una sesión inmediata para hacerlo de forma segura (RLS por `auth.uid()`).
4. En **Project Settings → API**, copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

> 🔒 **Seguridad:** los datos personales (correo, código, teléfonos privados) **no** son legibles con la anon key. Cada usuario solo puede leer/editar su propia fila; el matching usa la vista segura `usuarios_directorio`, que oculta correo, código y los teléfonos de quien no quiso mostrarlos.

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
