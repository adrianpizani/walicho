# Avance del Proyecto - Próximos Pasos para Métricas y Visualización

## Resumen de la Visión Futura (Definido el 7 de noviembre de 2025)

Hemos establecido una estrategia clara para la evolución de la gestión y visualización de métricas, que se centrará en la flexibilidad y la interactividad.

### Puntos Clave:

1.  **Métrica Principal:**
    *   Se seleccionará a través de un único `select box` en el Dashboard principal.
    *   Será la métrica que determine la coloración y visualización principal en el mapa.

2.  **Métricas Secundarias (Comparación):**
    *   Se podrán agregar desde otro `select box` (o un mecanismo similar) en el Dashboard.
    *   No colorearán el mapa directamente, sino que servirán para enriquecer la información y permitir comparaciones.

3.  **Cards de Datos Sumarizados Dinámicas:**
    *   Por cada métrica (principal o secundaria) seleccionada, se generará una "card" de datos sumarizada.
    *   El contenido y el diseño de cada card serán distintos y dependerán del `tipo` de la métrica (Electoral, Demográfica, Geográfica, Temporal).
    *   A futuro, se explorará la personalización del contenido de estas cards.

4.  **Interacción con el Mapa:**
    *   Las cards de datos reaccionarán a la interacción del usuario con el mapa (clic o `hover` sobre los municipios).
    *   Mostrarán información contextualizada y detallada para el municipio o región sobre el que se interactúe.

## Pasos a Seguir (Próxima Fase de Desarrollo)

Para implementar esta visión, los siguientes pasos de alto nivel serán abordados:

1.  **Diseño y Desarrollo de la UI para Selección de Métricas Secundarias:**
    *   Implementar un mecanismo en el frontend (probablemente en la `FilterBar` del Dashboard) que permita al usuario añadir y gestionar múltiples métricas secundarias.

2.  **Extensión de la API para Datos de Múltiples Métricas:**
    *   Desarrollar o adaptar endpoints en el backend que puedan devolver datos para un conjunto de métricas (principal y secundarias) y/o para una geografía específica (municipio/región). Esto es crucial para alimentar las cards y los tooltips.

3.  **Implementación de Componentes de Cards Dinámicas:**
    *   Crear un sistema de componentes en el frontend que pueda renderizar cards de información de manera dinámica.
    *   Cada card deberá ser capaz de interpretar el `tipo` de métrica y mostrar la información relevante de forma adecuada (ej. para Electoral: distribución de votos; para Demográfica: población, edad media, etc.).

4.  **Conexión de Interacción del Mapa con las Cards:**
    *   Asegurar que los eventos de `click` y `hover` en el `MapView` actualicen el contenido de las cards de datos, mostrando la información de las métricas para la geografía seleccionada.

5.  **Refinamiento de la Visualización Electoral:**
    *   Conectar la tarjeta de "Distribución por Partido" existente en el Dashboard con los datos reales de la métrica electoral seleccionada.
    *   Explorar opciones para la visualización de datos en los tooltips del mapa para métricas secundarias.

Estos pasos nos permitirán construir sobre la base actual y expandir significativamente la capacidad de análisis del dashboard.

## Consideraciones Futuras y Escalabilidad (Feedback 11 de noviembre de 2025)

Hemos identificado áreas clave para robustecer y escalar el sistema, anticipando futuras necesidades:

1.  **Sistema de Procesadores Robusto y Dinámico:**
    *   **Objetivo:** Evolucionar el sistema de procesadores actual (que depende de código específico por tipo de archivo) hacia una herramienta interna más flexible.
    *   **Funcionalidad:** Implementar un ABM (Alta, Baja, Modificación) para procesadores. Esto incluiría la capacidad de definir dinámicamente campos, variables y reglas de mapeo, de modo que el sistema pueda adaptarse a nuevos formatos de archivos sin requerir cambios en el código fuente. La meta es la adaptabilidad dinámica a los archivos de entrada.

2.  **Gestión de Métricas y Visualización en Tarjetas:**
    *   **Contexto:** Actualmente, un archivo puede generar múltiples métricas (ej. indicadores socioeconómicos).
    *   **Desafío:** Evaluar cómo se agrupan y muestran estas métricas en el dashboard. Si se seleccionan varias métricas del mismo tipo (ej. múltiples indicadores demográficos), deberían consolidarse o agruparse de manera inteligente en una misma tarjeta, en lugar de generar una tarjeta individual por cada métrica secundaria. Esto optimizará el espacio y la coherencia de la visualización.