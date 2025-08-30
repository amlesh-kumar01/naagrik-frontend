let L = null;

// Only import Leaflet on client side
if (typeof window !== 'undefined') {
  L = require('leaflet');
}

// Enhanced Google Maps style markers with animations and better design
const createMarkerCSS = () => {
  const css = `
    @keyframes markerDrop {
      0% {
        transform: translateY(-100px) scale(0.5);
        opacity: 0;
      }
      50% {
        transform: translateY(10px) scale(1.1);
      }
      100% {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
    
    @keyframes markerBounce {
      0%, 20%, 60%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-20px);
      }
      80% {
        transform: translateY(-10px);
      }
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7);
      }
      70% {
        box-shadow: 0 0 0 20px rgba(66, 133, 244, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
      }
    }
    
    @keyframes urgentPulse {
      0% {
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.5), 0 0 0 0 rgba(244, 67, 54, 0.7);
        transform: scale(1);
      }
      50% {
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.5), 0 0 0 15px rgba(244, 67, 54, 0);
        transform: scale(1.05);
      }
      100% {
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.5), 0 0 0 0 rgba(244, 67, 54, 0);
        transform: scale(1);
      }
    }
    
    .google-marker {
      position: relative;
      width: 32px;
      height: 40px;
      cursor: pointer;
      transition: all 0.3s ease;
      animation: markerDrop 0.6s ease-out;
    }
    
    .google-marker:hover {
      transform: scale(1.1);
      z-index: 1000;
    }
    
    .google-marker.selected {
      transform: scale(1.2);
      z-index: 1001;
      animation: markerBounce 0.6s ease-in-out;
    }
    
    .google-marker.pulse {
      animation: pulse 2s infinite;
    }
    
    .marker-pin {
      position: absolute;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
      border: 2px solid white;
      top: 0;
      left: 0;
    }
    
    .marker-pin.issue-open {
      background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
      box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-pin.issue-resolved {
      background: linear-gradient(135deg, #00c851 0%, #007e33 100%);
      box-shadow: 0 4px 12px rgba(0, 200, 81, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-pin.issue-progress {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-pin.issue-acknowledged {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-pin.issue-archived {
      background: linear-gradient(135deg, #757575 0%, #424242 100%);
      box-shadow: 0 4px 12px rgba(117, 117, 117, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    /* Priority-based colors */
    .marker-pin.priority-high {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.5), 0 2px 6px rgba(0, 0, 0, 0.15);
      animation: urgentPulse 1.5s infinite;
    }
    
    .marker-pin.priority-medium {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-pin.priority-low {
      background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    /* Category-based colors */
    .marker-pin.category-infrastructure {
      background: linear-gradient(135deg, #607d8b 0%, #455a64 100%);
      box-shadow: 0 4px 12px rgba(96, 125, 139, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-pin.category-safety {
      background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
      box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-pin.category-environment {
      background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
      box-shadow: 0 4px 12px rgba(139, 195, 74, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-pin.category-utilities {
      background: linear-gradient(135deg, #03a9f4 0%, #0288d1 100%);
      box-shadow: 0 4px 12px rgba(3, 169, 244, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-pin.category-transport {
      background: linear-gradient(135deg, #673ab7 0%, #512da8 100%);
      box-shadow: 0 4px 12px rgba(103, 58, 183, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-pin.user-location {
      background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
      box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
      animation: pulse 2s infinite;
    }
    
    .marker-pin.selected-location {
      background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
      box-shadow: 0 4px 12px rgba(156, 39, 176, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .marker-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 18px;
      height: 18px;
      background: white;
      border-radius: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .marker-icon {
      transform: rotate(-45deg);
      font-size: 12px;
      font-weight: bold;
    }
    
    .cluster-marker {
      background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
      border: 3px solid white;
      border-radius: 50%;
      color: white;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      animation: markerDrop 0.6s ease-out;
    }
    
    .cluster-marker:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(66, 133, 244, 0.5), 0 3px 8px rgba(0, 0, 0, 0.15);
    }
  `;
  
  // Add CSS to document if not already added
  if (typeof window !== 'undefined' && !document.getElementById('map-marker-styles')) {
    const style = document.createElement('style');
    style.id = 'map-marker-styles';
    style.innerHTML = css;
    document.head.appendChild(style);
  }
};

