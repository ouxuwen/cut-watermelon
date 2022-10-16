import React, { useEffect, useState } from 'react';
import control from '../control';
import './index.less';

function Clock() {
  const [countDown, setCountDown] = useState(control.countDown);
  useEffect(() => {
    control.onCountDownChange((num) => {
      setCountDown(num);
    });
  }, []);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {countDown < 30 && countDown > 0 ? (
        <div className="clock-container">
          <img className="timer" src="/scene-resource/timer.svg" alt="Timer" />
          <div className="clock">{countDown < 10 ? `0${countDown}` : countDown}</div>
        </div>
      ) : (
        ''
      )}
    </>
  );
}

export default Clock;
