import React, { useState, useEffect, useRef } from 'react';
import { Cpu, MapPin, Navigation, Plus, MoreVertical, Edit2, Trash2, Activity } from 'lucide-react';
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
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeviceClick = (e, deviceId) => {
    if (activeMenuId === deviceId) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(deviceId);
    }
  };

  const handleView = (device) => {
    darkSwal.fire({
      title: 'Unit Telemetry',
      html: `
        <div class="text-left space-y-4 mt-4">
          <div class="p-4 bg-white/5 rounded-xl border border-white/5">
            <p class="text-xs text-text-muted uppercase tracking-widest mb-1">Device ID</p>
            <p class="font-mono text-accent-primary">${device.device_id}</p>
          </div>
          <div class="p-4 bg-white/5 rounded-xl border border-white/5">
            <p class="text-xs text-text-muted uppercase tracking-widest mb-1">Location</p>
            <p class="text-white">${device.location}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-white/5 rounded-xl border border-white/5">
              <p class="text-xs text-text-muted uppercase tracking-widest mb-1">Latitude</p>
              <p class="text-white">${device.latitude?.toFixed(4)}</p>
            </div>
            <div class="p-4 bg-white/5 rounded-xl border border-white/5">
              <p class="text-xs text-text-muted uppercase tracking-widest mb-1">Longitude</p>
              <p class="text-white">${device.longitude?.toFixed(4)}</p>
            </div>
          </div>
        </div>
      `,
      icon: 'info',
      iconColor: 'var(--accent-primary)',
    });
  };

  const handleEdit = async (device) => {
    const { value: formValues } = await darkSwal.fire({
      title: 'Edit Hardware Unit',
      html: `
        <div class="space-y-4 mt-6">
          <div class="text-left">
            <label class="text-xs text-text-muted uppercase tracking-widest ml-1">Location Label</label>
            <input id="swal-input1" class="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-accent-primary outline-none transition-all" value="${device.location}">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-left">
              <label class="text-xs text-text-muted uppercase tracking-widest ml-1">Latitude</label>
              <input id="swal-input2" type="number" step="any" class="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-accent-primary outline-none transition-all" value="${device.latitude}">
            </div>
            <div class="text-left">
              <label class="text-xs text-text-muted uppercase tracking-widest ml-1">Longitude</label>
              <input id="swal-input3" type="number" step="any" class="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-accent-primary outline-none transition-all" value="${device.longitude}">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Unit',
      preConfirm: () => {
        return {
          location: document.getElementById('swal-input1').value,
          latitude: parseFloat(document.getElementById('swal-input2').value),
          longitude: parseFloat(document.getElementById('swal-input3').value)
        }
      }
    });

    if (formValues) {
      try {
        const updated = await updateDevice(device.device_id, formValues);
        onUpdateDevice(updated);
        darkSwal.fire({
          title: 'Success!',
          text: 'Hardware unit updated successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        darkSwal.fire('Error', error.message, 'error');
      }
    }
  };

  const handleDelete = async (deviceId) => {
    const result = await darkSwal.fire({
      title: 'De-provision Unit?',
      text: "This will permanently remove the hardware unit from your telemetry network.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Keep it',
      reverseButtons: true,
      iconColor: 'var(--accent-danger)'
    });

    if (result.isConfirmed) {
      try {
        await deleteDevice(deviceId);
        onDeleteDevice(deviceId);
        darkSwal.fire({
          title: 'Deleted!',
          text: 'Hardware unit has been removed.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        darkSwal.fire('Error', error.message, 'error');
      }
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top duration-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
            <Cpu className="w-8 h-8 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Hardware Units</h1>
            <p className="text-sm text-text-muted font-mono">
              Manage your registered farm telemetry devices
            </p>
          </div>
        </div>
        <button 
          onClick={onAddDevice}
          className="flex items-center gap-2 px-6 py-3 bg-accent-primary text-bg-primary font-bold rounded-xl hover:bg-accent-primary/90 transition-all"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map(device => (
            <div 
              key={device.device_id} 
              onClick={(e) => handleDeviceClick(e, device.device_id)}
              className="glass-panel p-6 flex flex-col hover:border-accent-primary/30 transition-colors animate-fade-in group relative cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-accent-primary/10 rounded-xl border border-accent-primary/20 text-accent-primary group-hover:scale-110 transition-transform">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{device.device_id}</h3>
                    <div className="flex items-center gap-1.5 text-text-muted text-sm mt-1">
                      <MapPin size={14} />
                      <span>{device.location}</span>
                    </div>
                  </div>
                </div>
                <button 
                  className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeviceClick(e, device.device_id);
                  }}
                  title="Manage Unit"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                 <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2 text-text-muted">
                     <Navigation size={14} className="text-accent-secondary" />
                     <span>Coordinates</span>
                   </div>
                   <div className="font-mono text-white/80">
                     {device.latitude?.toFixed(4) || '0.0000'}, {device.longitude?.toFixed(4) || '0.0000'}
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
                     <span className="text-[10px] text-text-muted">
                       {device.last_seen ? `Seen ${device.last_seen.toLowerCase()}` : 'Never seen'}
                     </span>
                   </div>
                 </div>
              </div>
              
              {/* Context Menu Dropdown */}
              {activeMenuId === device.device_id && (
                <div 
                  ref={menuRef}
                  className="absolute top-16 right-4 z-50 w-48 bg-bg-secondary border border-border-light rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2 space-y-1">
                    <button 
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => { handleView(device); setActiveMenuId(null); }}
                    >
                      <Activity size={16} className="text-accent-primary" />
                      <span>View Telemetry</span>
                    </button>
                    <button 
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => { handleEdit(device); setActiveMenuId(null); }}
                    >
                      <Edit2 size={16} className="text-accent-secondary" />
                      <span>Edit Device</span>
                    </button>
                    <div className="h-px bg-border-light my-1" />
                    <button 
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-colors"
                      onClick={() => { handleDelete(device.device_id); setActiveMenuId(null); }}
                    >
                      <Trash2 size={16} />
                      <span>Remove Unit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
