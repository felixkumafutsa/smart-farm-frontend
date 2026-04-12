import React, { useState } from 'react';
import { X, Cpu, MapPin, Navigation, Copy, Check, AlertCircle } from 'lucide-react';
import { registerDevice } from '../services/api';

const RegisterDeviceModal = ({ onClose, onDeviceAdded }) => {
  const [formData, setFormData] = useState({
    device_id: '',
    location: '',
    latitude: '0.0',
    longitude: '0.0'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredDevice, setRegisteredDevice] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const device = await registerDevice({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      });
      setRegisteredDevice(device);
      onDeviceAdded(device);
    } catch (err) {
      setError(err.message || 'Failed to register device. Check if Device ID is unique.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (registeredDevice) {
      navigator.clipboard.writeText(registeredDevice.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="text-accent-primary" size={24} />
            <h2 className="text-xl font-bold text-white">Register Hardware Unit</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {!registeredDevice ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-accent-danger/10 border border-accent-danger/20 rounded-lg flex items-center gap-3 text-accent-danger text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-text-muted">Hardware ID (slug)</label>
              <input
                required
                type="text"
                placeholder="e.g. greenhouse-alpha-01"
                className="w-full bg-bg-primary/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary/50 transition-all font-mono"
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-text-muted">Installation Location</label>
              <input
                required
                type="text"
                placeholder="e.g. North Sector - Greenhouse"
                className="w-full bg-bg-primary/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary/50 transition-all"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-widest text-text-muted">Latitude</label>
                <input
                  required
                  type="number"
                  step="any"
                  className="w-full bg-bg-primary/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary/50 transition-all font-mono"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-widest text-text-muted">Longitude</label>
                <input
                  required
                  type="number"
                  step="any"
                  className="w-full bg-bg-primary/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary/50 transition-all font-mono"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-accent-primary hover:bg-accent-primary/90 text-bg-primary font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg-primary/20 border-t-bg-primary rounded-full animate-spin" />
              ) : (
                <>Provision Unit</>
              )}
            </button>
          </form>
        ) : (
          <div className="p-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-accent-secondary/10 border border-accent-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-accent-secondary" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Registration Complete!</h3>
            <p className="text-text-muted text-sm mb-6">
              Hardware unit <b>{registeredDevice.device_id}</b> is now provisioned. Add the API Key below to your Arduino code.
            </p>

            <div className="bg-bg-primary/80 border border-accent-secondary/30 rounded-xl p-4 mb-6 relative group">
              <label className="absolute -top-2.5 left-4 px-2 bg-bg-secondary text-[10px] font-mono uppercase tracking-widest text-accent-secondary border border-accent-secondary/30 rounded">
                Telemetry API Key
              </label>
              <div className="flex items-center justify-between gap-4">
                <code className="text-accent-secondary font-mono break-all text-left text-sm">
                  {registeredDevice.api_key}
                </code>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                >
                  {copied ? <Check size={18} className="text-accent-secondary" /> : <Copy size={18} className="text-white/60" />}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterDeviceModal;
