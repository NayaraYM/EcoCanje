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
- Equivalencia usada: **1 EcoPunto = S/ 0.10** (ver la sección «Economía de puntos»).

## Economía de puntos (precios reales)
Regla: **1 EcoPunto = S/ 0.10**. Los puntos por kg salen de lo que paga la recicladora, y el valor de cada premio, del precio de venta.

| Material | Recicladora paga | Puntos por kg | Origen del dato |
|---|---|---|---|
| Plásticos valorizables | S/ 1.00/kg | 10 | Dato real |
| Cartón limpio | S/ 0.20/kg | 2 | Dato real |
| Botellas PET | S/ 1.50/kg | 15 | **Estimado**, confirmar |
| Latas | S/ 3.00/kg | 30 | **Estimado** (aluminio), confirmar |
| Restos de frutas y verduras | sin precio | 0.5 | Apoyo simbólico, lo cubre un auspicio o el valor del compost |

| Premio | Valor | EcoPuntos |
|---|---|---|
| 👜 Bolsa reutilizable de tela | S/ 1.00 | 10 |
| 🗑️ Bolsas para residuos (10 un.) | S/ 1.40 | 15 |
| 🧴 Lejía 636 ml | S/ 2.00 | 20 |
| 🧼 Jabón de lavar (1 barra) | S/ 2.30 | 25 |
| 🫧 Detergente 500 g | S/ 2.70 | 30 |
| 🌱 Bolsas biodegradables (20 un.) | S/ 4.00 | 40 |
| 🪴 Plantita ornamental | S/ 4.00 | 40 |
| 🧻 Papel higiénico (4 rollos) | S/ 4.30 | 45 |
| 🧽 Esponjas de cocina (3 un.) | S/ 6.00 | 60 |
| 🧤 Guantes de limpieza | S/ 10.00 | 100 |
| 🧹 Kit de limpieza (lejía + detergente + jabón + esponjas) | S/ 13.00 | 130 |

Ejemplo: 5 kg de PET = 75 puntos = una lejía y un jabón. 10 kg de cartón = 20 puntos = una lejía.
El sistema devuelve en puntos el valor de lo que paga la recicladora, así que se sostiene si compran los premios al por mayor (más barato que el precio de venta).

### Ya ejecuté el schema.sql antes: cómo aplicar los nuevos valores
Supabase → SQL Editor → pega `supabase/actualizar_precios_y_puntos.sql` → Run. No borra usuarios, entregas ni canjes; las entregas antiguas conservan sus puntos. Se puede ejecutar más de una vez.

## Imágenes
Las ilustraciones (tachos, puesto de mercado, iconos de pasos, guía, horarios y árboles) son SVG propios en `src/components/Art.jsx`.
Para mostrar una **foto real del Mercado Modelo** en el inicio, guarda la imagen como `public/img/mercado-modelo.jpg` (carpeta nueva `img` dentro de `public`). Si no existe, esa sección se oculta sola.

## Estructura
```
src/
  context/   AuthContext (sesión y perfil) · WalletContext (saldo, entregas, canjes, premios)
  components/ Layout (menú por rol + footer) · PrizeAlert · Protected · Logo
  pages/     Home · Auth · Dashboard · Rewards · Impact · Family · Guide · Schedule · Admin
  lib/       supabase.js · constants.js
supabase/schema.sql   tablas, RLS, funciones (register_deposit, redeem_reward, familias) y datos iniciales
```
