'use client';

/**
 * Enhanced Location Service for getting user location
 * Provides multiple methods with proper fallbacks and error handling
 */
class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
    this.lastLocationUpdate = null;
    this.locationCache = new Map();
  }

  /**
   * Get user's current location with multiple fallback strategies
   */
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000, // 5 minutes cache
      fallbackToIP: true,
      showProgress: false
    };
    
    const config = { ...defaultOptions, ...options };

    try {
      // Try HTML5 Geolocation first
      const position = await this.getGPSLocation(config);
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now(),
        source: 'gps',
        reliable: position.coords.accuracy < 100
      };
      
      this.currentLocation = location;
      this.cacheLocation(location);
      return location;
      
    } catch (gpsError) {
      console.warn('GPS location failed:', gpsError.message);
      
      // Fallback to IP location if enabled
      if (config.fallbackToIP) {
        try {
          const ipLocation = await this.getIPLocation();
          this.currentLocation = ipLocation;
          return ipLocation;
        } catch (ipError) {
          console.error('IP location also failed:', ipError.message);
        }
      }
      
      // Final fallback - check cache
      const cachedLocation = this.getCachedLocation();
      if (cachedLocation) {
        console.info('Using cached location');
        return cachedLocation;
      }
      
      throw new Error('Unable to determine location. Please enable location services or select manually.');
    }
  }

  /**
   * Get location using HTML5 Geolocation API
   */
  getGPSLocation(options) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Location request timed out'));
      }, options.timeout);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve(position);
        },
        (error) => {
          clearTimeout(timeoutId);
          const errorMessages = {
            1: 'Location access denied by user',
            2: 'Location unavailable - please check your connection',
            3: 'Location request timed out'
          };
          reject(new Error(errorMessages[error.code] || 'Unknown location error'));
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge
        }
      );
    });
  }

  /**
   * Get approximate location from IP address
   */
  async getIPLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error('IP location service unavailable');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'IP location failed');
      }
      
      if (!data.latitude || !data.longitude) {
        throw new Error('Invalid location data from IP service');
      }
      
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        accuracy: 10000, // IP location is city-level accurate
        timestamp: Date.now(),
        source: 'ip',
        reliable: false,
        city: data.city,
        region: data.region,
        country: data.country_name,
        timezone: data.timezone
      };
    } catch (error) {
      throw new Error(`IP location failed: ${error.message}`);
    }
  }

  /**
   * Watch user location for real-time updates
   */
  startLocationWatch(callback, errorCallback, options = {}) {
    if (!navigator.geolocation) {
      errorCallback?.(new Error('Geolocation not supported'));
      return null;
    }

    const watchOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute for watch
      ...options
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
          source: 'gps_watch'
        };
        
        this.currentLocation = location;
        this.lastLocationUpdate = Date.now();
        callback(location);
      },
      (error) => {
        console.error('Location watch error:', error);
        errorCallback?.(error);
      },
      watchOptions
    );

    return this.watchId;
  }

  /**
   * Stop watching location
   */
  stopLocationWatch() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Check if location permission is granted
   */
  async checkLocationPermission() {
    if (!navigator.permissions) {
      return 'unknown';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Permission check failed:', error);
      return 'unknown';
    }
  }

  /**
   * Request location permission explicitly
   */
  async requestLocationPermission() {
    try {
      const location = await this.getCurrentLocation({ 
        timeout: 10000,
        fallbackToIP: false 
      });
      return { granted: true, location };
    } catch (error) {
      return { granted: false, error: error.message };
    }
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address, options = {}) {
    const cacheKey = `geocode_${address.toLowerCase()}`;
    
    // Check cache first
    if (this.locationCache.has(cacheKey)) {
      const cached = this.locationCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached.data;
      }
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const baseUrl = options.provider === 'google' && options.apiKey ? 
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${options.apiKey}` :
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
      
      const response = await fetch(baseUrl);
      const data = await response.json();
      
      let result;
      if (options.provider === 'google' && data.results?.length > 0) {
        const location = data.results[0].geometry.location;
        result = {
          latitude: location.lat,
          longitude: location.lng,
          formatted_address: data.results[0].formatted_address,
          source: 'geocode_google'
        };
      } else if (data?.length > 0) {
        result = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          formatted_address: data[0].display_name,
          source: 'geocode_osm'
        };
      } else {
        throw new Error('Address not found');
      }
      
      // Cache the result
      this.locationCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(latitude, longitude, options = {}) {
    const cacheKey = `reverse_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
    
    // Check cache
    if (this.locationCache.has(cacheKey)) {
      const cached = this.locationCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 1800000) { // 30 minutes cache
        return cached.data;
      }
    }

    try {
      const baseUrl = options.provider === 'google' && options.apiKey ?
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${options.apiKey}` :
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      
      const response = await fetch(baseUrl);
      const data = await response.json();
      
      let result;
      if (options.provider === 'google' && data.results?.length > 0) {
        const result_data = data.results[0];
        result = {
          formatted_address: result_data.formatted_address,
          components: result_data.address_components,
          source: 'reverse_google'
        };
      } else if (data?.address) {
        result = {
          formatted_address: data.display_name,
          street: data.address.road || '',
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || '',
          country: data.address.country || '',
          postal_code: data.address.postcode || '',
          source: 'reverse_osm'
        };
      } else {
        throw new Error('No address found for coordinates');
      }
      
      // Cache result
      this.locationCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      throw new Error(`Reverse geocoding failed: ${error.message}`);
    }
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Cache location data
   */
  cacheLocation(location) {
    try {
      const cacheData = {
        ...location,
        cached_at: Date.now()
      };
      localStorage.setItem('user_location_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache location:', error);
    }
  }

  /**
   * Get cached location if still valid
   */
  getCachedLocation() {
    try {
      const cached = localStorage.getItem('user_location_cache');
      if (cached) {
        const data = JSON.parse(cached);
        
        // Check if cache is still valid (1 hour for GPS, 24 hours for IP)
        const maxAge = data.source === 'gps' ? 3600000 : 86400000;
        if (Date.now() - data.cached_at < maxAge) {
          return {
            ...data,
            fromCache: true
          };
        }
      }
    } catch (error) {
      console.error('Failed to get cached location:', error);
    }
    return null;
  }

  /**
   * Clear location cache
   */
  clearCache() {
    try {
      localStorage.removeItem('user_location_cache');
      this.locationCache.clear();
    } catch (error) {
      console.error('Failed to clear location cache:', error);
    }
  }

  /**
   * Get location with progress callback
   */
  async getCurrentLocationWithProgress(progressCallback) {
    const steps = [
      'Checking permissions...',
      'Accessing GPS...',
      'Getting precise location...',
      'Validating coordinates...'
    ];
    
    let currentStep = 0;
    const updateProgress = (step) => {
      progressCallback?.({
        step: currentStep + 1,
        total: steps.length,
        message: steps[currentStep] || 'Processing...',
        percentage: ((currentStep + 1) / steps.length) * 100
      });
      currentStep++;
    };

    try {
      updateProgress();
      
      // Check permission first
      const permission = await this.checkLocationPermission();
      if (permission === 'denied') {
        throw new Error('Location access denied. Please enable location services.');
      }
      
      updateProgress();
      
      // Get location
      const location = await this.getCurrentLocation();
      
      updateProgress();
      updateProgress(); // Complete
      
      return location;
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const locationService = new LocationService();

/**
 * React hook for location functionality
 */
export const useLocationService = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt');
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    // Check cached location on mount
    const cached = locationService.getCachedLocation();
    if (cached) {
      setLocation(cached);
    }

    // Check permission status
    locationService.checkLocationPermission().then(setPermission);
  }, []);

  const getCurrentLocation = async (options = {}) => {
    setLoading(true);
    setError(null);
    setProgress(null);
    
    try {
      let result;
      
      if (options.showProgress) {
        result = await locationService.getCurrentLocationWithProgress(setProgress);
      } else {
        result = await locationService.getCurrentLocation(options);
      }
      
      setLocation(result);
      setPermission('granted');
      return result;
    } catch (err) {
      setError(err.message);
      if (err.message.includes('denied')) {
        setPermission('denied');
      }
      throw err;
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const geocodeAddress = async (address) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await locationService.geocodeAddress(address);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const result = await locationService.reverseGeocode(lat, lng);
      return result;
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return null;
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
    locationService.clearCache();
  };

  return {
    location,
    loading,
    error,
    permission,
    progress,
    getCurrentLocation,
    geocodeAddress,
    reverseGeocode,
    clearLocation
  };
};

export default locationService;
