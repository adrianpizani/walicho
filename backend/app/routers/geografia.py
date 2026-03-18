from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import Geografia, GeografiaCreate, GeoDataRequest
from database import get_db
from services import geografia_service

router = APIRouter(tags=["Geografía"])

@router.post("/geografia", response_model=Geografia)
async def create_geografia(geografia: GeografiaCreate, db: AsyncSession = Depends(get_db)):
    """
    Crea una nueva entrada en la Dimension Geografica.
    """
    return await geografia_service.create_new_geografia(geografia=geografia, db=db)

@router.get("/geografia", response_model=list[Geografia])
async def read_geografias(db: AsyncSession = Depends(get_db)):
    """
    Lee todas las entradas de la Dimension Geografica.
    """
    return await geografia_service.get_all_geografias(db=db)

@router.get("/geografia/municipios/geojson", response_model=dict)
async def get_municipios_geojson(db: AsyncSession = Depends(get_db)):
    """
    Retorna todos los Partidos como un GeoJSON FeatureCollection.
    """
    return await geografia_service.get_municipios_geojson(db=db)

@router.get("/geografia/circuitos/geojson", response_model=dict)
async def get_circuitos_geojson(db: AsyncSession = Depends(get_db)):
    """
    Retorna todos los Circuitos como un GeoJSON FeatureCollection.
    """
    return await geografia_service.get_circuitos_geojson(db=db)

@router.post("/geografia/data", response_model=dict)
async def get_geografia_data(
    request: GeoDataRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna un GeoJSON FeatureCollection con datos geográficos combinados
    con métricas agregadas de archivos específicos.
    """
    return await geografia_service.get_geografias_with_data(db=db, request=request)