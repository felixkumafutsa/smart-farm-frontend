import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Thermometer, Droplets, Unplug, Sun, Activity, LogOut, Terminal, Plus, ChevronDown, MapPin, Cpu, Menu, X, Home, BarChart3, Bell, Settings } from 'lucide-react';
import MetricCard from './MetricCard';
import Charts from './Charts';
import { fetchLatestData, fetchHistoryData, fetchDevices } from '../services/api';
import RegisterDeviceModal from './RegisterDeviceModal';
import DevicesPage from './DevicesPage';

const Dashboard = ({ onLogout }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar state
  const [activeSection, setActiveSection] = useState('dashboard'); // For sidebar highlight
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDeviceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDevices = async () => {
    try {
      const deviceList = await fetchDevices();
      setDevices(deviceList);
      if (deviceList.length > 0 && !selectedDevice) {
        setSelectedDevice(deviceList[0]);
      } else if (deviceList.length === 0) {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to load devices", err);
      setLoading(false);
    }
  };

  const loadData = useCallback(async () => {
    if (!selectedDevice) return;
    try {
      const [latest, history] = await Promise.all([
        fetchLatestData(selectedDevice.device_id),
        fetchHistoryData(selectedDevice.device_id, 12)
      ]);
      setLatestData(latest);
      setHistoryData(history.reverse()); // Reverse to chronological order for charts
    } catch (error) {
      console.error("Dashboard error fetching data", error);
      setLatestData(null); // Clear data if fetch fails (e.g., 404 No Data)
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDevice]);

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      setLatestData(null); // Clear old data immediately to prevent "ghost" data
      setHistoryData([]);
      loadData();
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedDevice, loadData]);

  if (loading && devices.length > 0 && !latestData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary text-white">
        <div className="w-16 h-16 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-mono tracking-widest uppercase">Initializing Quantum Farm...</h2>
      </div>
    );
  }

  const isOnline = !!latestData; // Device is online if we have recent data

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'devices', label: 'Devices', icon: Cpu },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-bg-secondary border-r border-border-light transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                <Terminal className="w-6 h-6 text-accent-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Smart Farm</h2>
                <p className="text-xs text-text-muted font-mono">CONTROL CENTER</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 text-text-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeSection === item.id
                        ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                        : 'text-text-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border-light">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-bg-secondary/50 border-b border-border-light">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-text-muted hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${!isOnline ? 'bg-accent-danger' : 'bg-accent-secondary'}`}></div>
            <span className={`text-xs font-bold uppercase tracking-wider ${isOnline ? 'text-accent-secondary' : 'text-accent-danger'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        {/* Main Dashboard Content */}
        {activeSection === 'devices' ? (
          <DevicesPage 
            devices={devices} 
            onAddDevice={() => setShowRegisterModal(true)} 
            onUpdateDevice={(updated) => {
              setDevices(prev => prev.map(d => d.device_id === updated.device_id ? { ...d, ...updated } : d));
              if (selectedDevice?.device_id === updated.device_id) {
                setSelectedDevice(prev => ({ ...prev, ...updated }));
              }
            }}
            onDeleteDevice={(deviceId) => {
              setDevices(prev => {
                const updatedDevices = prev.filter(d => d.device_id !== deviceId);
                if (selectedDevice?.device_id === deviceId) {
                  setSelectedDevice(updatedDevices.length > 0 ? updatedDevices[0] : null);
                }
                return updatedDevices;
              });
            }}
          />
        ) : (
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top duration-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
                <Terminal className="w-8 h-8 text-accent-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Smart Farm Control</h1>
                <p className="text-sm text-text-muted font-mono">
                  {selectedDevice?.location || selectedDevice?.device_id || 'No device selected'} telemetry
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDeviceDropdownOpen(!deviceDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-bg-secondary/50 border border-border-light rounded-xl text-white hover:border-accent-primary/40 transition-all"
                >
                  <MapPin className="text-accent-primary" size={18} />
                  <span className="font-semibold">{selectedDevice?.location || 'Select Unit'}</span>
                  <ChevronDown size={16} className={`text-text-muted transition-transform ${deviceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {deviceDropdownOpen && (
                  <div className="absolute top-full right-0 md:left-0 mt-2 w-64 bg-bg-secondary border border-border-light rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                    {devices.map(device => (
                      <button
                        key={device.device_id}
                        onClick={() => {
                          setSelectedDevice(device);
                          setDeviceDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex flex-col ${selectedDevice?.device_id === device.device_id ? 'bg-accent-primary/10 border-l-2 border-accent-primary' : ''}`}
                      >
                        <span className="text-white font-medium">{device.location}</span>
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-tighter">{device.device_id}</span>
                      </button>
                    ))}
                    <div className="border-t border-white/5 p-2">
                       <button 
                        onClick={() => {
                          setShowRegisterModal(true);
                          setDeviceDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent-primary/10 text-accent-primary text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-accent-primary hover:text-bg-primary transition-all"
                       >
                         <Plus size={14} /> Add Hardware Unit
                       </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="status-badge flex items-center gap-3 px-4 py-2 bg-bg-secondary/50 border border-border-light rounded-full">
                <div className={`w-2 h-2 rounded-full animate-pulse ${!isOnline ? 'bg-accent-danger' : 'bg-accent-secondary'}`}></div>
                <span className={`text-xs font-bold uppercase tracking-widest ${isOnline ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                   {isOnline ? 'Core Systems Active' : 'System Failure'}
                </span>
              </div>
              <button 
                onClick={onLogout}
                className="p-2.5 rounded-xl bg-bg-secondary/50 border border-border-light text-text-muted hover:text-accent-danger hover:border-accent-danger/30 transition-all"
                title="De-authenticate"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>
          {devices.length === 0 && !loading ? (
            <div className="glass-panel p-12 text-center animate-fade-in">
              <div className="w-20 h-20 bg-accent-primary/10 border border-accent-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Cpu className="text-accent-primary" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">No Hardware Units Detected</h2>
              <p className="text-text-muted max-w-md mx-auto mb-8">
                Your telemetry network is currently offline. Register your first ESP32 gadget to start monitoring your farm automation.
              </p>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="px-8 py-3 bg-accent-primary text-bg-primary font-bold rounded-xl hover:bg-accent-primary/90 transition-all flex items-center gap-2 mx-auto"
              >
                <Plus size={20} /> Provision First Unit
              </button>
            </div>
          ) : !latestData ? (
            <div className="glass-panel p-12 text-center animate-fade-in">
              <div className="w-20 h-20 bg-accent-danger/10 border border-accent-danger/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Activity className="text-accent-danger" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">No Data Available</h2>
              <p className="text-text-muted max-w-md mx-auto mb-8">
                No telemetry readings found for the selected device. Ensure your device is transmitting data.
              </p>
            </div>
          ) : (
            <>
              <div className="metrics-grid">
                <MetricCard 
                  title="Temperature" 
                  value={latestData?.temperature || '--'} 
                  unit="°C" 
                  icon={Thermometer} 
                  delayClass="delay-2"
                  min={-10}
                  max={60}
                  color="var(--accent-warn)"
                />
                <MetricCard 
                  title="Humidity" 
                  value={latestData?.humidity || '--'} 
                  unit="%" 
                  icon={Droplets} 
                  delayClass="delay-2"
                  min={0}
                  max={100}
                  color="var(--accent-primary)"
                />
                <MetricCard 
                  title={latestData?.water_level !== undefined ? "Water Level" : "Soil Moisture"} 
                  value={latestData?.water_level !== undefined ? latestData.water_level : latestData?.soil_moisture || '--'} 
                  unit={latestData?.water_level !== undefined ? "L" : ""} 
                  icon={latestData?.water_level !== undefined ? Activity : Unplug} 
                  delayClass="delay-3"
                  min={0}
                  max={latestData?.water_level !== undefined ? 1000 : 100}
                  color="var(--accent-secondary)"
                />
                <MetricCard 
                  title="Light Intensity" 
                  value={latestData?.light_intensity || '--'} 
                  unit="lux" 
                  icon={Sun} 
                  delayClass="delay-3"
                  min={0}
                  max={5000}
                  color="#fcd34d"
                />
              </div>

              <div className="charts-grid">
                 {historyData.length > 0 ? (
                   <Charts data={historyData} />
                 ) : (
                   <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                      <p style={{ color: 'var(--text-muted)' }}><Activity className="card-icon" /> Insufficient historical data</p>
                   </div>
                 )}
              </div>
            </>
          )}
        </div>
        )}

        {showRegisterModal && (
          <RegisterDeviceModal 
            onClose={() => setShowRegisterModal(false)}
            onDeviceAdded={(newDevice) => {
              setDevices(prev => [...prev, newDevice]);
              if (!selectedDevice) setSelectedDevice(newDevice);
            }}
          />
        )}
      </div> 
    </div> 
  );
};

export default Dashboard;