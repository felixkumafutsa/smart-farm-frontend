import React from 'react';

const MetricCard = ({ title, value, unit, icon: Icon, delayClass, min = 0, max = 100, color = 'var(--accent-primary)' }) => {
  // Safe parsing of value ensuring it's a number
  const numValue = parseFloat(value);
  const isValid = !isNaN(numValue);
  
  // Calculate percentage for the gauge
  const percentage = isValid ? Math.max(0, Math.min(100, ((numValue - min) / (max - min)) * 100)) : 0;
  
  // SVG Circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`glass-panel animate-fade-in ${delayClass} card-group`} style={{ position: 'relative' }}>
      <div className="card-header">
        <div className="card-title-group">
          <Icon className="card-icon" size={20} style={{ color }} />
          <h3 className="card-title">{title}</h3>
        </div>
      </div>
      
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', paddingBottom: '30px' }}>
        <div className="gauge-container" style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '16px' }}>
          {/* Background circle */}
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="var(--bg-secondary)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Foreground progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={color}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={isValid ? strokeDashoffset : circumference}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          
          {/* Value placed in center of gauge */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2 className="metric-value" style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>
              {isValid ? numValue : '--'}
            </h2>
            <span className="metric-unit" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
