import { getArchivos } from "@/lib/api";
import { ArchivosCliente } from "./archivos-cliente";

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

export default async function ArchivosPage() {
  const initialFiles = await getArchivos();

  return <ArchivosCliente initialFiles={initialFiles} />;
}
