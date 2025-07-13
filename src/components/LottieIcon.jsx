import React from 'react';
import Lottie from 'lottie-react';

const LottieIcon = ({ animationData, width = 32, height = 32, className = '', loop = true, autoplay = true }) => {
  return (
    <div className={`inline-block ${className}`} style={{ width, height }}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieIcon;