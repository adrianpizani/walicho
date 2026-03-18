from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models import Archivo
from schemas import ArchivoCreate

async def get_archivos(db: AsyncSession):
    """
    Retrieves all Archivo records.
    """
    query = select(Archivo)
    result = await db.execute(query)
    return result.scalars().all()

async def create_archivo(db: AsyncSession, nombre_visible: str, nombre_archivo_original: str, descripcion: str | None) -> Archivo:
    """
    Creates a new Archivo record.
    """
    db_archivo = Archivo(
        nombre_visible=nombre_visible,
        nombre_archivo_original=nombre_archivo_original,
        descripcion=descripcion
    )
    db.add(db_archivo)
    await db.commit()
    await db.refresh(db_archivo)
    return db_archivo

async def delete_archivo(db: AsyncSession, archivo_id: int) -> Archivo | None:
    """
    Deletes an Archivo record and its associated data.
    """
    result = await db.execute(select(Archivo).where(Archivo.id == archivo_id))
    db_archivo = result.scalars().first()
    if db_archivo:
        await db.delete(db_archivo)
        await db.commit()
    return db_archivo
