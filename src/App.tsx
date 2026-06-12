import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { AppShell } from '@/components/layout/AppShell'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { RegistrationForm } from '@/components/registration/RegistrationForm'
import { CheckInPage } from '@/components/checkin/CheckInPage'
import { useApp } from '@/context/AppContext'
import { seedIfNeeded } from '@/lib/seed'

function StubPage({ title }: { title: string }) {
  const { dispatch } = useApp()
  return (
    <div className="p-4">
      <div className="bg-white rounded-3xl p-10 text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <p className="text-4xl mb-3">&#x2007;</p>
        <p className="text-[13px] font-bold text-industrial-700 tracking-wider uppercase">{title}</p>
        <p className="text-[11px] text-zinc-300 font-mono mt-1">PHASE / BUILDING</p>
        <button
          className="mt-6 px-5 py-2.5 text-[11px] font-bold text-industrial-700 bg-zinc-50 rounded-2xl
                     hover:bg-lime-50 hover:text-lime-600 transition-colors tracking-wider"
          onClick={() => dispatch({ type: 'SET_PAGE', payload: 'home' })}
        >
          返回工作台
        </button>
      </div>
    </div>
  )
}

function PageRouter() {
  const { state } = useApp()
  switch (state.currentPage) {
    case 'registration': return <RegistrationForm />
    case 'checkin':      return <CheckInPage />
    case 'attendance':   return <StubPage title="考勤记录" />
    case 'manager':      return <StubPage title="考勤数据统计" />
    default:             return <Dashboard />
  }
}

export default function App() {
  // 同步预填充：在 useApp 之前写入 localStorage，确保 reducer 初始化时能读到
  const [ready] = useState(() => {
    if (!localStorage.getItem('checkin_seeded')) {
      seedIfNeeded()
    }
    return true
  })

  const { state, dispatch } = useApp()

  // === 首次拦截：无用户时 ===
  if (!state.currentUser) {
    // 已点击"前往注册" → 展示迎新表单
    if (state.currentPage === 'registration') {
      return <RegistrationForm />
    }

    // 初始拦截弹窗
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
           style={{
             backgroundColor: '#f4f7f4',
             backgroundImage: 'radial-gradient(circle, #d4dbd4 1px, transparent 1px)',
             backgroundSize: '20px 20px',
           }}>
        <div className="rounded-[32px] shadow-2xl shadow-black/5 p-8 max-w-md w-full bg-white">

          <h1 className="text-neutral-900 font-black text-3xl tracking-tighter leading-none">
            智慧工地
          </h1>
          <p className="tracking-[0.3em] text-xs text-neutral-400 uppercase font-mono mt-1.5">
            Smart Construction Management
          </p>

          <p className="text-[14px] text-neutral-600 font-medium leading-relaxed mt-5">
            施工安全第一，请先完善您的劳务实名制登记
          </p>

          <button
            className="mt-6 w-full py-4 bg-neutral-900 text-white rounded-2xl text-lg font-bold
                       shadow-lg shadow-black/10
                       hover:bg-lime-500 hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200"
            onClick={() => dispatch({ type: 'SET_PAGE', payload: 'registration' })}
          >
            前往注册
          </button>

          <p className="text-[10px] text-zinc-300 font-mono text-center mt-5">
            v0 · Build 001
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <AppShell>
        <PageRouter />
      </AppShell>
    </>
  )
}
