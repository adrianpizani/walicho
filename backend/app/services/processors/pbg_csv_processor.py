import csv
import io
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Archivo as ArchivoModel, Metricas, Dimension_Geografica, Hechos_Datos, TipoMetrica

def sanitize_key(text: str) -> str:
    """Limpia un texto para que sea un nombre_clave válido."""
    text = text.lower()
    text = re.sub(r'\s+', '_', text)
    text = re.sub(r'[^a-z0-9_]', '', text)
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
    Procesa un CSV con el Producto Bruto Geográfico (PBG) por partido y lo carga en la base de datos.
    """
    logs = []
    filas_procesadas = 0
    filas_fallidas = 0
    all_hechos = []

    try:
        content_text = file_content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content_text), delimiter=',')

        # Obtener o crear la métrica única para este archivo
        metrica_db = await get_or_create_metrica(db, "pbg_2023", "PBG 2023", db_archivo.id, tipo_metrica)

        for i, row in enumerate(csv_reader, 1):
            municipio_nombre = row.get('seccion_nombre')
            pbg_value_str = row.get('PBG_2023')

            if not municipio_nombre:
                logs.append(f"ADVERTENCIA (Fila {i}): Falta el nombre del municipio (seccion_nombre), se omite la fila.")
                filas_fallidas += 1
                continue

            # Omitir filas donde el valor de PBG es 'undefined'
            if pbg_value_str is None or pbg_value_str.strip().lower() == 'undefined':
                logs.append(f"INFO (Fila {i}): Valor de PBG es 'undefined' para '{municipio_nombre}', se omite el registro.")
                continue

            geografia = await get_geografia_by_nombre(db, municipio_nombre)
            if not geografia:
                logs.append(f"ADVERTENCIA (Fila {i}): Geografía no encontrada para '{municipio_nombre}', se omite la fila.")
                filas_fallidas += 1
                continue

            try:
                valor_numerico = float(pbg_value_str)
            except (ValueError, TypeError):
                logs.append(f"ADVERTENCIA (Fila {i}): Valor no numérico '{pbg_value_str}' para PBG en '{municipio_nombre}', se omite.")
                filas_fallidas += 1
                continue

            hecho = Hechos_Datos(
                archivo_id=db_archivo.id,
                geografia_id=geografia.id,
                metrica_id=metrica_db.id,
                valor=valor_numerico,
                dimension_extra={"fuente": "pbg_homologado.csv"}
            )
            all_hechos.append(hecho)
            filas_procesadas += 1

        if all_hechos:
            db.add_all(all_hechos)
            await db.commit()
            logs.append(f"Procesamiento completado. Se insertaron {len(all_hechos)} registros de hechos.")
        else:
            logs.append("No se encontraron datos válidos para procesar o todas las filas tenían valor 'undefined'.")

    except Exception as e:
        await db.rollback()
        error_msg = f"Error fatal procesando el archivo CSV: {e}"
        logs.append(error_msg)
        # Asignar todas las filas como fallidas en caso de error catastrófico
        if 'csv_reader' in locals() and csv_reader.line_num:
             filas_fallidas = csv_reader.line_num -1
        else:
            filas_fallidas = filas_procesadas + filas_fallidas

        raise Exception(error_msg)

    return {
        "filas_procesadas": filas_procesadas,
        "filas_fallidas": filas_fallidas,
        "log": "\n".join(logs)
    }
