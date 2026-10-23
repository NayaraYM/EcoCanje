export default function SetupNotice() {
  return (
    <main className="wrap pad narrow">
      <h1>Falta conectar Supabase</h1>
      <p>La web necesita dos variables de entorno para funcionar. Crea un archivo <code>.env</code> en la raíz del proyecto (puedes copiar <code>.env.example</code>) con:</p>
      <pre className="snippet">{`VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_public`}</pre>
      <p>Los dos valores están en Supabase, en <b>Project Settings → API</b>. Luego reinicia <code>npm run dev</code>. En Vercel se cargan en <b>Settings → Environment Variables</b>.</p>
    </main>
  )
}
