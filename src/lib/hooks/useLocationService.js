'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { locationService } from '../services/locationService';

export const useLocationService = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('unknown');
  const [progress, setProgress] = useState(null);
  
  const abortControllerRef = useRef(null);

  // Check initial permission state and cached location
  useEffect(() => {
    const initializeLocation = async () => {
      // Check cached location first
      const cached = locationService.getCachedLocation();
      if (cached) {
        setLocation(cached);
      }

      // Check permission state
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setPermission(result.state);
          
          result.addEventListener('change', () => {
            setPermission(result.state);
          });
        } catch (err) {
          console.log('Permission query not supported:', err);
        }
      }
    };

    initializeLocation();
  }, []);

  // Get current location with options
  const getCurrentLocation = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    setProgress(null);

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const progressCallback = options.showProgress ? (progressInfo) => {
        setProgress(progressInfo);
      } : null;

      const locationData = await locationService.getCurrentLocation({
        ...options,
        onProgress: progressCallback,
        signal: abortControllerRef.current.signal
      });

      setLocation(locationData);
      setError(null);
      setProgress(null);
      return locationData;

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Location request was cancelled');
        return null;
      }

      const errorMessage = err.message || 'Failed to get location';
      setError(errorMessage);
      setProgress(null);
      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      return await locationService.reverseGeocode(latitude, longitude);
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return null;
    }
  }, []);

  // Forward geocode address to coordinates
  const geocodeAddress = useCallback(async (address) => {
    try {
      return await locationService.geocodeAddress(address);
    } catch (err) {
      console.error('Address geocoding failed:', err);
      throw err;
    }
  }, []);

  // Watch location changes
  const watchLocation = useCallback((options = {}) => {
    setLoading(true);
    setError(null);

    const onSuccess = (locationData) => {
      setLocation(locationData);
      setError(null);
      setLoading(false);
    };

    const onError = (err) => {
      setError(err.message);
      setLoading(false);
    };

    const watchId = locationService.watchLocation(onSuccess, onError, options);

    return () => {
      locationService.clearWatch(watchId);
      setLoading(false);
    };
  }, []);

  // Clear current location
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    setProgress(null);
    locationService.clearCache();
  }, []);

  // Cancel any ongoing location request
  const cancelLocationRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setProgress(null);
  }, []);

  // Calculate distance between two locations
  const calculateDistance = useCallback((location1, location2) => {
    return locationService.calculateDistance(location1, location2);
  }, []);

  // Check if location is within bounds
  const isLocationWithinBounds = useCallback((location, bounds) => {
    return locationService.isLocationWithinBounds(location, bounds);
  }, []);

  // Get location accuracy status
  const getLocationAccuracy = useCallback(() => {
    if (!location) return null;
    
    if (!location.accuracy) return 'unknown';
    
    if (location.accuracy <= 10) return 'high';
    if (location.accuracy <= 50) return 'medium';
    if (location.accuracy <= 100) return 'low';
    return 'very-low';
  }, [location]);

  // Get location source info
  const getLocationSource = useCallback(() => {
    if (!location) return null;
    
    return {
      source: location.source || 'unknown',
      fromCache: location.fromCache || false,
      timestamp: location.timestamp,
      accuracy: location.accuracy
    };
  }, [location]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    location,
    loading,
    error,
    permission,
    progress,
    
    // Actions
    getCurrentLocation,
    reverseGeocode,
    geocodeAddress,
    watchLocation,
    clearLocation,
    cancelLocationRequest,
    
    // Utilities
    calculateDistance,
    isLocationWithinBounds,
    getLocationAccuracy,
    getLocationSource,
    
    // Status helpers
    hasLocation: !!location,
    isHighAccuracy: getLocationAccuracy() === 'high',
    isFromGPS: location?.source === 'gps',
    isFromCache: location?.fromCache || false
  };
};
