import React from 'react';

function useCountingAnimation(endValue: number) {
  const [animatedValue, setAnimatedValue] = React.useState(endValue);

  React.useEffect(() => {
    let animationFrameId: number;
    const duration = 500;
    const startTime = performance.now();

    // Creates a smooth deceleration effect
    const easeOutQuad = (t: number) => t * (2 - t);

    const animate = (now: number) => {
      const elapsedTime = now - startTime;
      if (elapsedTime < duration) {
        const progress = easeOutQuad(elapsedTime / duration);
        setAnimatedValue((currValue) => currValue + (endValue - currValue) * progress);
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setAnimatedValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [endValue]);
  return animatedValue;
}

export default useCountingAnimation;
