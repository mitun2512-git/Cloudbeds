import React, { useState, useEffect } from 'react';
import { getRevenueDashboard, getPickupReport } from '../services/api';
import './RevenueDashboard.css';

// ============================================
// REVENUE DASHBOARD - Diamo.ai Style
// ============================================
export default function RevenueDashboard() {
  const [data, setData] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartMetric, setChartMetric] = useState('revenue');
  const [pickupLookback, setPickupLookback] = useState(7);
  const [pickupForward, setPickupForward] = useState(7);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [dashboardData, pickupData] = await Promise.all([
          getRevenueDashboard(selectedYear),
          getPickupReport(pickupLookback, pickupForward)
        ]);
        setData(dashboardData);
        setPickup(pickupData);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedYear, pickupLookback, pickupForward]);

  if (loading) {
    return (
      <div className="revenue-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="revenue-dashboard">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const { overview, monthly, currentMonth, distribution, competitors } = data;

  // Get chart data based on selected metric
  const getChartData = () => {
    switch (chartMetric) {
      case 'adr': return monthly.adr;
      case 'occupancy': return monthly.occupancy;
      case 'revpar': return monthly.revpar;
      default: return monthly.revenue;
    }
  };

  const getChartMax = () => {
    const data = getChartData();
    const max = Math.max(...data);
    return Math.ceil(max / 10000) * 10000 || 10000;
  };

  const formatValue = (value, type) => {
    if (type === 'occupancy') return `${value}%`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="revenue-dashboard">
      {/* Header */}
      <div className="rd-header">
        <div className="rd-header-left">
          <h1>Overview</h1>
          <div className="rd-filter">
            <span className="filter-label">Filter:</span>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="year-select"
            >
              <option value={2025}>On the Books (2025)</option>
              <option value={2026}>On the Books (2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="kpi-cards">
        <KPICard 
          label="Rooms Sold" 
          value={overview.roomsSold.value.toLocaleString()} 
          change={overview.roomsSold.change}
          lastYear={overview.roomsSold.lastYear}
        />
        <KPICard 
          label="Average Daily Rate" 
          value={`$${overview.adr.value}`} 
          change={overview.adr.change}
          lastYear={`$${overview.adr.lastYear}`}
        />
        <KPICard 
          label="Occupancy" 
          value={`${overview.occupancy.value}%`} 
          change={overview.occupancy.change}
          lastYear={`${overview.occupancy.lastYear}%`}
        />
        <KPICard 
          label="RevPAR" 
          value={`$${overview.revpar.value}`} 
          change={overview.revpar.change}
          lastYear={`$${overview.revpar.lastYear}`}
        />
        <KPICard 
          label="Rooms Revenue" 
          value={`$${overview.revenue.value.toLocaleString()}`} 
          change={overview.revenue.change}
          lastYear={`$${overview.revenue.lastYear.toLocaleString()}`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="rd-main-grid">
        {/* Left Column - Revenue Summary & Performance Table */}
        <div className="rd-left-column">
          {/* Revenue Summary Chart */}
          <div className="rd-card">
            <div className="rd-card-header">
              <h2>Revenue Summary</h2>
              <div className="rd-filter">
                <span className="filter-label">Filter:</span>
                <span className="filter-value">{selectedYear}</span>
              </div>
            </div>
            
            <div className="chart-toggle">
              <button 
                className={chartMetric === 'revenue' ? 'active' : ''} 
                onClick={() => setChartMetric('revenue')}
              >
                Revenue
              </button>
              <button 
                className={chartMetric === 'adr' ? 'active' : ''} 
                onClick={() => setChartMetric('adr')}
              >
                ADR
              </button>
              <button 
                className={chartMetric === 'occupancy' ? 'active' : ''} 
                onClick={() => setChartMetric('occupancy')}
              >
                Occ
              </button>
              <button 
                className={chartMetric === 'revpar' ? 'active' : ''} 
                onClick={() => setChartMetric('revpar')}
              >
                RevPAR
              </button>
            </div>

            {/* Current Month Summary */}
            <div className="month-summary">
              <div className="month-summary-header">
                <span className="month-name">{currentMonth.name} {currentMonth.year}:</span>
                <span className="month-status">
                  {currentMonth.revenue > 0 ? '✓ On Track' : 'No data yet'}
                </span>
              </div>
              <div className="month-stats">
                <div className="stat">
                  <span className="stat-label">Total Last Year</span>
                  <span className="stat-value">${monthly.revenueLY[new Date().getMonth()].toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">On The Books</span>
                  <span className="stat-value">${currentMonth.revenue.toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Budget</span>
                  <span className="stat-value">$0</span>
                </div>
                <div className="stat">
                  <span className="stat-label">STLY</span>
                  <span className="stat-value">${monthly.revenueLY[new Date().getMonth()].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bar-chart">
              <div className="chart-y-axis">
                {[...Array(7)].map((_, i) => (
                  <span key={i} className="y-label">
                    {chartMetric === 'occupancy' 
                      ? `${100 - i * 17}%`
                      : `$${((6 - i) * (getChartMax() / 6) / 1000).toFixed(0)}K`
                    }
                  </span>
                ))}
              </div>
              <div className="chart-bars">
                {monthly.labels.map((month, idx) => {
                  const value = getChartData()[idx];
                  const max = chartMetric === 'occupancy' ? 100 : getChartMax();
                  const height = max > 0 ? (value / max) * 100 : 0;
                  return (
                    <div key={month} className="bar-container">
                      <div 
                        className={`bar ${idx === new Date().getMonth() ? 'current' : ''}`}
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${month}: ${formatValue(value, chartMetric)}`}
                      >
                        <span className="bar-value">
                          {chartMetric === 'occupancy' ? `${value}%` : `$${(value/1000).toFixed(0)}K`}
                        </span>
                      </div>
                      <span className="bar-label">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Performance Metrics Table */}
          <div className="rd-card">
            <div className="rd-card-header">
              <h2>Revenue Performance Metrics</h2>
              <span className="header-subtitle">{currentMonth.name} {currentMonth.year}</span>
            </div>
            
            <table className="metrics-table">
              <thead>
                <tr>
                  <th></th>
                  <th>On The Books</th>
                  <th>STLY</th>
                  <th>Variance</th>
                  <th>%</th>
                  <th>Total LY</th>
                  <th>Budget</th>
                  <th>% of Budget</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="metric-name">Rooms Sold</td>
                  <td>{currentMonth.roomsSold}</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                </tr>
                <tr>
                  <td className="metric-name">Occupancy</td>
                  <td>{currentMonth.occupancy}%</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                </tr>
                <tr>
                  <td className="metric-name">ADR</td>
                  <td>${currentMonth.adr}</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                </tr>
                <tr>
                  <td className="metric-name">RevPAR</td>
                  <td>${currentMonth.revpar}</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                </tr>
                <tr>
                  <td className="metric-name">Rooms Revenue</td>
                  <td>${currentMonth.revenue.toLocaleString()}</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Pricing, Distribution, Pickup */}
        <div className="rd-right-column">
          {/* Pricing and Distribution */}
          <div className="rd-card">
            <div className="rd-card-header">
              <h2>Pricing and Distribution</h2>
              <div className="rd-filter">
                <span className="filter-label">Filter:</span>
                <span className="filter-value">{currentMonth.name} {currentMonth.year}</span>
              </div>
            </div>

            {/* Competitive Price Summary */}
            <div className="competitive-summary">
              <h3>Competitive Price Summary</h3>
              <p className="comp-description">
                Compare your pricing against local competitors based on average rates.
              </p>
              
              {competitors && competitors.length > 0 ? (
                <div className="competitor-list">
                  {competitors.map((comp, idx) => (
                    <div key={comp.name} className="competitor-row">
                      <span className="comp-rank">{idx + 1}</span>
                      <span className="comp-name">{comp.name}</span>
                      <span className="comp-rate">${comp.avgRate}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No competitor data available</p>
              )}
            </div>

            {/* Distribution Summary */}
            <div className="distribution-summary">
              <h3>Distribution Summary</h3>
              
              {distribution && distribution.length > 0 ? (
                <>
                  {/* Simple Pie Chart Representation */}
                  <div className="dist-chart">
                    <div className="pie-container">
                      {distribution.slice(0, 4).map((d, idx) => {
                        const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'];
                        return (
                          <div 
                            key={d.source} 
                            className="pie-segment"
                            style={{ 
                              background: colors[idx],
                              width: `${d.percentage}%`,
                              minWidth: d.percentage > 0 ? '20px' : '0'
                            }}
                            title={`${d.source}: ${d.percentage}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="dist-legend">
                    {distribution.slice(0, 4).map((d, idx) => {
                      const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'];
                      return (
                        <div key={d.source} className="legend-item">
                          <span className="legend-dot" style={{ background: colors[idx] }}></span>
                          <span>{d.percentage}% {d.source}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="no-data">No distribution data available</p>
              )}
            </div>
          </div>

          {/* Pickup Report */}
          <div className="rd-card">
            <div className="rd-card-header">
              <h2>Pickup Report</h2>
            </div>
            
            <div className="pickup-description">
              <span>In the last </span>
              <select 
                value={pickupLookback} 
                onChange={(e) => setPickupLookback(parseInt(e.target.value))}
                className="pickup-select"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
              <span>, you picked up <strong>${pickup?.summary?.revenue?.toLocaleString() || 0}</strong> in revenue for the next </span>
              <select 
                value={pickupForward} 
                onChange={(e) => setPickupForward(parseInt(e.target.value))}
                className="pickup-select"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            {pickup && (
              <>
                <div className="pickup-summary">
                  <div className="pickup-stat">
                    <span className="pickup-label">Rooms Sold</span>
                    <span className="pickup-value">{pickup.summary.roomsSold} Nights</span>
                  </div>
                  <div className="pickup-stat">
                    <span className="pickup-label">ADR</span>
                    <span className="pickup-value">${pickup.summary.adr}</span>
                  </div>
                  <div className="pickup-stat">
                    <span className="pickup-label">Revenue</span>
                    <span className="pickup-value">${pickup.summary.revenue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Pickup Chart */}
                <div className="pickup-chart">
                  {pickup.daily.map((day, idx) => {
                    const maxRev = Math.max(...pickup.daily.map(d => d.revenue)) || 100;
                    const height = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0;
                    return (
                      <div key={idx} className="pickup-bar-container">
                        <div 
                          className="pickup-bar"
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`${day.dayName}: $${day.revenue}`}
                        />
                        <span className="pickup-day">{day.dayName}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ label, value, change, lastYear }) {
  const changeNum = parseFloat(change);
  const isPositive = changeNum > 0;
  const isNegative = changeNum < 0;
  
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        {change && (
          <span className={`kpi-change ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
            {isPositive ? '↑' : isNegative ? '↓' : ''}{Math.abs(changeNum)}%
          </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-comparison">Last year: {lastYear || '-'}</div>
    </div>
  );
}

