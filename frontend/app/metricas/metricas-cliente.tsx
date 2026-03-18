'use client'

import { useState } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge, BadgeProps } from "@/components/ui/badge"
import { toggleMetrica } from "@/lib/api"

// --- Tipos de Datos ---
enum TipoMetrica {
  ELECTORAL = "ELECTORAL",
  DEMOGRAFICA = "DEMOGRAFICA",
  GEOGRAFICA = "GEOGRAFICA",
  TEMPORAL = "TEMPORAL",
}

interface ArchivoForMetrica {
  id: number;
  nombre_visible: string;
}

interface MetricaItem {
  id: number;
  nombre_amigable: string;
  is_active: boolean;
  tipo: TipoMetrica;
  archivo: ArchivoForMetrica | null;
}

interface MetricasClienteProps {
  initialMetricas: MetricaItem[];
}

// --- Componente para Badge de Tipo de Métrica ---
const TipoMetricaBadge: React.FC<{ tipo: TipoMetrica }> = ({ tipo }) => {
  const typeStyles: { [key in TipoMetrica]: { variant: BadgeProps['variant']; text: string } } = {
    [TipoMetrica.ELECTORAL]: { variant: "default", text: "Electoral" },
    [TipoMetrica.DEMOGRAFICA]: { variant: "secondary", text: "Demográfica" },
    [TipoMetrica.GEOGRAFICA]: { variant: "outline", text: "Geográfica" },
    [TipoMetrica.TEMPORAL]: { variant: "secondary", text: "Temporal" },
  };

  const style = typeStyles[tipo] || { variant: "default", text: tipo };

  return <Badge variant={style.variant}>{style.text}</Badge>;
};


// --- Componente Principal ---
export function MetricasCliente({ initialMetricas }: MetricasClienteProps) {
  const [metricas, setMetricas] = useState<MetricaItem[]>(initialMetricas);

  const handleToggle = async (metricId: number) => {
    // Actualización optimista de la UI
    setMetricas(currentMetricas =>
      currentMetricas.map(m =>
        m.id === metricId ? { ...m, is_active: !m.is_active } : m
      )
    );

    try {
      // Llamada a la API
      await toggleMetrica(metricId);
      toast.success("Estado de la métrica actualizado");
    } catch (error) {
      toast.error("Error al actualizar la métrica");
      // Revertir el cambio si la API falla
      setMetricas(currentMetricas =>
        currentMetricas.map(m =>
          m.id === metricId ? { ...m, is_active: !m.is_active } : m
        )
      );
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-2xl font-semibold">Gestión de Métricas</h1>
        <p className="text-sm text-muted-foreground">
          Active o desactive las métricas que desea visualizar en el mapa electoral.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Métrica</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Archivo de Origen</TableHead>
                    <TableHead className="text-right">Activa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No se encontraron métricas. Sube un archivo para generarlas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    metricas.map((metrica) => (
                      <TableRow key={metrica.id}>
                        <TableCell className="font-medium">{metrica.nombre_amigable}</TableCell>
                        <TableCell>
                          <TipoMetricaBadge tipo={metrica.tipo} />
                        </TableCell>
                        <TableCell>
                          {metrica.archivo ? (
                            <Badge variant="outline">{metrica.archivo.nombre_visible}</Badge>
                          ) : (
                            <Badge variant="secondary">N/A</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={metrica.is_active}
                            onCheckedChange={() => handleToggle(metrica.id)}
                            aria-label={`Activar métrica ${metrica.nombre_amigable}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