// Marker types configuration
const markerTypes = {
  'user-location': {
    className: 'user-location',
    icon: '📍',
    color: '#4285f4'
  },
  'selected-location': {
    className: 'selected-location',
    icon: '📌',
    color: '#9c27b0'
  },
  'issue-open': {
    className: 'issue-open',
    icon: '⚠️',
    color: '#ff4444'
  },
  'issue-resolved': {
    className: 'issue-resolved',
    icon: '✅',
    color: '#00c851'
  },
  'issue-progress': {
    className: 'issue-progress',
    icon: '🔄',
    color: '#ff9800'
  },
  'issue-acknowledged': {
    className: 'issue-acknowledged',
    icon: '👁️',
    color: '#2196f3'
  },
  'issue-archived': {
    className: 'issue-archived',
    icon: '📦',
    color: '#757575'
  },
  'priority-high': {
    className: 'priority-high',
    icon: '🚨',
    color: '#f44336'
  },
  'priority-medium': {
    className: 'priority-medium',
    icon: '📋',
    color: '#ff9800'
  },
  'priority-low': {
    className: 'priority-low',
    icon: '📝',
    color: '#4caf50'
  },
  'category-infrastructure': {
    className: 'category-infrastructure',
    icon: '🏗️',
    color: '#607d8b'
  },
  'category-safety': {
    className: 'category-safety',
    icon: '🛡️',
    color: '#e91e63'
  },
  'category-environment': {
    className: 'category-environment',
    icon: '🌱',
    color: '#8bc34a'
  },
  'category-utilities': {
    className: 'category-utilities',
    icon: '⚡',
    color: '#03a9f4'
  },
  'category-transport': {
    className: 'category-transport',
    icon: '🚗',
    color: '#673ab7'
  },
  'category-road-infrastructure': {
    className: 'category-road-infrastructure',
    icon: '🛣️',
    color: '#f59e0b'
  },
  'category-water-supply': {
    className: 'category-water-supply',
    icon: '💧',
    color: '#0ea5e9'
  },
  'category-sanitation': {
    className: 'category-sanitation',
    icon: '🧹',
    color: '#8b5cf6'
  },
  'category-public-safety': {
    className: 'category-public-safety',
    icon: '🚨',
    color: '#dc2626'
  },
  'category-healthcare': {
    className: 'category-healthcare',
    icon: '🏥',
    color: '#ec4899'
  },
  'category-transportation': {
    className: 'category-transportation',
    icon: '🚌',
    color: '#10b981'
  },
  'category-environment': {
    className: 'category-environment',
    icon: '🌱',
    color: '#22c55e'
  },
  'category-housing': {
    className: 'category-housing',
    icon: '🏠',
    color: '#f97316'
  },
  'category-other': {
    className: 'category-other',
    icon: '📋',
    color: '#6b7280'
  },
  'category-test-category': {
    className: 'category-test-category',
    icon: '🧪',
    color: '#a855f7'
  }
};

export const createGoogleMapsMarker = (type = 'user-location', options = {}) => {
  if (!L) return null;
  
  // Initialize CSS
  createMarkerCSS();
  
  const config = markerTypes[type] || markerTypes['user-location'];
  const icon = options.icon || config.icon;
  const selected = options.selected ? ' selected' : '';
  const pulse = options.pulse ? ' pulse' : '';
  
  const markerHTML = `
    <div class="google-marker${selected}${pulse}">
      <div class="marker-pin ${config.className}">
        <div class="marker-inner">
          <span class="marker-icon">${icon}</span>
        </div>
      </div>
    </div>
  `;
  
  return L.divIcon({
    className: '',
    html: markerHTML,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

export const createClusterMarker = (count, type = 'issue-open') => {
  if (!L) return null;
  
  createMarkerCSS();
  
  let size = 40;
  let fontSize = '14px';
  
  if (count >= 100) {
    size = 60;
    fontSize = '16px';
  } else if (count >= 10) {
    size = 50;
    fontSize = '15px';
  }
  
  const config = markerTypes[type] || markerTypes['issue-open'];
  
  const clusterHTML = `
    <div class="cluster-marker" style="
      width: ${size}px;
      height: ${size}px;
      font-size: ${fontSize};
      background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%);
    ">
      ${count}
    </div>
  `;
  
  return L.divIcon({
    className: '',
    html: clusterHTML,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

// User location marker with pulse effect
export const createUserLocationMarker = (options = {}) => {
  if (!L) return null;
  
  createMarkerCSS();
  
  const userLocationHTML = `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
    ">
      <div style="
        background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1);
        animation: pulse 2s infinite;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">
        📍
      </div>
    </div>
  `;
  
  return L.divIcon({
    className: '',
    html: userLocationHTML,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Legacy support for existing code
export const customMarkerIcon = (label = '', type = 'user-location') => {
  return createGoogleMapsMarker(type, { icon: label });
};
