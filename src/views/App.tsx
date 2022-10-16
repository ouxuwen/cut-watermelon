import React, { useEffect } from 'react';
import PostPreview from '../pose-detection/post-preview/post-preview';
// import Score from './score';
import Clock from './clock';
import createScene from './Scene';

function App() {
  useEffect(() => {
    createScene();
  }, []);

  return (
    <div id="App">
      <PostPreview />
      <Clock />
      {/* <Score /> */}
      <div id="three_canvas" />
    </div>
  );
}

export default App;
