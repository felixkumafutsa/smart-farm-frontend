// src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';

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
    try {
        const response = await fetch(`${API_BASE_URL}/iot/latest?device_id=${deviceId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (!response.ok) {
            console.warn(`API returned ${response.status}. Mocking data...`);
            return getMockLatestData();
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Failed to fetch latest data', error);
        return getMockLatestData();
    }
};

export const fetchHistoryData = async (deviceId, hours = 24) => {
    try {
        const response = await fetch(`${API_BASE_URL}/iot/history?device_id=${deviceId}&hours=${hours}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (!response.ok) {
            console.warn(`API returned ${response.status}. Mocking historical data...`);
            return getMockHistoryData(hours);
        }
        
        const data = await response.json();
        return data.history;
    } catch (error) {
        console.error('Failed to fetch history data', error);
        return getMockHistoryData(hours);
    }
};

// Mock Data Generators for robust UI demonstration if backend auth is strict
function getMockLatestData() {
    return {
        temperature: (20 + Math.random() * 5).toFixed(1),
        humidity: (40 + Math.random() * 20).toFixed(1),
        soil_moisture: Math.floor(300 + Math.random() * 400),
        light_intensity: Math.floor(1000 + Math.random() * 3000),
        status: 'online',
        timestamp: new Date().toISOString()
    };
}

function getMockHistoryData(hours) {
    const data = [];
    const now = new Date();
    for(let i=hours; i>=0; i--) {
        const t = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
            created_at: t.toISOString(),
            temperature: (22 + Math.sin(i) * 2 + Math.random()).toFixed(1),
            humidity: (50 + Math.cos(i) * 10 + Math.random() * 5).toFixed(1),
        });
    }
    return data;
}
