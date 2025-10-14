import React from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { mockFaculty } from '../data/mockData';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const totalFaculty = mockFaculty.length;
  const totalRoutes = 12; 
  const availableFaculty = mockFaculty.filter(f => f.availability).length;
  const unavailableFaculty = totalFaculty - availableFaculty;
  const availableHODs = mockFaculty.filter(f => f.availability && f.role === 'HOD').length;
  const availableCCs = mockFaculty.filter(f => f.availability && f.role === 'CC').length;

  return (
    <div className="dashboard-box animated-border">
      <div className="dashboard-container">
        <div className="dashboard-item">
          <h3 className="blinking-text">{totalFaculty}</h3>
          <p>Faculty Details Stored</p>
        </div>
        <div className="dashboard-item">
          <h3 className="blinking-text">{totalRoutes}</h3>
          <p>Route Navigations</p>
        </div>
        <div className="dashboard-item">
          <h3 className="blinking-text">{`${availableFaculty}/${totalFaculty}`}</h3>
          <p>Faculties Available Today</p>
        </div>
        <div className="dashboard-item pie-chart-container">
          <div style={{ width: '100px', height: '100px' }}>
            <PieChart
              data={[
                { title: 'Available', value: availableFaculty, color: '#5ced80ff' },
                { title: 'Unavailable', value: unavailableFaculty, color: '#f05e5eff' },
              ]}
              lineWidth={20}
              paddingAngle={5}
              animate
            />
          </div>
          <p>Faculty Availability</p>
        </div>
        <div className="dashboard-item pie-chart-container">
          <div style={{ width: '100px', height: '100px' }}>
            <PieChart
              data={[
                { title: 'HODs', value: availableHODs, color: '#f0ff6bff' },
                { title: 'CCs', value: availableCCs, color: '#509dfcff' },
              ]}
               lineWidth={20}
               paddingAngle={5}
               animate
            />
          </div>
          <p>Available HODs & CCs</p>
        </div>
      </div>
    </div>
  );
};