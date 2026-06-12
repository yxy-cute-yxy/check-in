import { useEffect, useState, useCallback } from 'react';
import { Camera, Check, RefreshCw, X } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { GPSIndicator } from './GPSIndicator';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (photo: string, location: string) => void;
}

export function CameraModal({ open, onClose, onConfirm }: Props) {
  const { videoRef, canvasRef, capturedImage, error, startCamera, capture, stopCamera, reset } = useCamera();
  const [location, setLocation] = useState<string | null>(null);
  const [step, setStep] = useState<'camera' | 'preview'>('camera');

  const handleOpen = useCallback(() => {
    setStep('camera');
    setLocation(null);
    reset();
    startCamera();
  }, [startCamera, reset]);

  useEffect(() => {
    if (open) handleOpen();
    else stopCamera();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCapture() {
    capture();
    setStep('preview');
  }

  function handleRetake() {
    reset();
    setStep('camera');
    setLocation(null);
    startCamera();
  }

  function handleConfirm() {
    if (capturedImage && location) {
      onConfirm(capturedImage, location);
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white text-sm font-bold tracking-wide">
          {step === 'camera' ? '现场拍照验证' : '照片预览'}
        </span>
        <div className="w-6" />
      </div>

      {/* 内容区 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {error ? (
          <div className="text-center">
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <button
              onClick={handleRetake}
              className="px-6 py-3 bg-white/10 text-white rounded-2xl text-sm font-bold"
            >
              重试
            </button>
          </div>
        ) : step === 'camera' ? (
          /* 实时摄像头画面 */
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          /* 照片预览 */
          <div className="w-full max-w-sm">
            <div className="rounded-3xl overflow-hidden bg-neutral-800 mb-4">
              {capturedImage && (
                <img src={capturedImage} alt="打卡照片" className="w-full object-cover" />
              )}
            </div>
            <GPSIndicator onDone={(loc) => setLocation(loc)} />
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="px-5 py-6 flex justify-center gap-4">
        {step === 'camera' ? (
          <button
            onClick={handleCapture}
            disabled={!!error}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center
                       shadow-[0_0_0_4px_rgba(255,255,255,0.2)]
                       hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Camera className="w-7 h-7 text-neutral-900" />
          </button>
        ) : (
          <>
            <button
              onClick={handleRetake}
              className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center
                         hover:bg-white/20 transition-colors"
            >
              <RefreshCw className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleConfirm}
              disabled={!location}
              className="w-16 h-16 rounded-full bg-lime-500 flex items-center justify-center
                         shadow-[0_0_0_4px_rgba(132,204,22,0.3)]
                         hover:scale-105 active:scale-95 transition-all duration-200
                         disabled:opacity-40 disabled:hover:scale-100"
            >
              <Check className="w-7 h-7 text-white" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
