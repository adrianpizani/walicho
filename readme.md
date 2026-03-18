docker exec -it pba_backend bash -c "PYTHONPATH=/ python -m app.scripts.import_geojson"

docker exec -it pba_backend bash -c "PYTHONPATH=/ python -m app.scripts.import_circuitos"