import React, { useEffect } from 'react';
import PostPreview from '../pose-detection/post-preview/post-preview';
import createScene, { startGame } from './Scene';

function App() {
  useEffect(() => {
    createScene();
  }, []);

  return (
    <div id="App">
      <PostPreview />
      <div id="three_canvas" />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50px',
          height: '25px',
          background: '#FFFFFF',
          zIndex: 100,
        }}
        onPointerDown={startGame}
      >
        开始
      </div>
    </div>
  );
}

export default App;
