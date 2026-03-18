import csv
import random

# Function to get unique municipalities from a text file
def get_municipalities_from_file(file_path):
    with open(file_path, mode='r', encoding='utf-8') as infile:
        municipalities = [line.strip() for line in infile if line.strip()]
    return municipalities

# Path to the file containing unique municipalities
municipalities_file = 'unique_municipalities.txt'
unique_municipalities = get_municipalities_from_file(municipalities_file)

# Generate fictitious data for each municipality
data_socioeconomico = []
for municipio in unique_municipalities:
    poblacion = random.randint(50000, 1000000)
    ingreso_promedio = round(random.uniform(50000, 200000), 2)
    tasa_desempleo = round(random.uniform(3.0, 15.0), 2)
    indice_nbi = round(random.uniform(5.0, 30.0), 2)
    tasa_alfabetizacion = round(random.uniform(90.0, 99.5), 2)

    data_socioeconomico.append({
        'municipio': municipio,
        'Poblacion_Total': poblacion,
        'Ingreso_Promedio': ingreso_promedio,
        'Tasa_Desempleo': tasa_desempleo,
        'Indice_NBI': indice_nbi,
        'Tasa_Alfabetizacion': tasa_alfabetizacion
    })

# Save to a new CSV file
output_path = 'indicador_socioeconomico_municipios.csv'
with open(output_path, mode='w', newline='', encoding='utf-8') as outfile:
    fieldnames = ['municipio', 'Poblacion_Total', 'Ingreso_Promedio', 'Tasa_Desempleo', 'Indice_NBI', 'Tasa_Alfabetizacion']
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)

    writer.writeheader()
    writer.writerows(data_socioeconomico)

print("Generated " + output_path + " with socio-economic indicators for " + str(len(unique_municipalities)) + " municipalities.")
