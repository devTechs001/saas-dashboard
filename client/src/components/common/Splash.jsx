import React, { useEffect, useState } from 'react';

const Splash = ({ duration = 2500, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 500);
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#1976d2',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-in',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    logoBox: {
      width: 120,
      height: 120,
      borderRadius: 24,
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      marginBottom: 32,
      animation: 'pulse 2s ease-in-out infinite',
    },
    companyName: {
      color: 'white',
      fontSize: 32,
      fontWeight: 700,
      marginBottom: 8,
      animation: 'slideUp 0.6s ease-out',
    },
    tagline: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 16,
      marginBottom: 32,
      animation: 'slideUp 0.6s ease-out 0.2s both',
    },
    progressContainer: {
      width: 200,
      animation: 'slideUp 0.6s ease-out 0.4s both',
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255,255,255,0.3)',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      width: `${progress}%`,
      backgroundColor: 'white',
      borderRadius: 2,
      transition: 'width 0.1s ease-out',
    },
    loadingText: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 14,
      marginTop: 16,
      animation: 'slideUp 0.6s ease-out 0.6s both',
    },
    featuresContainer: {
      position: 'absolute',
      bottom: 40,
      display: 'flex',
      gap: 32,
      animation: 'fadeIn 0.6s ease-out 1s both',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'rgba(255,255,255,0.7)',
    },
    featureDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'white',
    },
    featureText: {
      fontSize: 14,
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>

      {/* Logo */}
      <div style={styles.logoBox}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="#1976d2">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      </div>

      {/* Company Name */}
      <div style={styles.companyName}>Enterprise SaaS</div>
      <div style={styles.tagline}>Dashboard & Analytics Platform</div>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
      </div>

      {/* Loading Text */}
      <div style={styles.loadingText}>Loading your experience...</div>

      {/* Feature Highlights */}
      <div style={styles.featuresContainer}>
        {['Real-time Analytics', 'Secure', 'Scalable'].map((feature) => (
          <div key={feature} style={styles.featureItem}>
            <div style={styles.featureDot} />
            <span style={styles.featureText}>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Splash;
