import { useRef, useState, useCallback } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  stream: MediaStream | null;
  capturedImage: string | null;
  error: string | null;
  startCamera: () => Promise<void>;
  capture: () => void;
  stopCamera: () => void;
  reset: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setCapturedImage(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      setStream(s);
      // 等下一帧让 video ref 绑定后播放
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? '请允许摄像头权限以进行拍照打卡'
        : '无法访问摄像头，请检查设备';
      setError(msg);
    }
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.75));
    stopCamera();
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  const reset = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);

  return { videoRef, canvasRef, stream, capturedImage, error, startCamera, capture, stopCamera, reset };
}
