import React, { useState, useEffect, useRef } from 'react';

const LazyMap = () => {
  const [isVisible, setIsVisible] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mapRef} className="footer-map">
      {isVisible ? (
        <iframe
          src="https://yandex.ru/map-widget/v1/?ll=39.773878%2C47.137922&mode=poi&poi%5Bpoint%5D=39.773805%2C47.137876&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D33801835392%26yclid%3D16843696615254392831&z=18"
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          loading="lazy"
          title="Яндекс Карта — Пилот Авто"
        />
      ) : (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          background: '#e9ecef', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '14px',
          color: '#6c757d'
        }}>
        </div>
      )}
    </div>
  );
};

export default LazyMap;