/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect } from 'react';
import holistic from '../post-utils';
import './post-preview.less';

function PostPreview() {
  const videoRef = React.createRef() as React.RefObject<HTMLVideoElement>;
  const canvasRef = React.createRef() as React.RefObject<HTMLCanvasElement>;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    holistic.init({
      videoEle: videoRef.current as HTMLVideoElement,
      canvasEle: canvasRef.current as HTMLCanvasElement,
    });
    holistic.startCamera();
    return () => {};
  }, []);

  return (
    <div className="post-preview">
      <video className="preview-video" ref={videoRef} autoPlay muted />
      <canvas className="preview-canvas" ref={canvasRef} />
    </div>
  );
}

export default PostPreview;
