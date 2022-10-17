import React, { useEffect } from 'react';
import control from '../control';
import './index.less';

let xPoint: number;
let yPoint: number;
const bomSound = new Audio('/scene-resource/fireworks.mp3');
class Particle {
  width: number = 0;

  height: number = 0;

  xPoint: number = 0;

  yPoint: number = 0;

  x: number = 0;

  y: number = 0;

  vx: number = 0;

  vy: number = 0;

  alpha: number = 0;

  gravity: number = 0.05;

  color: any;

  constructor() {
    const random = Math.random() * 4 + 1;
    this.width = random;
    this.height = random;
    this.x = xPoint - this.width / 2;
    this.y = yPoint - this.height / 2;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.alpha = Math.random() * 0.5 + 0.5;
  }

  move() {
    this.x += this.vx;
    this.vy += this.gravity;
    this.y += this.vy;
    this.alpha -= 0.005;
    if (
      this.x <= -this.width ||
      this.x >= window.innerWidth ||
      this.y >= window.innerHeight ||
      this.alpha <= 0
    ) {
      return false;
    }
    return true;
  }

  draw(ctx: any) {
    ctx.save();
    ctx.beginPath();
    ctx.beginPath();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.arc(0, 0, this.width, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function Fireworks() {
  const [visible, setVisible] = React.useState(false);
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const probability = 0.09;
  const canvasRef = React.createRef() as React.RefObject<HTMLCanvasElement>;
  let ctx: any;
  let particles: any[] = [];

  const createFirework = () => {
    xPoint = Math.random() * (window.screen.width * 0.5) + 200;
    yPoint = Math.random() * (window.screen.height * 0.5) + 100;
    const nFire = Math.random() * 50 + 100;
    // eslint-disable-next-line no-bitwise
    const c = `rgb(${~~(Math.random() * 200 + 55)},${~~(Math.random() * 200 + 55)},${~~(
      Math.random() * 200 +
      55
    )})`;
    for (let i = 0; i < nFire; i++) {
      const particle = new Particle();
      particle.color = c;
      const vy = Math.sqrt(25 - particle.vx * particle.vx);
      if (Math.abs(particle.vy) > vy) {
        particle.vy = particle.vy > 0 ? vy : -vy;
      }
      particles.push(particle);
    }
  };

  const update = () => {
    if (particles.length < 500 && Math.random() < probability) {
      createFirework();
    }
    const alive = [];
    for (let i = 0; i < particles.length; i++) {
      if (particles[i].move()) {
        alive.push(particles[i]);
      }
    }
    particles = alive;
  };

  const paint = () => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < particles.length; i++) {
      particles[i].draw(ctx);
    }
  };

  const updateWorld = () => {
    update();
    paint();
    requestAnimationFrame(updateWorld);
  };

  const handleGameStatusChange = React.useCallback(
    (status: boolean) => {
      console.log('handleGameStatusChange[', status);
      setVisible(!status);
      if (!status) {
        bomSound.volume = 0.5;
        bomSound.currentTime = 0;
        bomSound.loop = true;
        bomSound.play();
      } else if (!visible && !bomSound.paused) {
        bomSound.pause();
      }
    },
    [visible],
  );

  useEffect(() => {
    control.onGameStatusChange(handleGameStatusChange);
    const canvas = canvasRef.current;
    console.log(canvas);
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.globalCompositeOperation = 'lighter';
      updateWorld();
    }
  }, []);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <canvas style={{ display: visible ? 'block' : 'none' }} ref={canvasRef} id="canvas" />
    </>
  );
}
export default Fireworks;
