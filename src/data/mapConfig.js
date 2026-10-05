// OSM supplies only the geographic basemap. Operational overlays live in data/mock/.
export const mapConfig = {
  center: [-7.1645, -78.5105],
  zoom: 14,
  minZoom: 11,
  maxZoom: 19,
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
};
export const routeAppearance = {
  current: { id: 'current', name: 'Ruta original', color: '#334155', dashArray: undefined },
  proposed: { id: 'proposed', name: 'Ruta SITRAC', color: '#2563eb', dashArray: undefined },
};
