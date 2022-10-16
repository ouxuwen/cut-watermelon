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
      { (countDown < 60 && countDown > 0)
        ? (
          <div className="clock">
            {countDown < 10 ? `0${countDown}` : countDown}
          </div>
        ) : ''}
    </>

  );
}

export default Clock;
