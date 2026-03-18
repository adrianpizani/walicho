
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from models import Archivo as ArchivoModel, EstadoProcesamiento, TipoMetrica, Procesador 
from sqlalchemy import select 
from sqlalchemy.orm import selectinload 

# Importamos nuestro procesador genérico
from services.processors.generic_csv_processor import process_generic_csv


async def process_file(db: AsyncSession, db_archivo: ArchivoModel, file_content: bytes, tipo_metrica: TipoMetrica, processor_id: int):
    """
    Dispatcher principal para el procesamiento de archivos.
    Actualiza el estado del archivo en la BD antes, durante y después del procesamiento.
    Ahora utiliza el ID de un Procesador guardado en la BD.
    """
    # 1. Marcar como PROCESANDO
    db_archivo.estado = EstadoProcesamiento.PROCESANDO
    db_archivo.log_procesamiento = "Iniciando procesamiento..."
    await db.commit()

    resultado = None
    try:
        # 2. Obtener el Procesador de la base de datos
        stmt = select(Procesador).where(Procesador.id == processor_id)
        result = await db.execute(stmt)
        procesador = result.scalars().first()

        if not procesador:
            mensaje_error = f"Procesador con ID {processor_id} no encontrado."
            print(f"ERROR: {mensaje_error}")
            db_archivo.estado = EstadoProcesamiento.FALLIDO
            db_archivo.log_procesamiento = mensaje_error
            await db.commit()
            return

        print(f"Delegando al procesador genérico con mapeo '{procesador.nombre}' para el archivo: {db_archivo.nombre_archivo_original}")
        resultado = await process_generic_csv(
            db=db, 
            db_archivo=db_archivo, 
            file_content=file_content,
            mapeo_columnas=procesador.mapeo_columnas,
            tipo_metrica=tipo_metrica,
            nivel_geografico=procesador.nivel_geografico, # Pasar el nivel geográfico
            metric_name=procesador.metric_name # Pasar el nombre de la métrica
        )
        db_archivo.estado = EstadoProcesamiento.COMPLETADO
        
        # 3. Actualizar con el resultado si el procesamiento fue exitoso
        if resultado:
            db_archivo.filas_procesadas = resultado.get("filas_procesadas", 0)
            db_archivo.filas_fallidas = resultado.get("filas_fallidas", 0)
            db_archivo.log_procesamiento = resultado.get("log", "")

    except Exception as e:
        # 4. Manejo de errores: Marcar como FALLIDO
        error_message = f"Ocurrió un error inesperado durante el procesamiento: {e}"
        print(error_message)
        db_archivo.estado = EstadoProcesamiento.FALLIDO
        db_archivo.log_procesamiento = error_message
        # Opcional: agregar más detalles del error si es necesario
        if resultado and resultado.get("log"): # Adjuntar logs si existen
            db_archivo.log_procesamiento += "\n--- Logs previos ---\n" + resultado.get("log")
    finally:
        # 5. Asegurar que los cambios de estado se guarden en la BD
        await db.commit()
        print(f"Procesamiento finalizado para el archivo ID {db_archivo.id} con estado: {db_archivo.estado.value}")

