import { Toaster } from '@/components/ui/sonner'
import { AppShell } from '@/components/layout/AppShell'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { useApp } from '@/context/AppContext'
import { seedIfNeeded } from '@/lib/seed'

// 通用占位页（后续 Phase 会替换）
function StubPage({ title }: { title: string }) {
  const { dispatch } = useApp()
  return (
    <div className="p-5">
      <div className="bg-slate-50 rounded-2xl p-10 text-center">
        <p className="text-4xl mb-3">🚧</p>
        <p className="text-slate-500 font-medium">{title}</p>
        <p className="text-slate-400 text-xs mt-1">即将构建...</p>
        <button
          className="mt-4 px-4 py-2 bg-lime-500 text-white rounded-xl text-sm"
          onClick={() => dispatch({ type: 'SET_PAGE', payload: 'home' })}
        >
          返回首页
        </button>
      </div>
    </div>
  )
}

// 页面路由
function PageRouter() {
  const { state } = useApp()

  switch (state.currentPage) {
    case 'registration':
      return <StubPage title="工人实名制登记" />
    case 'checkin':
      return <StubPage title="考勤打卡" />
    case 'attendance':
      return <StubPage title="考勤记录" />
    case 'manager':
      return <StubPage title="考勤数据统计" />
    default:
      return <Dashboard />
  }
}

export default function App() {
  // 首次加载：预填充模拟数据
  if (!localStorage.getItem('checkin_seeded')) {
    seedIfNeeded()
    window.location.reload()
    return null
  }

  const { state, dispatch } = useApp()

  // 首次拦截：无 currentUser 强制跳转注册页
  if (!state.currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-md p-8 mx-4 max-w-sm">
          <div className="text-4xl mb-3">🏗️</div>
          <p className="text-neutral-900 text-lg font-bold">智慧工地管理系统</p>
          <p className="text-slate-500 text-sm mt-1">施工安全第一，请先完善您的劳务实名制登记</p>
          <button
            className="mt-5 w-full py-3 bg-lime-500 text-white rounded-xl font-medium hover:bg-lime-600 transition-colors"
            onClick={() => dispatch({ type: 'SET_PAGE', payload: 'registration' })}
          >
            前往注册
          </button>
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
