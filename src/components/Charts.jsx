import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const time = new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <div style={{
        background: 'rgba(25, 34, 52, 0.9)',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        padding: '12px',
        borderRadius: '8px',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
      }}>
        <p style={{ margin: '0 0 8px 0', color: '#8a9bb2', fontSize: '0.9rem' }}>{time}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color, fontWeight: 'bold' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Charts = ({ data }) => {
  return (
    <div className="glass-panel animate-fade-in delay-4" style={{ padding: '24px', height: '400px' }}>
      <div style={{ marginBottom: '20px' }}>
         <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Environmental Trends</h3>
         <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Temperature & Humidity over last 24h</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-warn)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--accent-warn)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
          <XAxis 
            dataKey="created_at" 
            tickFormatter={(tick) => {
                const d = new Date(tick);
                return `${d.getHours()}:00`;
            }}
            stroke="var(--text-muted)" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
          />
          <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="temperature" 
            name="Temperature (°C)"
            stroke="var(--accent-warn)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTemp)" 
          />
          <Area 
            type="monotone" 
            dataKey="humidity" 
            name="Humidity (%)"
            stroke="var(--accent-primary)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorHum)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
