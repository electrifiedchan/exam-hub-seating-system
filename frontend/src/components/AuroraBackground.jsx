import React from 'react';

const AuroraBackground = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            overflow: 'hidden',
            background: '#000'
        }}>
            <img
                src="/aurora-bg.webp"
                alt="Aurora Background"
                style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: '-1px',
                    width: '150%',
                    height: 'auto',
                    minHeight: '100%',
                    objectFit: 'cover',
                    animation: 'aurora-pan 20s ease-in-out infinite alternate'
                }}
            />
            <style>{`
        @keyframes aurora-pan {
          0% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-48%) scale(1.02); }
          100% { transform: translateX(-52%) scale(1); }
        }
      `}</style>
        </div>
    );
};

export default AuroraBackground;
