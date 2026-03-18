import json
from shapely.geometry import shape
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

# Usar importaciones relativas
from ..database import engine, AsyncSessionLocal, Base
from ..models import Dimension_Geografica

async def import_geojson_data():
    geojson_path = "/app/static/partidos.geojson"
    
    print(f"Iniciando importación de GeoJSON desde: {geojson_path}")

    try:
        with open(geojson_path, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Archivo GeoJSON no encontrado en {geojson_path}")
        return
    except json.JSONDecodeError:
        print(f"Error: No se pudo decodificar el archivo GeoJSON en {geojson_path}")
        return

    async with engine.begin() as conn:
        # Asegúrate de que las tablas existan
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for feature in geojson_data['features']:
            properties = feature['properties']
            geometry = feature['geometry']

            nombre = properties.get('nam') or properties.get('fna')
            nivel = properties.get('gna') # Debería ser "Partido"
            
            if not nombre or not nivel:
                print(f"Skipping feature due to missing 'nombre' or 'nivel': {properties}")
                continue

            # Convertir geometría GeoJSON a objeto Shapely
            shapely_geometry = shape(geometry)

            # Verificar si ya existe una entrada con el mismo nombre
            existing_geo = await session.execute(
                select(Dimension_Geografica).filter_by(nombre=nombre)
            )
            if existing_geo.scalar_one_or_none():
                print(f"Ya existe '{nombre}', omitiendo.")
                continue

            db_geografia = Dimension_Geografica(
                nombre=nombre,
                nivel=nivel,
                geometria=shapely_geometry.wkt # Guardar como Well-Known Text
            )
            session.add(db_geografia)
            print(f"Añadido: {nombre} ({nivel})")
        
        await session.commit()
        print("Importación de GeoJSON completada.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(import_geojson_data())
