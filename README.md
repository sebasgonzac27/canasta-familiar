# 🧺 Canasta Familiar

Lista del mercado **colaborativa** para el hogar. Cualquier integrante anota lo que falta y la
lista se sincroniza **en tiempo real**; quien va al supermercado abre el **modo compra**, tacha los
productos con un toque y confirma la compra para limpiar la lista.

Construida con **React Native (Expo)** — corre en **web** y se compila a **APK de Android** — y
**Supabase** (autenticación + Postgres + Realtime).

---

## ✨ Funcionalidades

- **Hogares compartidos** con código de invitación (un usuario puede pertenecer a varios hogares).
- **Lista en tiempo real**: agregar/tachar/eliminar se refleja al instante para todos los miembros.
- **Modo compra** optimizado: ítems grandes, un toque para tachar, los comprados bajan al carrito.
- **Confirmación de compra** explícita: lo comprado se limpia, lo no comprado queda pendiente.
- **Miembros en línea** (presencia) y **notificaciones** ("Ana agregó leche", "Carlos inició la compra").
- **Autenticación** por correo/contraseña (+ botón de Google, ver configuración abajo).
- 8 pantallas según el brief: onboarding, registro/login/recuperar, lista, agregar, modo compra,
  confirmación, hogar y perfil. Tema claro, tipografía Inter, paleta verde.

---

## 🚀 Puesta en marcha

```bash
npm install
cp .env.example .env     # completa con las credenciales de tu proyecto Supabase
npm run web              # abre la app en el navegador
# npm run android        # emulador / dispositivo Android (build nativo, ver abajo)
# npm run ios            # simulador iOS (solo macOS)
```

### Variables de entorno (`.env`)

```
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

> La *publishable key* es pública por diseño (viaja en el cliente). La seguridad real la imponen las
> políticas **RLS** de Supabase, no la clave.

---

## 🔐 Autenticación — pasos manuales

### Confirmación de correo (recomendado para pruebas)

Por defecto Supabase **exige confirmar el correo** antes de iniciar sesión, y el límite de envío de
correos del plan gratuito es bajo. Para una experiencia inmediata durante el desarrollo:

**Dashboard → Authentication → Sign In / Providers → Email →** desactiva **"Confirm email"**.

Si lo dejas activado, la app muestra "Te enviamos un correo para confirmar tu cuenta" tras el
registro; el usuario confirma desde el correo y luego inicia sesión (flujo de producción correcto).

### Login con Google (opcional)

El botón "Continuar con Google" ya está cableado a `supabase.auth.signInWithOAuth`. Para activarlo:

1. Crea credenciales OAuth en Google Cloud Console.
2. **Dashboard → Authentication → Providers → Google**: pega el *Client ID* y *Secret*.
3. Agrega las *redirect URLs* (web: la URL de tu app; nativo: el scheme `canasta://`).

El correo/contraseña funciona sin configuración adicional.

---

## 📦 Generar el APK de Android

Se usa **EAS Build** (servicio de Expo, cuenta gratuita):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview   # genera un .apk instalable
```

El perfil `preview` (en `eas.json`) produce un **APK** (`buildType: apk`). El perfil `production`
produce un `.aab` para Google Play. Alternativa local (requiere Android Studio/SDK):

```bash
npx expo run:android
```

---

## 🗄️ Backend (Supabase)

Esquema aplicado vía migraciones:

| Tabla | Rol |
|---|---|
| `profiles` | Perfil por usuario (nombre, correo, color de avatar). Se crea solo al registrarse. |
| `households` | Hogares, cada uno con `invite_code` único de 6 caracteres. |
| `household_members` | Relación N:N usuario–hogar (permite pertenecer a varios hogares). |
| `items` | Productos: `pending` → `checked` → `confirmed`. |
| `shopping_sessions` | Sesión de "modo compra" activa (quién compra, progreso). |

**Funciones RPC**: `create_household`, `join_household_by_code`, `confirm_shopping`.
**RLS**: cada tabla está restringida a los miembros del hogar (helper `is_household_member`,
`SECURITY DEFINER` para evitar recursión). **Realtime** habilitado en `items`,
`shopping_sessions` y `household_members`. La presencia de "en línea" usa Realtime Presence.

---

## 🧭 Estructura

```
src/
  app/                      # rutas (expo-router)
    (auth)/                 # onboarding, login, register, recover, setup
    (app)/                  # index (lista), agregar, compra, confirmar, hogar, perfil
  components/               # Icon, Avatar, Button, Field, ListItem, FAB, Toast, Sheet…
  lib/                      # supabase, auth, household-context, households, items, shopping, toast
  hooks/useHouseholdData.ts # carga + sincronización en tiempo real por hogar
  theme.ts                  # design tokens (colores, radios, tipografía)
  types/db.ts               # tipos generados de Supabase
```

---

## 🧪 Estado verificado

- ✅ `tsc --noEmit` sin errores y el bundle web (`expo export -p web`) compila.
- ✅ Backend probado de punta a punta con JWT real y RLS activa: crear hogar → agregar ítem →
  iniciar sesión de compra → tachar → `confirm_shopping` limpia la lista y archiva lo comprado.

## Notas de implementación

- El brief pide *swipe-left para eliminar*; aquí se implementó como **mantener presionado** un ítem
  (con *snackbar* de deshacer de 3 s) para máxima compatibilidad web + nativo.
- Los colores de avatar de los miembros son equivalentes hex de la paleta oklch del brief
  (RN no soporta `oklch`).
