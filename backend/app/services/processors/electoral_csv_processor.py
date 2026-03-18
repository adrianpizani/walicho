
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
            tipo=tipo  # Asigna el tipo de métrica
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
    Procesa un CSV electoral con formato "long" y lo carga en la base de datos.
    Devuelve un diccionario con el resultado del procesamiento.
    """
    logs = []
    filas_procesadas = 0
    filas_fallidas = 0
    all_hechos = []
    metricas_creadas = set()

    try:
        content_text = file_content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content_text), delimiter=',')
        
        for i, row in enumerate(csv_reader, 1):
            # --- Extracción y Validación de Datos ---
            municipio_nombre = row.get('seccion_nombre')
            votos_str = row.get('votos_cantidad')
            agrupacion_nombre = row.get('agrupacion_nombre')
            cargo_nombre = row.get('cargo_nombre')

            if not all([municipio_nombre, votos_str, agrupacion_nombre, cargo_nombre]):
                logs.append(f"ADVERTENCIA (Fila {i}): Faltan datos clave, se omite la fila.")
                filas_fallidas += 1
                continue

            # --- Búsqueda de Geografía ---
            geografia = await get_geografia_by_nombre(db, municipio_nombre)
            if not geografia:
                logs.append(f"ADVERTENCIA (Fila {i}): Municipio no encontrado '{municipio_nombre}', se omite la fila.")
                filas_fallidas += 1
                continue

            # --- Creación Dinámica de Métrica Generalizada ---
            metrica_amigable = f"Votos {cargo_nombre}"
            metrica_clave = sanitize_key(metrica_amigable)
            
            # Se asocia la métrica con el archivo y el tipo seleccionados
            metrica_db = await get_or_create_metrica(db, metrica_clave, metrica_amigable, db_archivo.id, tipo_metrica)

            # --- Conversión de Valor ---
            try:
                valor_numerico = float(votos_str)
            except (ValueError, TypeError):
                logs.append(f"ADVERTENCIA (Fila {i}): Valor no numérico para '{metrica_amigable}' en '{municipio_nombre}', se omite.")
                filas_fallidas += 1
                continue

            # --- Recolección de Dimensiones Extra ---
            dimension_extra = {
                "año": row.get('año'),
                "votos_tipo": row.get('votos_tipo'),
                "circuito_id": row.get('circuito_id'),
                "seccionprovincial_nombre": row.get('seccionprovincial_nombre'),
                "cargo_id": row.get('cargo_id'),
                "agrupacion_id": row.get('agrupacion_id'),
                "agrupacion_nombre": agrupacion_nombre # Campo que faltaba
            }

            # --- Creación del Objeto Hechos_Datos ---
            hecho = Hechos_Datos(
                archivo_id=db_archivo.id,
                geografia_id=geografia.id,
                metrica_id=metrica_db.id,
                valor=valor_numerico,
                dimension_extra=dimension_extra
            )
            all_hechos.append(hecho)

        # --- Inserción en Lote ---
        if all_hechos:
            db.add_all(all_hechos)
            await db.commit()
            filas_procesadas = len(all_hechos)
            logs.append(f"Procesamiento completado. Se insertaron {filas_procesadas} registros.")
        else:
            logs.append("No se encontraron datos válidos para procesar.")

    except Exception as e:
        await db.rollback()
        logs.append(f"Error fatal procesando el archivo CSV: {e}")
        filas_fallidas = i if 'i' in locals() else 0 # Asume que todas fallaron
        # Re-lanzamos la excepción para que el servicio de carga la maneje
        raise
    
    return {
        "filas_procesadas": filas_procesadas,
        "filas_fallidas": filas_fallidas,
        "log": "\n".join(logs)
    }
