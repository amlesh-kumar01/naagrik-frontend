import L from 'leaflet';

const markerHtmlStyles = `
  background-color: #3B38A0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1.25rem;
  box-shadow: 0 2px 8px rgba(59,56,160,0.2);
  color: #fff;
  font-size: 1.25rem;
`;

export const customMarkerIcon = (label = '') => L.divIcon({
  className: '',
  html: `<div style="${markerHtmlStyles}">${label || '📍'}</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
