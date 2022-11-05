import React, { useEffect } from 'react';
import PostPreview from '../pose-detection/post-preview/post-preview';
// import Score from './score';
import Clock from './clock';
import Fireworks from './fireworks';
import createScene from '../scene/scene';

function App() {
  useEffect(() => {
    createScene();
    console.log('process.env.DEBUG_MODE', process.env.DEBUG_MODE);
  }, []);
  window.addEventListener('dblclick', () => {
    const fullScreenElement = document.fullscreenElement;
    if (fullScreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  });

  return (
    <div id="App">
      <PostPreview />
      <Clock />
      {/* <Score /> */}
      <div id="three_canvas" />
      <Fireworks />
    </div>
  );
}

export default App;
