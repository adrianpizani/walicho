# /backend/app/scripts/debug_circuitos.py
import asyncio
from sqlalchemy import select
from database import AsyncSessionLocal
from models import Dimension_Geografica

async def inspect_data():
    print("--- Iniciando inspección de datos de circuitos ---")
    async with AsyncSessionLocal() as session:
        # Seleccionar las primeras 10 filas de la tabla dimension_geografica donde el nivel sea 'Circuito'
        stmt = select(Dimension_Geografica).where(Dimension_Geografica.nivel == "Circuito").limit(10)
        result = await session.execute(stmt)
        circuitos = result.scalars().all()

        if not circuitos:
            print("¡No se encontraron circuitos en la base de datos!")
        else:
            print(f"Se encontraron {len(circuitos)} circuitos. Mostrando los nombres:")
            for i, circuito in enumerate(circuitos):
                # Imprimir el tipo de dato y el valor del nombre
                print(f"  {i+1}: Nombre: '{circuito.nombre}' (Tipo: {type(circuito.nombre)})")
    print("--- Inspección finalizada ---")

if __name__ == "__main__":
    asyncio.run(inspect_data())
