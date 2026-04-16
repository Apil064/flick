import React from 'react';
import VideoControls from './VideoControls';
import Overlay from './Overlay';

const Player = ({ src, onEnded }) => {
  const videoRef = React.useRef(null);
  
  const handlePlay = () => {
    videoRef.current.play();
  };
  
  const handlePause = () => {
    videoRef.current.pause();
  };

  return (
    <div className="player">
      <video ref={videoRef} onEnded={onEnded} src={src} controls style={{ width: '100%' }} />
      <VideoControls onPlay={handlePlay} onPause={handlePause} />
      <Overlay />
    </div>
  );
};

export default Player;
