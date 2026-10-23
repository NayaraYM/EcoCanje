# EcoCanje Huancayo

Prototipo funcional: web app donde comerciantes, vendedores ambulantes y compradores del Mercado Modelo de Huancayo
se registran, acumulan EcoPuntos por separar residuos y canjean premios útiles.

**Stack:** Vite + React + React Router · Supabase (Auth + Postgres + RLS) · Vercel.

## Roles y qué ve cada uno

| Rol | Cómo se obtiene | Qué ve |
|---|---|---|
| Comerciante / Vendedor ambulante | Registro en la web | Saldo, código de socio, alertas de premios, historial, impacto (CO₂), canje de premios |
| Comprador frecuente | Registro en la web | Todo lo anterior + **puntos familiares** (crear familia o unirse con código) |
| Operador EcoCanje | Se asigna a mano (paso 4) | Registrar entregas (pesaje → EcoPuntos), entregar canjes, controlar stock |

El registro **nunca** permite crear operadores: el rol `admin` solo se asigna desde Supabase.

## Paso 1. Crear el proyecto en Supabase
1. Entra a https://supabase.com, crea una cuenta y un **New project** (guarda la contraseña de la base de datos).
2. Menú **SQL Editor → New query**, pega todo `supabase/schema.sql` y pulsa **Run**. Crea tablas, seguridad (RLS), funciones y datos iniciales (materiales y catálogo de premios).
3. **Authentication → Providers → Email**: para la demo desactiva **Confirm email** (así el registro entra directo). Si lo dejas activo, cada usuario debe confirmar su correo.
4. **Project Settings → API**: copia **Project URL** y la clave **anon public**.

## Paso 2. Correr el proyecto en tu computadora
```bash
npm install
cp .env.example .env     # en Windows: copy .env.example .env
# abre .env y pega tu URL y tu anon key
npm run dev
```
Abre http://localhost:5173

## Paso 3. Crear usuarios de prueba
Desde la web, en **Crear cuenta**, registra uno de cada rol (comerciante, vendedor, comprador) y uno más para el operador.

## Paso 4. Convertir un usuario en operador
En Supabase → SQL Editor:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'correo-del-operador@ejemplo.com');
```
Cierra sesión y vuelve a ingresar con ese correo: verás el **Panel del operador**.

## Paso 5. Probar el flujo completo (guion para la demo)
1. Ingresa como **operador** → *Registrar entrega*: busca al comerciante por nombre o código (EC-XXXXXX), elige material y peso.
2. Ingresa como **comerciante**: verás sus EcoPuntos, la alerta de premio alcanzado y su impacto de CO₂.
3. Canjea un premio en **Premios**. El operador lo ve en *Canjes por entregar* y lo marca como entregado.
4. Como **comprador**: crea una familia, comparte el código y une a otro usuario; el saldo se vuelve familiar.

## Paso 6. Subir a GitHub
```bash
git init
git add .
git commit -m "EcoCanje Huancayo - prototipo"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/ecocanje-huancayo.git
git push -u origin main
```
(`.env` está en `.gitignore`: tus claves no se suben.)

## Paso 7. Desplegar en Vercel
1. https://vercel.com → **Add New → Project** → importa el repositorio de GitHub.
2. Vercel detecta Vite solo. En **Environment Variables** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. **Deploy**. Cada `git push` a `main` vuelve a desplegar.
4. En Supabase → **Authentication → URL Configuration**, pon la URL de Vercel en *Site URL* (necesario si usas confirmación por correo).

## Qué personalizar antes de presentar
- `src/lib/constants.js`: **datos de contacto del footer** (correo y WhatsApp están de ejemplo), horarios y guía de separación.
- `supabase/schema.sql` (sección final) o tablas `materials` / `rewards` desde el *Table Editor*: puntos por kg, factores de CO₂ y catálogo.
  Los factores de CO₂ son **referenciales**: cita la fuente que uses en tu informe.
- Equivalencia usada: 1 EcoPunto ≈ S/ 0.05 de producto.

## Estructura
```
src/
  context/   AuthContext (sesión y perfil) · WalletContext (saldo, entregas, canjes, premios)
  components/ Layout (menú por rol + footer) · PrizeAlert · Protected · Logo
  pages/     Home · Auth · Dashboard · Rewards · Impact · Family · Guide · Schedule · Admin
  lib/       supabase.js · constants.js
supabase/schema.sql   tablas, RLS, funciones (register_deposit, redeem_reward, familias) y datos iniciales
```
