import React from 'react';

const LoadingSpinner = ({ label = 'Loading...' }) => {
    return (
        <main className="loading-screen" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #161616 0%, #1f1f1f 100%)'
        }}>
            <style>{`
                @keyframes quickhire-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '52px',
                    height: '52px',
                    margin: '0 auto 16px',
                    border: '3px solid rgba(255,255,255,0.16)',
                    borderTopColor: '#d20d3b',
                    borderRightColor: '#ff5470',
                    borderRadius: '50%',
                    animation: 'quickhire-spin 0.9s linear infinite'
                }} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f5f5f5' }}>{label}</h2>
                <p style={{ marginTop: '8px', color: '#c8c8c8', fontSize: '0.95rem' }}>Preparing your experience</p>
            </div>
        </main>
    );
};

export default LoadingSpinner;
