import React, { useEffect } from 'react';
import PostPreview from '../pose-detection/post-preview/post-preview';
// import Score from './score';
import Clock from './clock';
import Fireworks from './fireworks';
import createScene from './Scene';

function App() {
  useEffect(() => {
    createScene();
    console.log('process.env.DEBUG_MODE', process.env.DEBUG_MODE);
  }, []);

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
