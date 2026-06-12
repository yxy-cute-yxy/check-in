import { useRef } from 'react';
import { Camera } from 'lucide-react';

interface Props {
  photo: string;
  onChange: (base64: string) => void;
}

export function PhotoCapture({ photo, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-50
                   shadow-[0_4px_20px_rgb(0,0,0,0.04)]
                   hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
                   hover:-translate-y-0.5 transition-all duration-200
                   flex items-center justify-center group"
      >
        {photo ? (
          <img src={photo} alt="头像" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-zinc-300
                          group-hover:text-lime-500 transition-colors">
            <Camera className="w-6 h-6" />
            <span className="text-[10px] font-medium">拍照</span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <p className="text-[10px] text-zinc-400">点击上传或拍摄头像</p>
    </div>
  );
}
