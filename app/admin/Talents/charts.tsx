'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  getApplicationTrends,
  getLocationDistribution,
  getExperienceDistribution
} from './supabaseService';

interface ChartsProps {
  showCharts: boolean;
}

export default function Charts({ showCharts }: ChartsProps) {
  // Chart data states
  const [applicationTrends, setApplicationTrends] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [experienceData, setExperienceData] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showCharts) {
      loadChartData();
    }
  }, [showCharts, chartPeriod]);

  const loadChartData = async () => {
    try {
      setIsLoading(true);
      
      // Load application trends
      const { data: trendsData } = await getApplicationTrends(chartPeriod);
      if (trendsData) {
        setApplicationTrends(trendsData);
      }

      // Load location distribution from database
      const { data: locData } = await getLocationDistribution();
      if (locData) {
        setLocationData(locData);
      }

      // Load experience distribution from database
      const { data: expData } = await getExperienceDistribution();
      if (expData) {
        setExperienceData(expData);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChartPeriodChange = (period: 'day' | 'week' | 'month') => {
    setChartPeriod(period);
  };

  if (!showCharts) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Application Trends Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Application Trends</h3>
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => handleChartPeriodChange(period)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartPeriod === period
                    ? 'bg-[#556B2F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#556B2F" 
                  strokeWidth={2}
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Radar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Location Distribution Radar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Location Distribution ({locationData.length} locations)
          </h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : locationData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={locationData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="location" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                  <Radar
                    name="Count"
                    dataKey="count"
                    stroke="#556B2F"
                    fill="#556B2F"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No location data available
            </div>
          )}
        </div>

        {/* Experience Distribution Radar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Experience Distribution ({experienceData.length} ranges)
          </h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : experienceData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={experienceData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                  <Radar
                    name="Count"
                    dataKey="count"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No experience data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 