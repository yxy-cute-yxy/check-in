import { useState } from 'react';
import { toast } from 'sonner';
import { HardHat } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PhotoCapture } from './PhotoCapture';
import { TRADE_LIST, TEAM_LIST } from '@/lib/constants';
import { validatePhone, validateIdNumber, generateAvatar } from '@/lib/utils';
import type { Trade, Worker } from '@/types';

export function RegistrationForm() {
  const { state, dispatch } = useApp();
  const existing = state.currentUser;
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [idNumber, setIdNumber] = useState(existing?.idNumber ?? '');
  const [trade, setTrade] = useState<Trade>(existing?.trade ?? '木工');
  const [team, setTeam] = useState(existing?.team ?? 'A班组');
  const [photo, setPhoto] = useState(existing?.photo ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = '请输入姓名';
    if (!validatePhone(phone)) errs.phone = '请输入正确的11位手机号';
    if (!validateIdNumber(idNumber)) errs.idNumber = '请输入正确的18位身份证号';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const worker: Worker = {
      id: existing?.id ?? crypto.randomUUID(),
      name: name.trim(),
      phone,
      idNumber,
      trade,
      team,
      photo: photo || generateAvatar(name),
      registeredAt: existing?.registeredAt ?? new Date().toISOString(),
    };

    if (isEditing) {
      dispatch({ type: 'UPDATE_WORKER', payload: worker });
      toast.success('资料已更新');
    } else {
      dispatch({ type: 'REGISTER_WORKER', payload: worker });
      toast.success('实名制登记成功！欢迎加入');
    }

    dispatch({ type: 'SET_PAGE', payload: 'home' });
  }

  // 输入框通用样式
  const inputClass =
    'w-full px-4 py-3 bg-zinc-50 rounded-2xl text-[14px] text-neutral-900 ' +
    'placeholder:text-zinc-300 outline-none ' +
    'focus:bg-white focus:shadow-[0_0_0_3px_rgb(132,204,22,0.15)] ' +
    'transition-all duration-200';

  // ====== 状态一：迎新注册 ======
  if (!isEditing) {
    return (
      <div className="min-h-screen bg-[#f4f7f4]"
           style={{
             backgroundImage: 'radial-gradient(circle, #d4dbd4 1px, transparent 1px)',
             backgroundSize: '20px 20px',
           }}>
        <div className="max-w-xl mx-auto p-4">
          {/* 欢迎区 — 深色块 + 霓虹绿 */}
          <div className="bg-neutral-900 rounded-3xl p-6 text-white shadow-[0_12px_40px_rgb(0,0,0,0.15)] mb-6">
            <HardHat className="w-8 h-8 text-lime-400 mb-4" />
            <h1 className="text-2xl font-black tracking-tight leading-tight">
              HELLO!
            </h1>
            <p className="text-lime-400 text-[15px] font-bold mt-1">
              欢迎加入智慧工地
            </p>
            <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">
              请先完善实名登记，建立您的劳务档案
            </p>
          </div>

          {/* 表单卡片 */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5
                                                  shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-4">
            <PhotoCapture photo={photo} onChange={setPhoto} />

            <div>
              <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase mb-1.5 block">姓名</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入姓名" className={inputClass} />
              {errors.name && <p className="text-[10px] text-orange-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase mb-1.5 block">手机号</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                     placeholder="请输入11位手机号" inputMode="numeric" className={inputClass} />
              {errors.phone && <p className="text-[10px] text-orange-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase mb-1.5 block">身份证号</label>
              <input value={idNumber} onChange={(e) => setIdNumber(e.target.value.slice(0, 18))}
                     placeholder="请输入18位身份证号" className={inputClass} />
              {errors.idNumber && <p className="text-[10px] text-orange-500 mt-1">{errors.idNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase mb-1.5 block">工种</label>
                <select value={trade} onChange={(e) => setTrade(e.target.value as Trade)} className={inputClass + ' appearance-none'}>
                  {TRADE_LIST.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase mb-1.5 block">班组</label>
                <select value={team} onChange={(e) => setTeam(e.target.value)} className={inputClass + ' appearance-none'}>
                  {TEAM_LIST.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
            </div>

            <button type="submit"
              className="w-full py-4 bg-lime-500 text-white rounded-2xl text-[15px] font-bold
                         shadow-lg shadow-lime-500/20
                         hover:bg-neutral-900 hover:shadow-black/10 hover:scale-[1.01] active:scale-[0.99]
                         transition-all duration-200 mt-2">
              完成实名制登记
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ====== 状态二：资料修改 ======
  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-8">
      <PhotoCapture photo={photo} onChange={setPhoto} />

      <div>
        <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase mb-1.5 block">姓名</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入姓名" className={inputClass} />
        {errors.name && <p className="text-[10px] text-orange-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase mb-1.5 block">手机号</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
               placeholder="请输入11位手机号" inputMode="numeric" className={inputClass} />
        {errors.phone && <p className="text-[10px] text-orange-500 mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase mb-1.5 block">身份证号</label>
        <input value={idNumber} onChange={(e) => setIdNumber(e.target.value.slice(0, 18))}
               placeholder="请输入18位身份证号" className={inputClass} />
        {errors.idNumber && <p className="text-[10px] text-orange-500 mt-1">{errors.idNumber}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase mb-1.5 block">工种</label>
          <select value={trade} onChange={(e) => setTrade(e.target.value as Trade)} className={inputClass + ' appearance-none'}>
            {TRADE_LIST.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase mb-1.5 block">班组</label>
          <select value={team} onChange={(e) => setTeam(e.target.value)} className={inputClass + ' appearance-none'}>
            {TEAM_LIST.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
      </div>

      <button type="submit"
        className="w-full py-4 bg-neutral-900 text-white rounded-2xl text-[15px] font-bold
                   shadow-lg shadow-black/10
                   hover:bg-lime-500 hover:scale-[1.01] active:scale-[0.99]
                   transition-all duration-200">
        保存修改
      </button>
    </form>
  );
}
