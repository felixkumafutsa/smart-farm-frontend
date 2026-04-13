// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('smart_farm_token') || 'DUMMY_TOKEN';

export const loginUser = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }
    return data;
};

export const fetchDevices = async () => {
    const response = await fetch(`${API_BASE_URL}/devices`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.devices || [];
};

export const registerDevice = async (deviceData) => {
    const response = await fetch(`${API_BASE_URL}/devices/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }
    return data.device;
};

export const fetchLatestData = async (deviceId) => {
    const response = await fetch(`${API_BASE_URL}/iot/latest?device_id=${deviceId}`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
};

export const fetchHistoryData = async (deviceId, hours = 24) => {
    const response = await fetch(`${API_BASE_URL}/iot/history?device_id=${deviceId}&hours=${hours}`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.history || [];
};
