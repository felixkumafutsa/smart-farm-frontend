import React, { useState } from 'react';
import { LogIn, ShieldCheck, Database, Beaker } from 'lucide-react';
import { loginUser } from '../services/api';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await loginUser(credentials.username, credentials.password);
            localStorage.setItem('smart_farm_token', data.token);
            onLoginSuccess();
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your scientific credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-vh-100 p-4">
            <div className="glass-panel w-full max-w-md p-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 rounded-full bg-cyan-glow/10 border border-cyan-glow/30 mb-4">
                        <Beaker className="w-8 h-8 text-cyan-glow" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Quantum Farm Access</h1>
                    <p className="text-sm text-text-muted">Enter laboratory credentials to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
                            System Identity
                        </label>
                        <div className="relative">
                            <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Scientist-ID / Admin"
                                required
                                value={credentials.username}
                                onChange={handleChange}
                                className="w-full bg-bg-secondary/50 border border-border-light rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-text-muted/50 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
                            Encrypted Protocol
                        </label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                value={credentials.password}
                                onChange={handleChange}
                                className="w-full bg-bg-secondary/50 border border-border-light rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-text-muted/50 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all text-sm"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-xs text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 text-accent-primary font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
                        ) : (
                            <>
                                Authenticate Sequence
                                <Database className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border-light/50 text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-[0.2em]">
                        Precision Agriculture Control v4.0.2
                    </p>
                </div>
            </div>
            
            {/* Background Decorative Element */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
};

export default Login;
