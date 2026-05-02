import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',          label: 'ホーム',   icon: '🏠' },
  { to: '/pieces',    label: '曲・教本', icon: '🎼' },
  { to: '/records',   label: '記録',     icon: '📝' },
  { to: '/calendar',  label: 'カレンダー', icon: '📅' },
  { to: '/tools',     label: 'ツール',   icon: '🎛️' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10 pb-safe">
      <div className="flex">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <span className="text-xl leading-none mb-0.5">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
