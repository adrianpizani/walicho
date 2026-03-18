// frontend/lib/processor-fields.ts

export const SYSTEM_FIELDS = [
    "nombre_completo",
    "dni",
    "circuito_electoral_id",
    "seccion_electoral_id",
    "municipio_id",
    "provincia_id",
    "partido_politico",
    "lista_votos",
    "candidato",
    "cantidad_votos",
    "sexo",
    "edad",
    "ingreso_promedio",
    "nivel_educativo",
    "fecha_dato",
    "valor_generico" // Para métricas cuyo nombre no es predefinido
    // Añadir aquí otros campos internos del sistema relevantes para el mapeo
]

// Nota: Estos campos deben coincidir con los que el backend espera procesar.
// En una fase posterior, estos campos podrían ser dinámicos y autogenerados por el backend.
