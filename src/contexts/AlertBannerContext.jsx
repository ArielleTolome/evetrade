import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AlertBanner from '../components/ui/AlertBanner';

const AlertBannerContext = createContext();

export const useAlertBanner = () => useContext(AlertBannerContext);

export const AlertBannerProvider = ({ children }) => {
  const [banners, setBanners] = useState([]);

  const addBanner = useCallback((bannerProps) => {
    const id = uuidv4();
    setBanners((prevBanners) => [...prevBanners, { ...bannerProps, id }]);
  }, []);

  const removeBanner = useCallback((id) => {
    setBanners((prevBanners) =>
      prevBanners.filter((banner) => banner.id !== id)
    );
  }, []);

  return (
    <AlertBannerContext.Provider value={{ banners, addBanner, removeBanner }}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-50">
        {banners.map((banner) => (
          <AlertBanner key={banner.id} {...banner} onDismiss={() => removeBanner(banner.id)} />
        ))}
      </div>
    </AlertBannerContext.Provider>
  );
};
