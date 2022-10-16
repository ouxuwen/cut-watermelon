import React, { useState, useEffect } from 'react';
import './index.less';
import num0 from '../../assets/numbers/number-0.svg';
import num1 from '../../assets/numbers/number-1.svg';
import num2 from '../../assets/numbers/number-2.svg';
import num3 from '../../assets/numbers/number-3.svg';
import num4 from '../../assets/numbers/number-4.svg';
import num5 from '../../assets/numbers/number-5.svg';
import num6 from '../../assets/numbers/number-6.svg';
import num7 from '../../assets/numbers/number-7.svg';
import num8 from '../../assets/numbers/number-8.svg';
import num9 from '../../assets/numbers/number-9.svg';
import control from '../control';

const nums = [num0, num1, num2, num3, num4, num5, num6, num7, num8, num9];
function Score() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    control.onScoreChange((num) => {
      setScore(num);
    });
  }, []);

  const bit = score % 10;
  const ten = score < 10 ? 0 : Math.floor((score % 100) / 10);
  const hundred = score < 100 ? 0 : Math.floor(score / 100);

  return (
    <div className="score">
      <img src={nums[hundred]} alt="" />
      <img src={nums[ten]} alt="" />
      <img src={nums[bit]} alt="" />
    </div>
  );
}

export default Score;
