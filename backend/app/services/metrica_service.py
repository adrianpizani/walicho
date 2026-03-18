# services/metrica_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, cast, String
from collections import defaultdict
from typing import List, Optional

from models import Metricas, Hechos_Datos, Dimension_Geografica, TipoMetrica
import schemas # Importar schemas

async def _get_filtered_geografia_ids(db: AsyncSession, filtros: Optional[List[schemas.AnyFiltro]]) -> Optional[set[int]]:
    """
    Aplica una lista de filtros para encontrar el conjunto de IDs de geografía que satisfacen todas las condiciones.
    Devuelve None si no se proporcionan filtros.
    Devuelve un conjunto de geografia_ids que satisfacen los filtros.
    """
    if not filtros:
        return None

    list_of_geo_id_sets = []

    for filtro in filtros:
        query = select(Hechos_Datos.geografia_id).where(Hechos_Datos.metrica_id == filtro.metrica_id)

        if filtro.tipo == "categoria":
            query = query.where(Hechos_Datos.dimension_extra['agrupacion_nombre'].as_string().in_(filtro.valores))
        elif filtro.tipo == "rango":
            query = query.where(Hechos_Datos.valor.between(filtro.rango[0], filtro.rango[1]))
        
        result = await db.execute(query.distinct())
        list_of_geo_id_sets.append(set(result.scalars().all()))

    if not list_of_geo_id_sets:
        return set()

    geos_en_comun = list_of_geo_id_sets[0]
    for i in range(1, len(list_of_geo_id_sets)):
        geos_en_comun.intersection_update(list_of_geo_id_sets[i])
        
    return geos_en_comun

async def get_all_metrics(db: AsyncSession) -> list[schemas.Metrica]:
    """
    Recupera todas las métricas de la base de datos, incluido su archivo de origen relacionado,
    y las convierte explícitamente a esquemas Pydantic.
    """
    query = select(Metricas).options(selectinload(Metricas.archivo))
    result = await db.execute(query)
    db_metrics = result.scalars().unique().all()

    metrics_schemas = []
    for db_metric in db_metrics:
        archivo_schema = schemas.ArchivoForMetrica.from_orm(db_metric.archivo) if db_metric.archivo else None
        metrics_schemas.append(schemas.Metrica(
            id=db_metric.id,
            nombre_amigable=db_metric.nombre_amigable,
            is_active=db_metric.is_active,
            tipo=TipoMetrica(db_metric.tipo),
            archivo=archivo_schema
        ))
    return metrics_schemas

async def toggle_metric_status(db: AsyncSession, metric_id: int) -> schemas.Metrica | None:
    """
    Busca una métrica por su ID y cambia su estado booleano 'is_active'.
    """
    result = await db.execute(
        select(Metricas).options(selectinload(Metricas.archivo)).where(Metricas.id == metric_id)
    )
    metric = result.scalars().first()
    
    if metric:
        metric.is_active = not metric.is_active
        await db.commit()
        await db.refresh(metric)

        return schemas.Metrica.from_orm(metric)
    
    return None

async def get_electoral_metric_data(db: AsyncSession, metric_id: int, filtros: Optional[List[schemas.AnyFiltro]] = None):
    """
    Recupera datos para una métrica electoral, agrupados por geografía y partido, con filtros opcionales.
    """
    filtered_geo_ids = await _get_filtered_geografia_ids(db, filtros)

    if filtered_geo_ids is not None and not filtered_geo_ids:
        return []

    base_query = select(
        Hechos_Datos.geografia_id,
        Hechos_Datos.valor,
        Hechos_Datos.dimension_extra['agrupacion_nombre'].as_string().label("agrupacion_nombre")
    ).where(Hechos_Datos.metrica_id == metric_id)

    if filtered_geo_ids is not None:
        base_query = base_query.where(Hechos_Datos.geografia_id.in_(filtered_geo_ids))

    hechos_con_agrupacion_cte = base_query.cte("hechos_con_agrupacion")

    stmt = (
        select(
            hechos_con_agrupacion_cte.c.geografia_id,
            Dimension_Geografica.nombre.label("geografia_nombre"),
            hechos_con_agrupacion_cte.c.agrupacion_nombre,
            func.sum(hechos_con_agrupacion_cte.c.valor).label("total_votos")
        )
        .join(Dimension_Geografica, hechos_con_agrupacion_cte.c.geografia_id == Dimension_Geografica.id)
        .group_by(
            hechos_con_agrupacion_cte.c.geografia_id,
            Dimension_Geografica.nombre,
            hechos_con_agrupacion_cte.c.agrupacion_nombre
        )
        .order_by(
            hechos_con_agrupacion_cte.c.geografia_id,
            func.sum(hechos_con_agrupacion_cte.c.valor).desc()
        )
    )

    result = await db.execute(stmt)
    rows = result.all()

    data_by_geo = defaultdict(lambda: {"resultados": []})
    for row in rows:
        geo_id = row.geografia_id
        if "nombre" not in data_by_geo[geo_id]:
            data_by_geo[geo_id]["nombre"] = row.geografia_nombre
        
        data_by_geo[geo_id]["resultados"].append({
            "partido": row.agrupacion_nombre,
            "votos": float(row.total_votos)
        })

    final_data = [
        {
            "geografia_id": geo_id, 
            "nombre": geo_data["nombre"], 
            "resultados": geo_data["resultados"],
            "ganador": geo_data["resultados"][0] if geo_data["resultados"] else None
        }
        for geo_id, geo_data in data_by_geo.items()
    ]

    return final_data

async def get_all_generic_data_for_metric(db: AsyncSession, metric_id: int, filtros: Optional[List[schemas.AnyFiltro]] = None) -> list[schemas.GenericData]:
    """
    Recupera todos los valores para una métrica genérica, con filtros opcionales.
    """
    filtered_geo_ids = await _get_filtered_geografia_ids(db, filtros)

    if filtered_geo_ids is not None and not filtered_geo_ids:
        return []

    stmt = (
        select(
            Hechos_Datos.geografia_id,
            Dimension_Geografica.nombre.label("geografia_nombre"),
            Hechos_Datos.metrica_id,
            Metricas.nombre_amigable.label("metrica_nombre"),
            Hechos_Datos.valor
        )
        .join(Dimension_Geografica, Hechos_Datos.geografia_id == Dimension_Geografica.id)
        .join(Metricas, Hechos_Datos.metrica_id == Metricas.id)
        .where(Hechos_Datos.metrica_id == metric_id)
    )

    if filtered_geo_ids is not None:
        stmt = stmt.where(Hechos_Datos.geografia_id.in_(filtered_geo_ids))

    result = await db.execute(stmt)
    rows = result.all()

    return [schemas.GenericData.from_orm(row) for row in rows]
