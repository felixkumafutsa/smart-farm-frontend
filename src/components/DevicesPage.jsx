import React, { useState, useEffect } from 'react';
import { Cpu, MapPin, Navigation, Plus, X, Trash2, Save, Activity, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { updateDevice, deleteDevice } from '../services/api';

const darkSwal = Swal.mixin({
  background: '#1e293b',
  color: '#f8fafc',
  confirmButtonColor: '#22c55e',
  cancelButtonColor: '#ef4444',
  customClass: {
    popup: 'rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl',
    title: 'text-2xl font-bold text-white',
    htmlContainer: 'text-text-muted',
    confirmButton: 'px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs transition-all hover:scale-105',
    cancelButton: 'px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs transition-all hover:scale-105'
  },
  buttonsStyling: true
});

const DevicesPage = ({ devices, onAddDevice, onUpdateDevice, onDeleteDevice }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const [formData, setFormData] = useState({ location: '', latitude: 0, longitude: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const handleCardClick = (device) => {
    setSelectedDevice(device);
    setFormData({
      location: device.location || '',
      latitude: device.latitude || 0,
      longitude: device.longitude || 0
    });
    setIsPaneOpen(true);
  };

  const closePane = () => {
    setIsPaneOpen(false);
    // Delay clearing selected device to allow for closing animation
    setTimeout(() => setSelectedDevice(null), 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'location' ? value : parseFloat(value) || 0
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateDevice(selectedDevice.device_id, formData);
      onUpdateDevice(updated);
      darkSwal.fire({
        title: 'Success!',
        text: 'Device details updated.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      closePane();
    } catch (error) {
      darkSwal.fire('Update Failed', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await darkSwal.fire({
      title: 'Remove Unit?',
      text: "This action cannot be undone. All telemetry history for this unit will be lost.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete Unit',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteDevice(selectedDevice.device_id);
        onDeleteDevice(selectedDevice.device_id);
        darkSwal.fire({
          title: 'Removed',
          text: 'The hardware unit has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        closePane();
      } catch (error) {
        darkSwal.fire('Error', error.message, 'error');
      }
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Main Grid Area */}
      <div className={`flex-1 p-4 md:p-8 overflow-auto transition-all duration-300 ${isPaneOpen ? 'mr-0 lg:mr-[400px]' : ''}`}>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
              <Cpu className="w-8 h-8 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Hardware Units</h1>
              <p className="text-sm text-text-muted font-mono">
                {devices.length} registered farm telemetry devices
              </p>
            </div>
          </div>
          <button 
            onClick={onAddDevice}
            className="flex items-center gap-2 px-6 py-3 bg-accent-primary text-bg-primary font-bold rounded-xl hover:bg-accent-primary/90 transition-all shadow-lg shadow-accent-primary/20"
          >
            <Plus size={20} /> Register New Unit
          </button>
        </header>

        {devices.length === 0 ? (
          <div className="glass-panel p-12 text-center animate-fade-in">
            <div className="w-20 h-20 bg-accent-primary/10 border border-accent-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Cpu className="text-accent-primary" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Hardware Units Detected</h2>
            <p className="text-text-muted max-w-md mx-auto mb-8">
              Your telemetry network is currently offline. Register your first ESP32 gadget to start monitoring your farm automation.
            </p>
            <button 
              onClick={onAddDevice}
              className="px-8 py-3 bg-accent-primary text-bg-primary font-bold rounded-xl hover:bg-accent-primary/90 transition-all flex items-center gap-2 mx-auto"
            >
              <Plus size={20} /> Provision First Unit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {devices.map(device => (
              <div 
                key={device.device_id} 
                onClick={() => handleCardClick(device)}
                className={`glass-panel p-6 flex flex-col hover:border-accent-primary/40 transition-all animate-fade-in group relative cursor-pointer ${selectedDevice?.device_id === device.device_id ? 'border-accent-primary shadow-[0_0_20px_rgba(34,197,94,0.1)]' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-accent-primary/10 rounded-xl border transition-all ${selectedDevice?.device_id === device.device_id ? 'border-accent-primary text-accent-primary scale-110' : 'border-accent-primary/20 text-accent-primary group-hover:scale-110'}`}>
                      <Cpu size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-accent-primary transition-colors">{device.device_id}</h3>
                      <div className="flex items-center gap-1.5 text-text-muted text-sm mt-1">
                        <MapPin size={14} />
                        <span>{device.location}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className={`text-text-muted transition-all ${selectedDevice?.device_id === device.device_id ? 'translate-x-1 text-accent-primary' : 'group-hover:translate-x-1'}`} />
                </div>
                
                <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                   <div className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-2 text-text-muted">
                       <Navigation size={14} className="text-accent-secondary" />
                       <span>Coordinates</span>
                     </div>
                     <div className="font-mono text-white/80">
                       {device.latitude?.toFixed(4)}, {device.longitude?.toFixed(4)}
                     </div>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-2 text-text-muted">
                       <div className={`w-2 h-2 rounded-full ${device.online ? 'bg-accent-secondary animate-pulse' : 'bg-accent-danger'}`} />
                       <span>Status</span>
                     </div>
                     <div className="flex flex-col items-end">
                       <span className={`font-medium tracking-wide uppercase text-xs ${device.online ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                         {device.online ? 'Online' : 'Offline'}
                       </span>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Pane Overlay (Mobile) */}
      {isPaneOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden animate-fade-in"
          onClick={closePane}
        />
      )}

      {/* Side Pane Content */}
      <div className={`fixed lg:absolute top-0 right-0 h-full w-full sm:w-[400px] bg-bg-secondary border-l border-border-light shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${isPaneOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedDevice && (
          <>
            <div className="p-6 border-b border-border-light flex items-center justify-between bg-bg-primary/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-primary/10 rounded-lg">
                  <Cpu className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">Manage Unit</h2>
                  <p className="text-xs font-mono text-text-muted uppercase tracking-widest">{selectedDevice.device_id}</p>
                </div>
              </div>
              <button 
                onClick={closePane}
                className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="flex-1 overflow-auto p-6 space-y-8">
              {/* Form Sections */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-text-muted ml-1">Location Label</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input 
                      required
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-bg-primary border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-all shadow-inner"
                      placeholder="e.g. North Greenhouse"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-text-muted ml-1">Latitude</label>
                    <input 
                      required
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full bg-bg-primary border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-accent-primary transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-text-muted ml-1">Longitude</label>
                    <input 
                      required
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full bg-bg-primary border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-accent-primary transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="p-4 bg-bg-primary/50 border border-white/5 rounded-2xl space-y-4">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">System Diagnostics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">Connectivity Status</span>
                    <span className={`font-bold ${selectedDevice.online ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                      {selectedDevice.online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">Last Signal</span>
                    <span className="text-white/80">{selectedDevice.last_seen ? selectedDevice.last_seen : 'No Data'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-accent-primary text-bg-primary font-bold py-4 rounded-xl hover:bg-accent-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-bg-primary/20 border-t-bg-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="p-6 bg-bg-primary/30 border-t border-border-light">
              <button 
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-accent-danger border border-accent-danger/20 hover:bg-accent-danger/10 rounded-xl transition-all font-medium"
              >
                <Trash2 size={18} />
                De-provision Unit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DevicesPage;
