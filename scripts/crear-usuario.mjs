// Crea un usuario interno (auth + perfil) en Supabase.
// Uso:
//   node scripts/crear-usuario.mjs <email> <password> "Nombre Apellido" [rol]
// rol: superadmin (default) | admin
//
// Requiere en .env.local: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const [, , email, password, nombre = "Administrador", rol = "superadmin"] =
  process.argv;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local",
  );
  process.exit(1);
}
if (!email || !password) {
  console.error(
    '❌ Uso: node scripts/crear-usuario.mjs <email> <password> "Nombre" [superadmin|admin]',
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Crear usuario en auth (email ya confirmado)
const { data: created, error: errAuth } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (errAuth) {
  console.error("❌ Error creando usuario auth:", errAuth.message);
  process.exit(1);
}

const userId = created.user.id;

// 2. Insertar/actualizar perfil
const { error: errProfile } = await admin
  .from("profiles")
  .upsert(
    { id: userId, nombre, email, rol, activo: true },
    { onConflict: "id" },
  );

if (errProfile) {
  console.error("❌ Error creando perfil:", errProfile.message);
  console.error(
    "   ¿Ejecutaste supabase/schema.sql para crear la tabla profiles?",
  );
  process.exit(1);
}

console.log(`✅ Usuario creado: ${email} (rol: ${rol})`);
console.log(`   ID: ${userId}`);
console.log("   Ya puedes ingresar en /login");
