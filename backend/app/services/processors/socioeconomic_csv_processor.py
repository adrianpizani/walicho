import csv
import io
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Archivo as ArchivoModel, Metricas, Dimension_Geografica, Hechos_Datos, TipoMetrica

def sanitize_key(text: str) -> str:
    """Limpia un texto para que sea un nombre_clave válido."""
    text = text.lower()
    text = re.sub(r'\s+', '_', text)  # Reemplaza espacios con guiones bajos
    text = re.sub(r'[^a-z0-9_]', '', text) # Elimina caracteres no alfanuméricos
    return text.strip('_')

async def get_or_create_metrica(db: AsyncSession, nombre_clave: str, nombre_amigable: str, archivo_id: int, tipo: TipoMetrica) -> Metricas:
    """Busca una métrica por su nombre clave o la crea si no existe, asociándola a un archivo y un tipo."""
    result = await db.execute(select(Metricas).filter_by(nombre_clave=nombre_clave))
    metrica = result.scalars().first()
    if not metrica:
        metrica = Metricas(
            nombre_clave=nombre_clave, 
            nombre_amigable=nombre_amigable,
            archivo_id=archivo_id,
            tipo=tipo
        )
        db.add(metrica)
        await db.flush()
    return metrica

async def get_geografia_by_nombre(db: AsyncSession, nombre: str) -> Dimension_Geografica | None:
    """Busca una geografía por su nombre."""
    result = await db.execute(select(Dimension_Geografica).filter_by(nombre=nombre))
    return result.scalars().first()

async def process(db: AsyncSession, db_archivo: ArchivoModel, file_content: bytes, tipo_metrica: TipoMetrica) -> dict:
    """
    Procesa un CSV con indicadores socioeconómicos y lo carga en la base de datos.
    """
    logs = []
    filas_procesadas = 0
    filas_fallidas = 0
    all_hechos = []
    
    # Columnas que representan métricas en el CSV de indicadores socioeconómicos
    INDICATOR_COLUMNS = [
        'Poblacion_Total', 'Ingreso_Promedio', 'Tasa_Desempleo', 
        'Indice_NBI', 'Tasa_Alfabetizacion'
    ]

    try:
        content_text = file_content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content_text), delimiter=',')
        
        for i, row in enumerate(csv_reader, 1):
            municipio_nombre = row.get('municipio')

            if not municipio_nombre:
                logs.append(f"ADVERTENCIA (Fila {i}): Falta el nombre del municipio, se omite la fila.")
                filas_fallidas += 1
                continue

            geografia = await get_geografia_by_nombre(db, municipio_nombre)
            if not geografia:
                logs.append(f"ADVERTENCIA (Fila {i}): Municipio no encontrado '{municipio_nombre}', se omite la fila.")
                filas_fallidas += 1
                continue

            for indicator_col in INDICATOR_COLUMNS:
                indicator_value_str = row.get(indicator_col)
                
                if not indicator_value_str:
                    logs.append(f"ADVERTENCIA (Fila {i}, Columna '{indicator_col}'): Falta el valor del indicador, se omite.")
                    continue # No falla la fila completa, solo este indicador

                try:
                    valor_numerico = float(indicator_value_str)
                except (ValueError, TypeError):
                    logs.append(f"ADVERTENCIA (Fila {i}, Columna '{indicator_col}'): Valor no numérico '{indicator_value_str}', se omite.")
                    continue

                metrica_amigable = indicator_col.replace('_', ' ') # Ej: "Poblacion Total"
                metrica_clave = sanitize_key(indicator_col) # Ej: "poblacion_total" 
                
                metrica_db = await get_or_create_metrica(db, metrica_clave, metrica_amigable, db_archivo.id, tipo_metrica)

                hecho = Hechos_Datos(
                    archivo_id=db_archivo.id,
                    geografia_id=geografia.id,
                    metrica_id=metrica_db.id,
                    valor=valor_numerico,
                    dimension_extra={"indicador_nombre": indicator_col} # Guardar el nombre original del indicador
                )
                all_hechos.append(hecho)
            filas_procesadas += 1 # Contar la fila como procesada si al menos un indicador se procesó

        if all_hechos:
            db.add_all(all_hechos)
            await db.commit()
            logs.append(f"Procesamiento completado. Se insertaron {len(all_hechos)} registros de hechos.")
        else:
            logs.append("No se encontraron datos válidos para procesar.")

    except Exception as e:
        await db.rollback()
        logs.append(f"Error fatal procesando el archivo CSV: {e}")
        filas_fallidas = i if 'i' in locals() else 0
        raise
    
    return {
        "filas_procesadas": filas_procesadas,
        "filas_fallidas": filas_fallidas,
        "log": "\n".join(logs)
    }