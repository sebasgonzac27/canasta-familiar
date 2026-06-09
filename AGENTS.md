# Canasta Familiar — guía para agentes

Lista de compras **colaborativa** para el hogar. Cualquier integrante anota lo que falta y la lista
se sincroniza **en tiempo real**; quien va al súper usa el **modo compra** y confirma para limpiar la
lista. Corre en **web** y se compila a **APK de Android**.

## Stack

- **Expo SDK 56** + **React Native 0.85** (React 19) — un solo código para web, iOS y Android.
- **expo-router** (file-based routing) con la app dentro de `src/app/`.
- **Supabase**: auth (correo/contraseña + Google), Postgres y Realtime. Proyecto ref `sbrckaalwiegjvhqlcls`.
- **TypeScript** estricto. Alias `@/*` → `src/*`, `@/assets/*` → `assets/*`.
- **Web** desplegada en **Cloudflare Workers** (static assets, SPA fallback). Ver `wrangler.jsonc`.
- **Android** vía **EAS Build** (perfil `preview` = APK). Ver `eas.json`.

## Estructura

```
src/
  app/            # rutas expo-router
    (auth)/       # onboarding, login, register, recover, setup
    (app)/        # index (lista), agregar, compra, confirmar, hogar, perfil
    _layout.tsx   # raíz: GestureHandlerRootView, providers
    auth-callback.tsx, reset.tsx  # OAuth callback + reset de contraseña
  components/     # UI: Text, Field, Screen, Icon, list, primitives, overlays, GoogleG
  hooks/          # useHouseholdData
  lib/            # supabase, auth, households, items, shopping, errors, toast, household-context
  types/db.ts     # tipos de la base de datos
  theme.ts        # paleta, tipografía (Inter), spacing
```

## Comandos

```bash
npm run web        # dev en navegador
npm run android    # dev en Android (requiere build nativo / EAS)
npm run ios        # dev en iOS (solo macOS)
npm run lint       # expo lint
npm run build:web  # expo export --platform web -> dist/
npm run deploy     # build:web + wrangler deploy (Cloudflare)
```

APK Android: `eas build --platform android --profile preview`.

## Convenciones

- Texto de la UI **en español**.
- Importa con el alias `@/` (no rutas relativas largas).
- Usa los componentes de `src/components` (`Text`, `Field`, `Screen`, etc.) en vez de los nativos crudos.
- Colores/espaciado desde `src/theme.ts`, no valores mágicos.
- Errores de usuario vía `lib/errors` + `lib/toast`.
- La *publishable key* de Supabase es pública por diseño; la seguridad real son las políticas **RLS**.

## Entorno

`.env` (ver `.env.example`):

```
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```
