import { requireProfile } from "@/lib/auth/guards";
import { Topbar } from "@/components/dashboard/Topbar";
import { ProductosAdmin } from "@/components/dashboard/ProductosAdmin";
import { getProductos } from "@/lib/data/contenido";

export default async function TiendaDashboardPage() {
  const profile = await requireProfile();
  const productos = await getProductos();

  return (
    <>
      <Topbar titulo="Tienda" esSuperadmin={profile.rol === "superadmin"} />
      <div className="p-4 lg:p-8">
        <ProductosAdmin productos={productos} />
      </div>
    </>
  );
}
