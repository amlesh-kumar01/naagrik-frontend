'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  MapPin, 
  Navigation, 
  Target, 
  Check, 
  X, 
  Loader2,
  Info,
  Search
} from 'lucide-react';
import { useLocationService } from '../../lib/hooks/useLocationService';
import { createGoogleMapsMarker, createUserLocationMarker } from './MapMarkerIcon';

let L = null;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
}

const InteractiveMap = ({
  initialLocation = null,
  onLocationSelect,
  onLocationConfirm,
  height = '400px',
  enableLocationSelection = true,
  showCurrentLocation = true,
  issues = [],
  onIssueClick,
  className = ''
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const selectedMarkerRef = useRef(null);
  const issueMarkersRef = useRef([]);
  
  const { 
    location: userLocation, 
    loading: locationLoading, 
    error: locationError,
    permission,
    progress,
    getCurrentLocation,
    reverseGeocode
  } = useLocationService();
  
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    // Create map with enhanced styling
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([28.6139, 77.2090], 13);
    
    // Add custom zoom control
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);
    
    // Add Google-style tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    // Handle double-click for location selection
    if (enableLocationSelection) {
      map.on('dblclick', async (e) => {
        const location = {
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        };
        
        setSelectedLocation(location);
        setShowConfirmation(true);
        onLocationSelect?.(location);
        
        // Add/update selected location marker
        updateSelectedLocationMarker(location);
        
        // Get address for this location
        setIsLoadingAddress(true);
        try {
          const addressData = await reverseGeocode(location.latitude, location.longitude);
          if (addressData) {
            setSelectedAddress(addressData.formatted_address || 'Unknown address');
          }
        } catch (error) {
          setSelectedAddress('Address not available');
        } finally {
          setIsLoadingAddress(false);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [enableLocationSelection]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !showCurrentLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
    }

    // Add user location marker
    const userMarker = L.marker(
      [userLocation.latitude, userLocation.longitude],
      { icon: createUserLocationMarker() }
    ).addTo(mapInstanceRef.current);

    userMarker.bindPopup(`
      <div style="text-align: center; padding: 12px; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #1a73e8; font-weight: 600;">📍 Your Location</h4>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
          ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}
        </p>
        <p style="margin: 0; font-size: 11px; color: #999;">
          Accuracy: ±${userLocation.accuracy ? Math.round(userLocation.accuracy) : '?'}m • 
          ${userLocation.source === 'gps' ? 'GPS' : 'IP Location'}
          ${userLocation.fromCache ? ' (Cached)' : ''}
        </p>
      </div>
    `);

    userMarkerRef.current = userMarker;

    // Pan to user location if no initial location set
    if (!selectedLocation) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 15);
    }
  }, [userLocation, showCurrentLocation]);

  // Update issue markers
  useEffect(() => {
    if (!mapInstanceRef.current || !issues.length) return;

    // Clear existing issue markers
    issueMarkersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    issueMarkersRef.current = [];

    // Add issue markers
    issues.forEach(issue => {
      if (!issue.location_lat || !issue.location_lng) return;

      const markerType = getIssueMarkerType(issue);
      const marker = L.marker(
        [issue.location_lat, issue.location_lng],
        { icon: createGoogleMapsMarker(markerType) }
      ).addTo(mapInstanceRef.current);

      // Create rich popup content
      const popupContent = createIssuePopup(issue);
      marker.bindPopup(popupContent, { maxWidth: 300 });

      marker.on('click', () => {
        onIssueClick?.(issue);
      });

      issueMarkersRef.current.push(marker);
    });

    // Fit bounds to show all markers if there are issues
    if (issueMarkersRef.current.length > 0) {
      const group = new L.featureGroup([
        ...issueMarkersRef.current,
        ...(userMarkerRef.current ? [userMarkerRef.current] : [])
      ]);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [issues, onIssueClick]);

  // Update selected location marker
  const updateSelectedLocationMarker = useCallback((location) => {
    if (!mapInstanceRef.current) return;

    // Remove existing selected marker
    if (selectedMarkerRef.current) {
      mapInstanceRef.current.removeLayer(selectedMarkerRef.current);
    }

    // Add new selected location marker
    const marker = L.marker(
      [location.latitude, location.longitude],
      { icon: createGoogleMapsMarker('selected-location', { selected: true }) }
    ).addTo(mapInstanceRef.current);

    marker.bindPopup(`
      <div style="text-align: center; padding: 12px; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #9c27b0; font-weight: 600;">📌 Selected Location</h4>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
          ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
        </p>
        <button onclick="window.confirmLocation?.()" style="
          background: #9c27b0;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
        ">
          Confirm This Location
        </button>
      </div>
    `);

    selectedMarkerRef.current = marker;
  }, []);

  // Get marker type based on issue status/priority/category and vote score
  const getIssueMarkerType = (issue) => {
    // High priority issues get special treatment
    if (issue.priority === 'HIGH') return 'priority-high';
    
    // Status-based coloring takes precedence
    if (issue.status === 'RESOLVED') return 'issue-resolved';
    if (issue.status === 'IN_PROGRESS') return 'issue-progress';
    if (issue.status === 'ACKNOWLEDGED') return 'issue-acknowledged';
    if (issue.status === 'ARCHIVED') return 'issue-archived';
    
    // For open issues, consider vote score for importance
    if (issue.status === 'OPEN') {
      const voteScore = issue.vote_score || 0;
      
      // High vote score issues get priority colors
      if (voteScore >= 5) return 'priority-high';
      if (voteScore >= 2) return 'priority-medium';
      
      // Category-based coloring for regular open issues
      const category = (issue.category || '').toLowerCase().replace(/\s+/g, '-');
      
      // Map specific category names to marker types
      switch (category) {
        case 'road-infrastructure':
          return 'category-road-infrastructure';
        case 'water-supply':
          return 'category-water-supply';
        case 'sanitation':
          return 'category-sanitation';
        case 'public-safety':
          return 'category-public-safety';
        case 'healthcare':
          return 'category-healthcare';
        case 'transportation':
          return 'category-transportation';
        case 'environment':
          return 'category-environment';
        case 'housing':
          return 'category-housing';
        case 'test-category':
          return 'category-test-category';
        case 'other':
          return 'category-other';
        default:
          // Fallback to generic category matching
          if (category.includes('infrastructure') || category.includes('road')) {
            return 'category-road-infrastructure';
          }
          if (category.includes('safety') || category.includes('security')) {
            return 'category-public-safety';
          }
          if (category.includes('water')) {
            return 'category-water-supply';
          }
          if (category.includes('transport')) {
            return 'category-transportation';
          }
          if (category.includes('health')) {
            return 'category-healthcare';
          }
          if (category.includes('environment')) {
            return 'category-environment';
          }
          
          // Priority-based fallback
          if (issue.priority === 'MEDIUM') return 'priority-medium';
          if (issue.priority === 'LOW') return 'priority-low';
          
          return 'category-other';
      }
    }
    
    return 'issue-open';
  };

  // Create issue popup content
  const createIssuePopup = (issue) => {
    const statusColors = {
      'OPEN': '#ff4444',
      'IN_PROGRESS': '#ff9800',
      'RESOLVED': '#00c851',
      'ACKNOWLEDGED': '#2196f3',
      'ARCHIVED': '#757575'
    };

    const voteScore = issue.vote_score || 0;
    const voteScoreColor = voteScore > 0 ? '#00c851' : voteScore < 0 ? '#ff4444' : '#666';

    return `
      <div style="min-width: 280px; max-width: 300px;">
        <div style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <h4 style="margin: 0; color: #333; font-size: 16px; font-weight: 600; line-height: 1.3;">
              ${issue.title}
            </h4>
            <div style="display: flex; gap: 4px; margin-left: 8px;">
              <span style="
                background: ${statusColors[issue.status] || '#666'};
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 500;
                white-space: nowrap;
              ">
                ${issue.status}
              </span>
              ${voteScore !== 0 ? `
                <span style="
                  background: ${voteScoreColor};
                  color: white;
                  padding: 2px 6px;
                  border-radius: 10px;
                  font-size: 10px;
                  font-weight: 600;
                  white-space: nowrap;
                ">
                  ${voteScore > 0 ? '+' : ''}${voteScore}
                </span>
              ` : ''}
            </div>
          </div>
          
          <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.4;">
            ${issue.description.length > 100 ? issue.description.substring(0, 100) + '...' : issue.description}
          </p>
          
          ${issue.address ? `
            <div style="margin-bottom: 12px; font-size: 12px; color: #888; display: flex; align-items: center;">
              <span style="margin-right: 4px;">📍</span>
              ${issue.address}
            </div>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; gap: 8px;">
              <span style="
                background: ${issue.priority === 'HIGH' ? '#fee2e2' : issue.priority === 'MEDIUM' ? '#fef3c7' : '#dcfce7'};
                color: ${issue.priority === 'HIGH' ? '#991b1b' : issue.priority === 'MEDIUM' ? '#92400e' : '#166534'};
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 500;
              ">
                ${issue.priority}
              </span>
              <span style="font-size: 11px; color: #999;">
                ${issue.category}
              </span>
            </div>
            <span style="font-size: 11px; color: #999;">
              ${new Date(issue.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <button onclick="window.viewIssueDetail?.('${issue.id}')" style="
            background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            width: 100%;
            font-weight: 500;
            transition: all 0.2s ease;
          " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(66, 133, 244, 0.4)'" 
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            View Full Details
          </button>
        </div>
      </div>
    `;
  };

  // Handle location confirmation
  const handleLocationConfirm = () => {
    if (selectedLocation) {
      onLocationConfirm?.(selectedLocation, selectedAddress);
      setShowConfirmation(false);
    }
  };

  // Handle location cancellation
  const handleLocationCancel = () => {
    setSelectedLocation(null);
    setSelectedAddress('');
    setShowConfirmation(false);
    
    if (selectedMarkerRef.current) {
      mapInstanceRef.current.removeLayer(selectedMarkerRef.current);
      selectedMarkerRef.current = null;
    }
  };

  // Get current location
  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation({ 
        showProgress: true,
        enableHighAccuracy: true 
      });
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([location.latitude, location.longitude], 16);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  // Setup global functions for popup interactions
  useEffect(() => {
    window.confirmLocation = handleLocationConfirm;
    window.viewIssueDetail = (issueId) => {
      const issue = issues.find(i => i.id === issueId);
      if (issue) {
        onIssueClick?.(issue);
      }
    };
    
    return () => {
      delete window.confirmLocation;
      delete window.viewIssueDetail;
    };
  }, [selectedLocation, selectedAddress, issues, onIssueClick]);

  // Show location error as alert
  if (locationError && !userLocation) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {locationError}
          </AlertDescription>
        </Alert>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Map unavailable</p>
            <Button onClick={handleGetCurrentLocation} variant="outline">
              <Navigation className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Controls */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-700">
            {enableLocationSelection ? 'Double-click to pin location' : 'Location Map'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {showCurrentLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetCurrentLocation}
              disabled={locationLoading}
              className="h-8"
            >
              {locationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              <span className="ml-1 hidden sm:inline">
                {locationLoading ? 'Getting...' : 'My Location'}
              </span>
            </Button>
          )}
          
          {selectedLocation && (
            <Badge variant="secondary" className="bg-purple-50 text-purple-700">
              <Target className="h-3 w-3 mr-1" />
              Location Pinned
            </Badge>
          )}
        </div>
      </div>

      {/* Location loading progress */}
      {progress && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{progress.message}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <div 
        className="relative rounded-xl overflow-hidden shadow-lg border"
        style={{ height }}
      >
        <div 
          ref={mapRef} 
          style={{ width: '100%', height: '100%' }}
          className="leaflet-container"
        />
        
        {/* Map Instructions Overlay */}
        {enableLocationSelection && !selectedLocation && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-md border max-w-64">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-gray-700 mb-1">Select Location</p>
                <p className="text-gray-600 text-xs">
                  Double-click anywhere on the map to pin your location
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Confirmation */}
      {showConfirmation && selectedLocation && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Confirm Selected Location
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">Coordinates:</span>
                    <span className="text-gray-600 font-mono">
                      {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-gray-700">Address:</span>
                    <span className="text-gray-600 flex-1">
                      {isLoadingAddress ? (
                        <span className="flex items-center">
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Loading address...
                        </span>
                      ) : (
                        selectedAddress || 'Address not available'
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLocationCancel}
                  className="h-8"
                >
                  <X className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleLocationConfirm}
                  className="h-8 bg-purple-600 hover:bg-purple-700"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Confirm
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permission Request */}
      {permission === 'denied' && showCurrentLocation && (
        <Alert>
          <Navigation className="h-4 w-4" />
          <AlertDescription>
            Location access is disabled. Please enable location services in your browser settings
            to automatically detect your position, or manually select your location on the map.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default InteractiveMap;
