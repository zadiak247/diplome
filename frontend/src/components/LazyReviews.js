import React, { useState, useEffect, useRef } from 'react';

const LazyReviews = ({ title }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="landing-section reviews-section">
      <div className="section-content">
        <h2>{title || 'Отзывы клиентов'}</h2>
        <div className="reviews-widget" ref={containerRef}>
          {isVisible ? (
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              maxWidth: '760px',
              height: '600px',
              margin: '0 auto'
            }}>
              <iframe
                src="https://yandex.ru/maps-reviews-widget/33801835392?comments"
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px'
                }}
                title="Отзывы клиентов"
                loading="lazy"
              />
              <a
                href="https://yandex.ru/maps/org/pilot_avto/33801835392/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: 0,
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '10px',
                  color: '#b3b3b3',
                  textDecoration: 'none'
                }}
              >
                Пилот Авто на карте Батайска — Яндекс Карты
              </a>
            </div>
          ) : (
            <div style={{
              width: '100%',
              maxWidth: '800px',
              height: '600px',
              margin: '0 auto',
              background: '#f8f9fa',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6c757d'
            }}>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LazyReviews;