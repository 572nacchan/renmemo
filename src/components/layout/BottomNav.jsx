import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',         label: 'ホーム',    icon: '🏠' },
  { to: '/pieces',   label: '曲・教本',  icon: '🎼' },
  { to: '/records',  label: '記録',      icon: '📝' },
  { to: '/calendar', label: 'カレンダー', icon: '📅' },
  { to: '/tools',    label: 'ツール',    icon: '🎛️' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-indigo-100 shadow-[0_-4px_24px_rgba(79,70,229,0.08)] z-10">
      <div className="flex max-w-lg mx-auto">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className={`flex flex-col items-center py-2 gap-0.5 transition-all duration-200 ${
                isActive ? 'text-indigo-600' : 'text-gray-400'
              }`}>
                <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-indigo-100 scale-110' : ''
                }`}>
                  <span className={`leading-none transition-all duration-200 ${isActive ? 'text-xl' : 'text-lg'}`}>
                    {icon}
                  </span>
                </div>
                <span className={`text-[10px] font-medium transition-all duration-200 ${
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
