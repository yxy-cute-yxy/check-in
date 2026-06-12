interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function CheckInButton({ onClick, disabled }: Props) {
  return (
    <div className="flex justify-center py-6">
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-36 h-36 rounded-full bg-lime-500
                   shadow-[0_0_0_8px_rgba(132,204,22,0.1),0_0_0_20px_rgba(132,204,22,0.05),0_12px_40px_rgba(132,204,22,0.25)]
                   hover:scale-105 hover:shadow-[0_0_0_8px_rgba(132,204,22,0.15),0_0_0_24px_rgba(132,204,22,0.08),0_16px_48px_rgba(132,204,22,0.3)]
                   active:scale-95
                   transition-all duration-300
                   flex items-center justify-center
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <span className="text-white text-lg font-black tracking-wider">
          打卡
        </span>
      </button>
    </div>
  );
}
