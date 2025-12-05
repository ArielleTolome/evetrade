import { useState } from 'react';

const useRipple = () => {
  const [ripples, setRipples] = useState([]);

  const createRipple = (event) => {
    const { clientX, clientY } = event;
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();

    const x = clientX - left;
    const y = clientY - top;
    const size = Math.max(width, height);
    const newRipple = {
      x: x,
      y: y,
      size: size,
      key: new Date().getTime(),
    };

    setRipples(prevRipples => [...prevRipples, newRipple]);

    setTimeout(() => {
      setRipples(prevRipples => prevRipples.filter(ripple => ripple.key !== newRipple.key));
    }, 1000);
  };

  return [
    ripples,
    createRipple
  ];
};

export default useRipple;
