'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '../ui/button';

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

// Import Leaflet CSS and custom marker icon dynamically
let L = null;
let customMarkerIcon = null;

if (typeof window !== 'undefined') {
  import('leaflet/dist/leaflet.css');
  L = require('leaflet');
  
  // Import custom marker icon
  const { customMarkerIcon: markerIcon } = require('./MapMarkerIcon');
  customMarkerIcon = markerIcon;
}

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 }; // Delhi as fallback

function LocationMarker({ setLocation, currentLocation, selectableLocation, useMapEvents }) {
  if (!useMapEvents) return null;
  
  const MapEvents = useMapEvents;
  MapEvents({
    click(e) {
      if (selectableLocation) {
        setLocation(e.latlng);
      }
    },
  });

  return currentLocation && customMarkerIcon ? (
    <Marker position={currentLocation} icon={customMarkerIcon('📍')}>
      <Popup>
        <div className="text-center">
          <h4 className="font-semibold text-[#3B38A0] mb-1">Your Location</h4>
          <p className="text-xs text-gray-600">
            {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

const ModernMapView = ({
  issues = [],
  onLocationSelect,
  onIssueClick,
  height = '500px',
  showCurrentLocation = true,
  interactive = true,
  selectableLocation = false,
}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef();

  const getIssueMarkerIcon = (issue) => {
    if (!customMarkerIcon) return null;
    
    let emoji = '📍';
    let color = '#3B38A0';
    
    if (issue.priority === 'HIGH') {
      emoji = '🔴';
      color = '#dc2626';
    } else if (issue.priority === 'MEDIUM') {
      emoji = '🟡';
      color = '#ea580c';
    } else if (issue.status === 'RESOLVED') {
      emoji = '✅';
      color = '#16a34a';
    }

    return customMarkerIcon(emoji);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && showCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, [isClient, showCurrentLocation]);

  // Don't render on server side
  if (!isClient) {
    return (
      <div className="w-full rounded-lg overflow-hidden border shadow-lg flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B38A0] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border shadow-lg" style={{ height }}>
      <MapContainer
        center={currentLocation || DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showCurrentLocation && (
          <LocationMarker 
            setLocation={(latlng) => {
              if (selectableLocation) {
                setSelectedLocation(latlng);
                onLocationSelect?.(latlng);
              }
            }} 
            currentLocation={selectableLocation ? selectedLocation : currentLocation} 
            selectableLocation={selectableLocation}
            useMapEvents={useMapEvents}
          />
        )}
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={{ lat: issue.latitude, lng: issue.longitude }}
            icon={getIssueMarkerIcon(issue)}
            eventHandlers={{
              click: () => {
                setSelectedIssue(issue);
                onIssueClick?.(issue);
              },
            }}
          >
            <Popup maxWidth={300}>
              <div className="min-w-[250px] p-2">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-[#3B38A0] mb-1 line-clamp-2">{issue.title}</h4>
                  <div className="flex flex-col items-end ml-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium mb-1 ${
                      issue.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {issue.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      issue.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{issue.description}</p>
                
                {issue.address && (
                  <div className="text-xs text-gray-500 mb-2 flex items-center">
                    <span className="mr-1">📍</span>
                    {issue.address}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mb-3">
                  <div>Category: {issue.category}</div>
                  <div>Reported: {new Date(issue.created_at).toLocaleDateString()}</div>
                  {issue.votes_count > 0 && <div>Votes: {issue.votes_count}</div>}
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-[#B2B0E8] to-[#7A85C1] border-0 hover:from-[#7A85C1] hover:to-[#3B38A0]"
                  onClick={() => onIssueClick?.(issue)}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ModernMapView;
