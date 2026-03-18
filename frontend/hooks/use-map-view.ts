// hooks/use-map-view.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';
import { getMunicipiosGeoJSON, getCircuitosGeoJSON } from '@/lib/api';
import { DistritoFeature, DistritoProperties, ElectoralData } from '@/lib/types'; // Importar tipos comunes

// --- Paleta de Colores y Estilos ---
const partyColorPalette: { [key: string]: string } = {
  'JUNTOS POR EL CAMBIO': '#FFD700',
  'FRENTE DE TODOS': '#1E90FF',
  'CONSENSO FEDERAL': '#FFA500',
  'FRENTE DE IZQUIERDA Y DE TRABAJADORES - UNIDAD': '#FF0000',
  'UNIDAD CIUDADANA': '#87CEEB',
  'CAMBIEMOS BUENOS AIRES': '#FFC0CB',
  '1PAIS': '#9370DB',
  'FRENTE JUSTICIALISTA': '#00008B',
  'FRENTE DE IZQUIERDA Y DE LOS TRABAJadores': '#DC143C',
  'JUNTOS': '#FFD700',
  'default': '#D1D5DB'
};

const getPartyColor = (partyName: string | null | undefined): string => {
  if (!partyName) return partyColorPalette.default;
  return partyColorPalette[partyName] || partyColorPalette.default;
};

// --- Hook Principal ---
export const useMapView = (
  selectedMetric: number | null,
  electoralData: ElectoralData[] | null,
  onMunicipioClick: (municipio: DistritoFeature) => void,
  selectedMunicipio: DistritoFeature | null,
  isCircuitosOverlayActive: boolean
) => {
  const [municipiosGeoJSON, setMunicipiosGeoJSON] = useState<FeatureCollection | null>(null);
  const [circuitosGeoJSON, setCircuitosGeoJSON] = useState<FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  const onMunicipioClickRef = useRef(onMunicipioClick);
  useEffect(() => {
    onMunicipioClickRef.current = onMunicipioClick;
  }, [onMunicipioClick]);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setIsLoading(true);
        const [municipiosData, circuitosData] = await Promise.all([
          getMunicipiosGeoJSON(),
          getCircuitosGeoJSON()
        ]);
        setMunicipiosGeoJSON(municipiosData);
        setCircuitosGeoJSON(circuitosData);
      } catch (error) {
        console.error("Error cargando datos geoespaciales:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMapData();
  }, []);

  const getStyleMunicipio = useCallback((feature?: DistritoFeature): PathOptions => {
    const baseStyle: PathOptions = { 
      weight: 2,
      opacity: 1, 
      color: 'black', 
      fillOpacity: 0.65 
    };
    let fillColor = partyColorPalette.default;
    if (feature && electoralData) {
      const districtData = electoralData.find(d => d.geografia_id === feature.id);
      if (districtData && districtData.ganador) {
        fillColor = getPartyColor(districtData.ganador.partido);
      } 
    }
    baseStyle.fillColor = fillColor;
    if (feature && feature.id === hoveredId) {
      return { ...baseStyle, weight: 4, color: '#333', fillOpacity: 0.8 };
    }
    return baseStyle;
  }, [hoveredId, electoralData]);

  const styleCircuito = useCallback((feature?: DistritoFeature): PathOptions => {
    const circuitParentName = feature?.properties?.departamen;

    if (isCircuitosOverlayActive && selectedMunicipio && circuitParentName === selectedMunicipio.properties.nam) {
      return {
        weight: 1,
        opacity: 0.9,
        color: '#e60000',
        fillOpacity: 0.1,
      };
    }
    
    return {
      weight: 0,
      opacity: 0,
      fillOpacity: 0,
    };
  }, [selectedMunicipio, isCircuitosOverlayActive]);

  const onEachFeatureMunicipio = useCallback((feature: DistritoFeature, layer: Layer) => {
    layer.bindTooltip(feature.properties.nombre, { sticky: true, className: 'custom-tooltip' });
    layer.on({
      mouseover: () => setHoveredId(feature.id),
      mouseout: () => setHoveredId(null),
      click: () => {
        onMunicipioClickRef.current(feature);
        if (electoralData) {
          const districtData = electoralData.find(d => d.geografia_id === feature.id);
          if (districtData) {
            const resultsHtml = districtData.resultados
              .map(r => `<li><strong>${r.partido}:</strong> ${r.votos.toLocaleString('es-AR')} votos</li>`)
              .join('');
            const popupContent = `<div class="font-sans"><h3 class="font-bold text-lg mb-2">${districtData.nombre}</h3><ul class="list-disc pl-5">${resultsHtml}</ul></div>`;
            layer.bindPopup(popupContent).openPopup();
          }
        }
      },
    });
  }, [electoralData]);

  // --- NUEVA LOGICA PARA CIRCUITOS ---
  const onEachFeatureCircuito = useCallback((feature: DistritoFeature, layer: Layer) => {
    const circuitParentName = feature.properties.departamen;
    
    if (isCircuitosOverlayActive && selectedMunicipio && circuitParentName === selectedMunicipio.properties.nam) {
      if (layer.options) layer.options.interactive = true;
      layer.bindTooltip(feature.properties.nombre, {
        sticky: true,
        className: 'custom-tooltip-circuito'
      });
    } else {
      if (layer.options) layer.options.interactive = false;
    }
  }, [selectedMunicipio, isCircuitosOverlayActive]); // Se re-ejecuta si cambia el municipio seleccionado

  return {
    municipiosGeoJSON,
    circuitosGeoJSON,
    isLoading: isLoading || !municipiosGeoJSON,
    getStyleMunicipio,
    styleCircuito,
    onEachFeatureMunicipio,
    onEachFeatureCircuito,
  };
};