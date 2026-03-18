"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"

export default function ConfiguracionPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState([30])
  const [mapOpacity, setMapOpacity] = useState([70])
  const [alertThreshold, setAlertThreshold] = useState([50])

  const handleSave = () => {
    toast.success("Configuración guardada correctamente")
  }

  const handleReset = () => {
    setAutoRefresh(true)
    setDarkMode(false)
    setNotifications(true)
    setRefreshInterval([30])
    setMapOpacity([70])
    setAlertThreshold([50])
    toast.info("Configuración restablecida a valores por defecto")
  }

  return (
    <div className="h-screen overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Configuración</h1>
            <p className="text-muted-foreground">Ajusta el comportamiento general del sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restablecer
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="visualizacion">Visualización</TabsTrigger>
            <TabsTrigger value="datos">Datos</TabsTrigger>
            <TabsTrigger value="analisis">Análisis</TabsTrigger>
            <TabsTrigger value="exportacion">Exportación</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>Ajustes básicos del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualización Automática</Label>
                    <p className="text-sm text-muted-foreground">Actualizar datos automáticamente</p>
                  </div>
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>

                <div className="space-y-2">
                  <Label>Intervalo de Actualización (segundos)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={refreshInterval}
                      onValueChange={setRefreshInterval}
                      max={300}
                      min={10}
                      step={10}
                      className="flex-1"
                      disabled={!autoRefresh}
                    />
                    <span className="w-12 text-sm font-medium">{refreshInterval[0]}s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones</Label>
                    <p className="text-sm text-muted-foreground">Recibir alertas del sistema</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Oscuro</Label>
                    <p className="text-sm text-muted-foreground">Tema oscuro de la interfaz</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select defaultValue="america-argentina">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-argentina">América/Argentina</SelectItem>
                      <SelectItem value="america-mexico">América/México</SelectItem>
                      <SelectItem value="america-colombia">América/Colombia</SelectItem>
                      <SelectItem value="europe-madrid">Europa/Madrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visualization Settings */}
          <TabsContent value="visualizacion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Visualización</CardTitle>
                <CardDescription>Personaliza la apariencia del mapa y gráficos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="map-style">Estilo de Mapa</Label>
                  <Select defaultValue="osm">
                    <SelectTrigger id="map-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="osm">OpenStreetMap</SelectItem>
                      <SelectItem value="satellite">Satélite</SelectItem>
                      <SelectItem value="terrain">Terreno</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Opacidad de Capas (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={mapOpacity}
                      onValueChange={setMapOpacity}
                      max={100}
                      min={0}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{mapOpacity[0]}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color-scheme">Esquema de Colores</Label>
                  <Select defaultValue="default">
                    <SelectTrigger id="color-scheme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Por Defecto</SelectItem>
                      <SelectItem value="colorblind">Accesible (Daltonismo)</SelectItem>
                      <SelectItem value="high-contrast">Alto Contraste</SelectItem>
                      <SelectItem value="pastel">Colores Pastel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chart-type">Tipo de Gráfico Predeterminado</Label>
                  <Select defaultValue="bar">
                    <SelectTrigger id="chart-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Barras</SelectItem>
                      <SelectItem value="line">Líneas</SelectItem>
                      <SelectItem value="pie">Circular</SelectItem>
                      <SelectItem value="area">Área</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animation-speed">Velocidad de Animaciones</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger id="animation-speed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin animaciones</SelectItem>
                      <SelectItem value="slow">Lenta</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Rápida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Settings */}
          <TabsContent value="datos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Datos</CardTitle>
                <CardDescription>Gestiona fuentes y procesamiento de datos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="data-source">Fuente de Datos Principal</Label>
                  <Select defaultValue="local">
                    <SelectTrigger id="data-source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Base de Datos Local</SelectItem>
                      <SelectItem value="api">API Externa</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">Endpoint de API</Label>
                  <Input id="api-endpoint" placeholder="https://api.ejemplo.com/datos" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">Clave de API</Label>
                  <Input id="api-key" type="password" placeholder="••••••••••••••••" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cache-duration">Duración de Caché (minutos)</Label>
                  <Input id="cache-duration" type="number" defaultValue="60" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-records">Máximo de Registros por Consulta</Label>
                  <Input id="max-records" type="number" defaultValue="1000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data-format">Formato de Datos Preferido</Label>
                  <Select defaultValue="json">
                    <SelectTrigger id="data-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="geojson">GeoJSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Settings */}
          <TabsContent value="analisis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Análisis</CardTitle>
                <CardDescription>Ajusta parámetros de análisis y algoritmos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Umbral de Alerta de Participación (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={alertThreshold}
                      onValueChange={setAlertThreshold}
                      max={100}
                      min={0}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{alertThreshold[0]}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Alertar cuando la participación esté por debajo de este valor
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence-level">Nivel de Confianza Estadístico</Label>
                  <Select defaultValue="95">
                    <SelectTrigger id="confidence-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                      <SelectItem value="99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aggregation-method">Método de Agregación</Label>
                  <Select defaultValue="weighted">
                    <SelectTrigger id="aggregation-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Promedio Simple</SelectItem>
                      <SelectItem value="weighted">Promedio Ponderado</SelectItem>
                      <SelectItem value="median">Mediana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outlier-detection">Detección de Valores Atípicos</Label>
                  <Select defaultValue="iqr">
                    <SelectTrigger id="outlier-detection">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Desactivado</SelectItem>
                      <SelectItem value="iqr">Rango Intercuartílico (IQR)</SelectItem>
                      <SelectItem value="zscore">Z-Score</SelectItem>
                      <SelectItem value="isolation">Isolation Forest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trend-analysis">Análisis de Tendencias</Label>
                  <Select defaultValue="linear">
                    <SelectTrigger id="trend-analysis">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Desactivado</SelectItem>
                      <SelectItem value="linear">Regresión Lineal</SelectItem>
                      <SelectItem value="polynomial">Regresión Polinomial</SelectItem>
                      <SelectItem value="moving-average">Media Móvil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prediction-model">Modelo de Predicción</Label>
                  <Select defaultValue="none">
                    <SelectTrigger id="prediction-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Desactivado</SelectItem>
                      <SelectItem value="arima">ARIMA</SelectItem>
                      <SelectItem value="prophet">Prophet</SelectItem>
                      <SelectItem value="lstm">LSTM Neural Network</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Settings */}
          <TabsContent value="exportacion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Exportación</CardTitle>
                <CardDescription>Define formatos y opciones de exportación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="export-format">Formato de Exportación Predeterminado</Label>
                  <Select defaultValue="xlsx">
                    <SelectTrigger id="export-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="geojson">GeoJSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf-orientation">Orientación de PDF</Label>
                  <Select defaultValue="landscape">
                    <SelectTrigger id="pdf-orientation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Vertical</SelectItem>
                      <SelectItem value="landscape">Horizontal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-resolution">Resolución de Imágenes (DPI)</Label>
                  <Select defaultValue="300">
                    <SelectTrigger id="image-resolution">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="72">72 (Pantalla)</SelectItem>
                      <SelectItem value="150">150 (Estándar)</SelectItem>
                      <SelectItem value="300">300 (Alta Calidad)</SelectItem>
                      <SelectItem value="600">600 (Impresión)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csv-delimiter">Delimitador CSV</Label>
                  <Select defaultValue="comma">
                    <SelectTrigger id="csv-delimiter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comma">Coma (,)</SelectItem>
                      <SelectItem value="semicolon">Punto y coma (;)</SelectItem>
                      <SelectItem value="tab">Tabulación</SelectItem>
                      <SelectItem value="pipe">Barra vertical (|)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export-template">Plantilla de Reporte</Label>
                  <Textarea
                    id="export-template"
                    placeholder="Ingresa una plantilla personalizada para reportes..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="watermark">Marca de Agua</Label>
                  <Input id="watermark" placeholder="Texto de marca de agua (opcional)" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Incluir Metadatos</Label>
                    <p className="text-sm text-muted-foreground">Agregar información de fecha y autor</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Comprimir Archivos</Label>
                    <p className="text-sm text-muted-foreground">Crear archivo ZIP para múltiples exportaciones</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
