# Frontend SaaS - Consultorios Médicos

Frontend Next.js para el sistema SaaS de gestión de consultorios médicos.

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_CLINIC_SLUG=consultorio-ensigna
NEXT_PUBLIC_API_KEY=VB1mMnoaV2ZLXuW1zH2QrWHMLLfH0kWo
```

**Nota:** El `NEXT_PUBLIC_API_KEY` debe coincidir con `SAAS_API_KEY` del backend.

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
frontend-clinica-saas/
├── app/                    # Páginas Next.js (App Router)
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── dashboard/         # Dashboard principal
│   └── layout.tsx         # Layout principal
├── contexts/              # Contextos de React
│   └── AuthContext.tsx    # Contexto de autenticación
├── lib/                   # Utilidades y clientes
│   └── api.ts             # Cliente API para comunicarse con el backend
└── .env.local             # Variables de entorno (no commitear)
```

## Flujo de Autenticación

### Registro

1. El usuario accede a `/register`
2. Completa el formulario con sus datos
3. El frontend envía `POST /auth/register` con el header `x-clinic-slug`
4. El backend asocia el usuario a la clínica como OWNER
5. Redirige a `/login`

### Login

1. El usuario accede a `/login`
2. Ingresa email y contraseña
3. El frontend envía `POST /auth/login`
4. El backend devuelve un JWT
5. El JWT se guarda en `localStorage`
6. Redirige a `/dashboard`

### Dashboard

1. Al cargar, verifica si hay JWT
2. Si no hay JWT, redirige a `/login`
3. Si hay JWT, carga datos del usuario y la clínica
4. Muestra información de la clínica y del usuario

## Decisiones de Diseño

### Almacenamiento del JWT

**Decisión:** Usar `localStorage` en lugar de cookies httpOnly.

**Razón:** 
- Para desarrollo local es más fácil de debuggear
- En producción, se recomienda migrar a cookies httpOnly para mayor seguridad
- El interceptor de axios maneja automáticamente el token

### Headers Automáticos

El cliente API (`lib/api.ts`) agrega automáticamente:
- `Authorization: Bearer <JWT>` cuando hay token
- `x-api-key` para endpoints públicos protegidos
- `x-clinic-slug` en el registro (desde variables de entorno)

### Protección de Rutas

El dashboard verifica la autenticación usando el contexto `AuthContext`:
- Si `isLoading` es `true`, muestra loading
- Si `isAuthenticated` es `false`, redirige a `/login`

## Próximos Pasos

- [ ] Agregar gestión de usuarios (invitaciones ADMIN/STAFF)
- [ ] Agregar gestión de profesionales
- [ ] Agregar gestión de pacientes
- [ ] Agregar gestión de turnos
- [ ] Migrar JWT a cookies httpOnly en producción
- [ ] Agregar manejo de múltiples clínicas (select-clinic)
