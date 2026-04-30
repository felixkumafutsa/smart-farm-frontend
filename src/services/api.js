// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('smart_farm_token') || 'DUMMY_TOKEN';

// Common fetch options for CORS with credentials
const getFetchOptions = (method = 'GET', body = null) => {
    const options = {
        method,
        credentials: 'include', // Enable cookies and credentials
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);
    return options;
};

export const loginUser = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        ...getFetchOptions('POST', { username, password })
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }
    return data;
};

export const fetchDevices = async () => {
    const response = await fetch(`${API_BASE_URL}/api/devices`, {
        ...getFetchOptions('GET'),
        headers: {
            ...getFetchOptions('GET').headers,
            'Authorization': `Bearer ${getToken()}`
        }
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.devices || [];
};

export const registerDevice = async (deviceData) => {
    const response = await fetch(`${API_BASE_URL}/api/devices/register`, {
        ...getFetchOptions('POST', deviceData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }
    return data.device;
};

export const fetchLatestData = async (deviceId) => {
    const response = await fetch(`${API_BASE_URL}/api/iot/latest?device_id=${deviceId}`, {
        ...getFetchOptions('GET'),
        headers: {
            ...getFetchOptions('GET').headers,
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
    const response = await fetch(`${API_BASE_URL}/api/iot/history?device_id=${deviceId}&hours=${hours}`, {
        ...getFetchOptions('GET'),
        headers: {
            ...getFetchOptions('GET').headers,
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

export const updateDevice = async (deviceId, deviceData) => {
    const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}`, {
        ...getFetchOptions('PATCH', deviceData),
        headers: {
            ...getFetchOptions('PATCH').headers,
            'Authorization': `Bearer ${getToken()}`
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Update failed');
    }
    return data.device;
};

export const deleteDevice = async (deviceId) => {
    const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}`, {
        ...getFetchOptions('DELETE'),
        headers: {
            ...getFetchOptions('DELETE').headers,
            'Authorization': `Bearer ${getToken()}`
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Deletion failed');
    }
    return data;
};
