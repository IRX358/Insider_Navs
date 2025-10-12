import React from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { mockFaculty, mockLocations } from '../data/mockData';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const totalFaculty = mockFaculty.length;
  const totalRoutes = 1; 
  const availableFaculty = mockFaculty.filter(f => f.availability).length;
  const unavailableFaculty = totalFaculty - availableFaculty;
  const availableHODs = mockFaculty.filter(f => f.availability && f.role === 'HOD').length;
  const availableCCs = mockFaculty.filter(f => f.availability && f.role === 'CC').length;

  return (
    <div className="dashboard-box">
            <h3>Current Data Dashboard : </h3>
        <div className="dashboard-container">
        <div className="dashboard-item">
            <h3 className="blinking-text">{totalFaculty}</h3>
            <p>Faculty Details Stored</p>
            <div className="loading-line"></div>
        </div>
        <div className="dashboard-item">
            <h3 className="blinking-text">{totalRoutes}</h3>
            <p>Route Navigations</p>
            <div className="loading-line"></div>
        </div>
        <div className="dashboard-item">
            <h3 className="blinking-text">{availableFaculty}/{totalFaculty}</h3>
            <p>Faculties Available Today</p>
            <div className="loading-line"></div>
        </div>
        <div className="dashboard-item pie-chart-container">
            <div style={{ width: '100px', height: '100px' }}>
            <PieChart
                data={[
                { title: 'Available', value: availableFaculty, color: '#93ea78ff' },
                { title: 'Unavailable', value: unavailableFaculty, color: '#f86464ff' },
                ]}
            />
            </div>
            <p>Faculty Availability</p>
            <div className="loading-line"></div>
        </div>
        <div className="dashboard-item pie-chart-container">
            <div style={{ width: '100px', height: '100px' }}>
            <PieChart
                data={[
                { title: 'HODs', value: availableHODs, color: '#fb145dff' },
                { title: 'CCs', value: availableCCs, color: '#5a2bd6' },
                ]}
            />
            </div>
            <p>Available HODs & CCs</p>
            <div className="loading-line"></div>
        </div>
        </div>
    </div>
  );
};