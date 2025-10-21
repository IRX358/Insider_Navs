import React, { useState, useEffect } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { AlertCircle } from 'lucide-react'; 
import './Dashboard.css';

interface AnalyticsData {
  total_faculty: number;
  total_locations: number;
  available_faculty: number;
  unavailable_faculty: number;
  available_hods: number;
  available_ccs: number;
}

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch('http://localhost:8000/api/analytics')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok fetching analytics');
        }
        return response.json();
      })
      .then((data: AnalyticsData) => {
        setAnalytics(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch analytics:", err);
        setError(err.message || "Could not load analytics data.");
        setIsLoading(false);
      });
  }, []); 

  // 4. Handle Loading State
  if (isLoading) {
    return (
      <div className="dashboard-box text-center p-6">
        <div className="w-5 h-5 border-t-2 border-purple-400 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-400 text-sm">Loading Analytics...</p>
      </div>
    );
  }

  // 5. Handle Error State
  if (error || !analytics) {
    return (
      <div className="dashboard-box error-banner !mt-8"> 
        <AlertCircle size={16} />
        {error || 'Analytics data could not be loaded.'}
      </div>
    );
  }

  const {
    total_faculty,
    total_locations,
    available_faculty,
    unavailable_faculty,
    available_hods,
    available_ccs
  } = analytics;

  const displayRoutes = total_locations;
  return (
    <div className="dashboard-box animated-border">
      <div className="dashboard-container">
        {/* Total Faculty */}
        <div className="dashboard-item">
          <h3 className="blinking-text">{total_faculty}</h3>
          <p>Faculty Details Stored</p>
        </div>
        {/* Total Locations */}
        <div className="dashboard-item">
          <h3 className="blinking-text">{displayRoutes}</h3>
          <p>Total Locations Stored</p>
        </div>
         {/* Available Faculty Count */}
        <div className="dashboard-item">
          <h3 className="blinking-text">{`${available_faculty}/${total_faculty}`}</h3>
          <p>Faculties Available Today</p>
        </div>
        {/* Faculty Availability Pie Chart */}
        <div className="dashboard-item pie-chart-container">
          <div style={{ width: '100px', height: '100px' }}>
            <PieChart
              data={[
                { title: 'Available', value: available_faculty, color: '#5ced80ff' },
                // just to make sure unavailable_faculty isn't -ve if data is weird
                { title: 'Unavailable', value: Math.max(0, unavailable_faculty), color: '#f05e5eff' },
              ]}
              lineWidth={20}
              paddingAngle={5}
              animate
              // Add labels if needed
              // label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
              // labelStyle={{ fontSize: '5px', fill: '#FFF' }}
              // labelPosition={60}
            />
          </div>
          <p>Faculty Availability</p>
        </div>
         {/* Available HODs & CCs Pie Chart */}
        <div className="dashboard-item pie-chart-container">
          <div style={{ width: '100px', height: '100px' }}>
            <PieChart
              data={[
                ...(available_hods > 0 ? [{ title: 'HODs', value: available_hods, color: '#f0ff6bff' }] : []),
                ...(available_ccs > 0 ? [{ title: 'CCs', value: available_ccs, color: '#509dfcff' }] : []),
                 // Add a placeholder if both are zero
                ...(available_hods === 0 && available_ccs === 0 ? [{ title: 'None', value: 1, color: '#4b5563' }] : []),
              ]}
               lineWidth={20}
               paddingAngle={available_hods > 0 && available_ccs > 0 ? 5 : 0} // No angle if only one segment
               animate
            />
          </div>
          <p>Available HODs & CCs</p>
        </div>
      </div>
    </div>
  );
};