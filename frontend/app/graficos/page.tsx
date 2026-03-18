"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { TrendingUp, Users, Vote, BarChartIcon } from "lucide-react"

const participationTrendData = [
  { month: "Ene", 2023: 62, 2024: 65 },
  { month: "Feb", 2023: 63, 2024: 66 },
  { month: "Mar", 2023: 64, 2024: 67 },
  { month: "Abr", 2023: 65, 2024: 68 },
  { month: "May", 2023: 66, 2024: 69 },
  { month: "Jun", 2023: 67, 2024: 70 },
]

const partyComparisonData = [
  { party: "Partido A", 2020: 420000, 2022: 435000, 2024: 450000 },
  { party: "Partido B", 2020: 480000, 2022: 505000, 2024: 520000 },
  { party: "Partido C", 2020: 350000, 2022: 365000, 2024: 380000 },
]

const regionPerformanceData = [
  { region: "Norte", participacion: 72, satisfaccion: 68, crecimiento: 85 },
  { region: "Centro", participacion: 78, satisfaccion: 75, crecimiento: 90 },
  { region: "Sur", participacion: 65, satisfaccion: 62, crecimiento: 70 },
  { region: "Este", participacion: 80, satisfaccion: 78, crecimiento: 88 },
  { region: "Oeste", participacion: 68, satisfaccion: 65, crecimiento: 75 },
]

const demographicDetailData = [
  { name: "18-25", hombres: 45000, mujeres: 48000 },
  { name: "26-40", hombres: 125000, mujeres: 130000 },
  { name: "41-60", hombres: 110000, mujeres: 115000 },
  { name: "60+", hombres: 65000, mujeres: 70000 },
]

const hourlyVotingData = [
  { hora: "8:00", votos: 12000 },
  { hora: "10:00", votos: 45000 },
  { hora: "12:00", votos: 78000 },
  { hora: "14:00", votos: 95000 },
  { hora: "16:00", votos: 110000 },
  { hora: "18:00", votos: 85000 },
]

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"]

export default function GraficosPage() {
  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análisis y Gráficos</h1>
        <p className="text-muted-foreground">Visualización detallada de datos electorales y tendencias</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,543,890</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> vs año anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participación</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.4%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3.2%</span> vs promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5.8%</div>
            <p className="text-xs text-muted-foreground">Crecimiento mensual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regiones Activas</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/32</div>
            <p className="text-xs text-muted-foreground">75% de cobertura</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tendencias" className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
          <TabsTrigger value="comparativa">Comparativa</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="demografico">Demográfico</TabsTrigger>
        </TabsList>

        <TabsContent value="tendencias" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Participación</CardTitle>
                <CardDescription>Comparación interanual por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={participationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="2023" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                    <Area type="monotone" dataKey="2024" stackId="2" stroke="#3b82f6" fill="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flujo de Votación por Hora</CardTitle>
                <CardDescription>Distribución horaria del día electoral</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={hourlyVotingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hora" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="votos" stroke="#22c55e" strokeWidth={3} name="Votos" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparativa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Votos por Partido</CardTitle>
              <CardDescription>Comparación de resultados en las últimas 3 elecciones</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={partyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="party" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="2020" fill="#8b5cf6" name="2020" />
                  <Bar dataKey="2022" fill="#3b82f6" name="2022" />
                  <Bar dataKey="2024" fill="#22c55e" name="2024" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Multidimensional por Región</CardTitle>
              <CardDescription>Participación, satisfacción y crecimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={regionPerformanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="region" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Participación"
                    dataKey="participacion"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Radar name="Satisfacción" dataKey="satisfaccion" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                  <Radar name="Crecimiento" dataKey="crecimiento" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demografico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Edad y Género</CardTitle>
              <CardDescription>Participación electoral segmentada</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={demographicDetailData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hombres" fill="#3b82f6" name="Hombres" />
                  <Bar dataKey="mujeres" fill="#ec4899" name="Mujeres" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
