// app/metricas/page.tsx
import { getMetricas } from "@/lib/api";
import { MetricasCliente } from "./metricas-cliente";

export const dynamic = 'force-dynamic';

export default async function MetricasPage() {
  const initialMetricas = await getMetricas();

  return <MetricasCliente initialMetricas={initialMetricas} />;
}
