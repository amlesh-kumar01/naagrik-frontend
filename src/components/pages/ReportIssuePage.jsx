'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, AlertTriangle, Clock, MapPin, Camera, Phone, Shield } from 'lucide-react';

const ReportIssuePage = () => {
  const router = useRouter();

  const reportingTips = [
    {
      icon: AlertTriangle,
      title: 'Be Specific',
      description: 'Provide clear, detailed descriptions of the issue to help authorities understand and address it quickly.',
    },
    {
      icon: MapPin,
      title: 'Include Location',
      description: 'Precise location information helps responders find and fix the problem efficiently.',
    },
    {
      icon: Camera,
      title: 'Add Photos/Videos',
      description: 'Visual evidence helps officials assess the severity and plan appropriate responses.',
    },
    {
      icon: Clock,
      title: 'Report Promptly',
      description: 'Early reporting can prevent issues from becoming worse and affecting more people.',
    },
  ];

  const emergencyCategories = [
    'Gas Leaks',
    'Electrical Hazards',
    'Water Main Breaks',
    'Road Hazards',
    'Structural Damage',
    'Public Safety Threats',
  ];

  const commonCategories = [
    'Potholes & Road Damage',
    'Streetlight Outages',
    'Graffiti & Vandalism',
    'Garbage & Recycling',
    'Park Maintenance',
    'Noise Complaints',
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-xl" style={{
              background: 'linear-gradient(135deg, #B2B0E8 0%, #7A85C1 100%)'
            }}>
              <Plus className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A2A80] mb-4">
              Report an Issue
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help improve your community by reporting problems that need attention. 
              Your voice matters and helps create positive change.
            </p>
          </div>

          {/* Emergency Alert */}
          <Card className="mb-8 border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)' }}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">
                    Emergency Situations
                  </h3>
                  <p className="text-red-800 mb-4">
                    For immediate emergencies requiring police, fire, or medical assistance, 
                    please call emergency services directly.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Emergency: 911
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Non-Emergency: 311
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Report Button */}
          <div className="text-center mb-12">
            <Button
              size="lg"
              onClick={() => router.push('/report/add')}
              className="px-8 py-4 text-lg font-medium text-white shadow-xl transition-all duration-200 transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #3B38A0 0%, #1A2A80 100%)',
                boxShadow: '0 8px 25px rgba(59, 56, 160, 0.3)'
              }}
            >
              <Plus className="h-6 w-6 mr-2" />
              Report New Issue
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Reporting Tips */}
            <div>
              <h2 className="text-2xl font-bold text-[#1A2A80] mb-6">
                Reporting Tips
              </h2>
              <div className="space-y-6">
                {reportingTips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <Card key={index} className="shadow-lg border-0 bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 rounded-2xl shadow-lg" style={{
                            background: 'linear-gradient(135deg, #7A85C1 0%, #3B38A0 100%)'
                          }}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#1A2A80] mb-2">
                              {tip.title}
                            </h3>
                            <p className="text-gray-600">
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Issue Categories */}
            <div>
              <h2 className="text-2xl font-bold text-[#1A2A80] mb-6">
                Common Issue Types
              </h2>
              
              {/* Emergency Issues */}
              <Card className="mb-6 border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-orange-800 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Emergency Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {emergencyCategories.map((category, index) => (
                      <div 
                        key={index}
                        className="bg-orange-50 text-orange-800 px-3 py-2 rounded-lg text-sm"
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Common Issues */}
              <Card className="border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-800 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Common Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {commonCategories.map((category, index) => (
                      <div 
                        key={index}
                        className="bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm font-medium shadow-sm"
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#1A2A80] text-center mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: '1',
                  title: 'Report',
                  description: 'Submit your issue with details and photos',
                },
                {
                  step: '2',
                  title: 'Review',
                  description: 'Local authorities review and verify the issue',
                },
                {
                  step: '3',
                  title: 'Action',
                  description: 'Work begins to address the reported problem',
                },
                {
                  step: '4',
                  title: 'Resolution',
                  description: 'Issue is resolved and marked as complete',
                },
              ].map((step, index) => (
                <Card key={index} className="text-center shadow-lg border-0 bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg" style={{
                      background: 'linear-gradient(135deg, #3B38A0 0%, #1A2A80 100%)'
                    }}>
                      {step.step}
                    </div>
                    <h3 className="font-semibold text-[#1A2A80] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ReportIssuePage;
