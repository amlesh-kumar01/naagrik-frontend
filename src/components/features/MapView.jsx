'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, Navigation, Filter, Map } from 'lucide-react';
import { getStatusColor, formatRelativeTime } from '../../lib/utils';

const MapView = ({ issues = [], loading = false, onIssueClick, height = '500px' }) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [currentLocation, setCurrentLocation] = useState(null);

  const filteredIssues = issues.filter(issue => {
    if (selectedFilter === 'ALL') return true;
    return issue.status === selectedFilter;
  });

  const getLocationAndIssues = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.log('Location access denied');
          }
        );
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  useEffect(() => {
    getLocationAndIssues();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B38A0] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#3B38A0]" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        </div>
        
        {['ALL', 'OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
          <Button
            key={status}
            variant={selectedFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(status)}
            className={selectedFilter === status ? 
              "bg-gradient-to-r from-[#B2B0E8] to-[#7A85C1] border-0" : 
              "border-[#B2B0E8] text-[#3B38A0] hover:bg-[#B2B0E8]/10"
            }
          >
            {status.replace('_', ' ')}
            <Badge variant="secondary" className="ml-1 bg-white/80">
              {status === 'ALL' ? issues.length : issues.filter(i => i.status === status).length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Map Placeholder with Issue Cards */}
      <div className="w-full h-full rounded-lg overflow-hidden border bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="h-full relative">
          {/* Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 opacity-30"></div>
          
          {/* Map Header */}
          <div className="relative z-10 p-4 bg-white/90 backdrop-blur-sm border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-[#3B38A0]" />
                <h3 className="font-semibold text-[#1A2A80]">Community Issues Map</h3>
                {currentLocation && (
                  <Badge variant="outline" className="border-green-500 text-green-700">
                    <Navigation className="h-3 w-3 mr-1" />
                    Location enabled
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} shown
              </div>
            </div>
          </div>

          {/* Issues Grid */}
          <div className="relative z-10 p-4 h-full overflow-y-auto">
            {filteredIssues.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No issues found for the selected filter.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIssues.map((issue) => (
                  <Card key={issue.id} className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-sm line-clamp-2 text-[#1A2A80]">
                          {issue.title}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={`ml-2 ${getStatusColor(issue.status)}`}
                        >
                          {issue.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {issue.description}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">
                          {issue.address || 'Location not specified'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={issue.priority === 'HIGH' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {issue.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {issue.category}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(issue.created_at)}
                        </span>
                      </div>
                      
                      {issue.votes_count > 0 && (
                        <div className="mb-3 text-xs text-gray-500">
                          {issue.votes_count} vote{issue.votes_count !== 1 ? 's' : ''}
                        </div>
                      )}
                      
                      {onIssueClick && (
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-[#B2B0E8] to-[#7A85C1] border-0 hover:from-[#7A85C1] hover:to-[#3B38A0]"
                          onClick={() => onIssueClick(issue)}
                        >
                          View Details
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
