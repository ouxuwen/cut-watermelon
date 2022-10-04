import React, { useEffect } from 'react';
import createScene from './Scene';

function App() {
  useEffect(() => {
    createScene();
  });

  return <div id="App" />;
}

export default App;
