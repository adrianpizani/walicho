FROM python:3.11-slim

# 1. Instalar dependencias del sistema (incluyendo libgeos para GeoAlchemy2)
RUN apt-get update && apt-get install -y libgeos-dev && rm -rf /var/lib/apt/lists/*

# 2. Establecer directorio de trabajo
WORKDIR /app

# 3. Copiar e instalar requerimientos de Python
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# 4. Copiar el código de la aplicación
COPY ./app /app

# 5. (CLAVE) Asegurar que Python encuentre los módulos en /app
ENV PYTHONPATH "${PYTHONPATH}:/app"

# 6. Exponer puerto y ejecutar la aplicación
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
