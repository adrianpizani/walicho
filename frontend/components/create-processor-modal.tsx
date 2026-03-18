"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useProcessors, Procesador, ProcesadorCreate } from "@/hooks/use-processors"

interface CreateProcessorModalProps {
    isOpen: boolean
    onClose: () => void
    fileHeaders: string[]
    tipoMetrica: string
    onProcessorCreated: (processor: Procesador) => void
}

const NIVELES_GEOGRAFICOS = ["Circuito", "Seccion", "Partido", "Municipio"] // Opciones de niveles

export const CreateProcessorModal: React.FC<CreateProcessorModalProps> = ({
    isOpen,
    onClose,
    fileHeaders,
    tipoMetrica,
    onProcessorCreated,
}) => {
    const { createProcessor } = useProcessors()
    const [processorName, setProcessorName] = useState("")
    const [geographyIdentifierColumn, setGeographyIdentifierColumn] = useState<string>("")
    const [nivelGeografico, setNivelGeografico] = useState<string>("")
    const [valueColumn, setValueColumn] = useState<string>("") // Nuevo estado para la columna de valor
    const [metricNameInput, setMetricNameInput] = useState<string>("") // Nuevo estado para el nombre de la métrica
    const [isCreating, setIsCreating] = useState(false)

    // Resetear el estado cuando el modal se abre o los encabezados cambian
    React.useEffect(() => {
        if (isOpen) {
            setProcessorName("")
            setGeographyIdentifierColumn("")
            setNivelGeografico("")
            setValueColumn("")
            setMetricNameInput("")

            // Intentar preseleccionar una columna geográfica y su nivel
            const defaultGeoColumn = fileHeaders.find(header => 
                header.toLowerCase().includes("circuito") || 
                header.toLowerCase().includes("seccion") ||
                header.toLowerCase().includes("partido") ||
                header.toLowerCase().includes("municipio") ||
                header.toLowerCase().includes("geografia") ||
                header.toLowerCase().includes("distrito")
            )
            if (defaultGeoColumn) {
                setGeographyIdentifierColumn(defaultGeoColumn)
                const lowerCaseHeader = defaultGeoColumn.toLowerCase()
                if (lowerCaseHeader.includes("circuito")) setNivelGeografico("Circuito")
                else if (lowerCaseHeader.includes("seccion")) setNivelGeografico("Seccion")
                else if (lowerCaseHeader.includes("partido")) setNivelGeografico("Partido")
                else if (lowerCaseHeader.includes("municipio")) setNivelGeografico("Municipio")
            }

            // Intentar preseleccionar la columna de valor
            const defaultValueColumn = fileHeaders.find(header =>
                header.toLowerCase().includes("votos") ||
                header.toLowerCase().includes("cantidad") ||
                header.toLowerCase().includes("valor") ||
                header.toLowerCase().includes("total")
            )
            if (defaultValueColumn) {
                setValueColumn(defaultValueColumn)
                // Sugerir un nombre de métrica basado en la columna de valor
                setMetricNameInput(defaultValueColumn.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
            }
        }
    }, [isOpen, fileHeaders])

    const handleCreate = async () => {
        if (!processorName.trim()) {
            toast.error("Por favor, ingrese un nombre para el procesador.")
            return
        }
        if (!geographyIdentifierColumn) {
            toast.error("Por favor, seleccione la columna que identifica la geografía.")
            return
        }
        if (!nivelGeografico) {
            toast.error("Por favor, seleccione el nivel geográfico.")
            return
        }
        if (!valueColumn) {
            toast.error("Por favor, seleccione la columna que contiene el valor/métrica principal.")
            return
        }
        if (!metricNameInput.trim()) {
            toast.error("Por favor, ingrese un nombre para la métrica principal.")
            return
        }

        const mappings: { [key: string]: string } = {}
        fileHeaders.forEach(header => {
            if (header === geographyIdentifierColumn) {
                mappings[header] = "geography_identifier" // Mapeo especial para la columna geográfica
            } else if (header === valueColumn) {
                mappings[header] = "value_identifier" // Mapeo especial para la columna de valor
            }
            else {
                mappings[header] = header // Mapeo 1 a 1 para el resto (dimensiones extra)
            }
        })

        setIsCreating(true)
        try {
            const processorData: ProcesadorCreate = {
                nombre: processorName.trim(),
                tipo_archivo: tipoMetrica,
                nivel_geografico: nivelGeografico,
                metric_name: metricNameInput.trim(), // Añadir el nombre de la métrica principal
                mapeo_columnas: mappings,
            }
            const newProcessor = await createProcessor(processorData)
            if (newProcessor) {
                onProcessorCreated(newProcessor)
                onClose() // Cierra el modal al tener éxito
            }
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"> {/* Ampliar ancho del modal */}
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Procesador</DialogTitle>
                    <DialogDescription>
                        No se encontró un procesador para este formato de archivo. Defina uno nuevo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="processor-name">Nombre del Procesador *</Label>
                        <Input
                            id="processor-name"
                            placeholder="Ej: Formato Elecciones 2023"
                            value={processorName}
                            onChange={(e) => setProcessorName(e.target.value)}
                        />
                         <p className="text-sm text-muted-foreground">
                            Asigne un nombre único para este formato de archivo.
                        </p>
                    </div>

                    {/* Selector de Columna Geográfica y Nivel */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="geo-identifier-column">Columna Geográfica *</Label>
                            <Select
                                value={geographyIdentifierColumn}
                                onValueChange={setGeographyIdentifierColumn}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar columna" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fileHeaders.map((header) => (
                                        <SelectItem key={header} value={header}>
                                            {header}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="geo-level">Nivel Geográfico *</Label>
                            <Select
                                value={nivelGeografico}
                                onValueChange={setNivelGeografico}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar nivel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {NIVELES_GEOGRAFICOS.map((nivel) => (
                                        <SelectItem key={nivel} value={nivel}>
                                            {nivel}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <p className="text-sm text-muted-foreground">
                        Elija la columna que contiene el ID geográfico y su nivel.
                    </p>

                    {/* Selector de Columna de Valor/Métrica y Nombre de la Métrica */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="value-column">Columna de Valor/Métrica Principal *</Label>
                            <Select
                                value={valueColumn}
                                onValueChange={setValueColumn}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar columna de valor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fileHeaders.map((header) => (
                                        <SelectItem key={header} value={header}>
                                            {header}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="metric-name-input">Nombre de la Métrica Principal *</Label>
                            <Input
                                id="metric-name-input"
                                placeholder="Ej: Votos Totales"
                                value={metricNameInput}
                                onChange={(e) => setMetricNameInput(e.target.value)}
                            />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Seleccione la columna con los datos numéricos y asigne un nombre a la métrica.
                    </p>

                    <div className="space-y-2">
                        <Label>Encabezados del Archivo Detectados:</Label>
                        <div className="flex flex-wrap gap-2 rounded-md border p-2">
                            {fileHeaders.map((header, index) => (
                                <Badge 
                                    key={index} 
                                    variant={
                                        header === geographyIdentifierColumn ? "default" :
                                        header === valueColumn ? "default" : 
                                        "secondary"
                                    }
                                >
                                    {header}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isCreating}>
                        Cancelar
                    </Button>
                    <Button onClick={handleCreate} disabled={isCreating}>
                        {isCreating ? "Creando..." : "Crear y Usar Procesador"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
