import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import PropTypes from 'prop-types';

/**
 * A component to display a confetti celebration animation.
 * It respects the 'prefers-reduced-motion' media query.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.active - Whether the confetti animation is active.
 * @param {number} [props.particleCount=200] - The number of confetti pieces to render.
 * @param {number} [props.spread=70] - The spread angle for the confetti burst.
 * @param {object} [props.origin={ x: 0.5, y: 0.5 }] - The origin point of the confetti burst, in a 0-1 range for x and y.
 */
const Confetti = ({
  active,
  particleCount = 200,
  spread = 70,
  origin = { x: 0.5, y: 0.5 },
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const deepSeaPalette = ['#415A77', '#778DA9', '#E0E1DD', '#ffd700', '#00f0ff'];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with system preference
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!active || prefersReducedMotion) {
    return null;
  }

  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      numberOfPieces={particleCount}
      spread={spread}
      origin={origin}
      colors={deepSeaPalette}
      recycle={false}
      run={active}
      gravity={0.15}
    />
  );
};

Confetti.propTypes = {
  active: PropTypes.bool.isRequired,
  particleCount: PropTypes.number,
  spread: PropTypes.number,
  origin: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
};

export default Confetti;
