import { useAuth } from '../../contexts/AuthContext'

export default function Header({ title = 'れんめも' }) {
  const { signOut } = useAuth()

  return (
    <header className="bg-white/80 backdrop-blur border-b border-indigo-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none">🎵</span>
        <h1 className="text-base font-bold text-indigo-800 tracking-wide">{title}</h1>
      </div>
      <button
        onClick={signOut}
        className="text-xs text-gray-400 hover:text-indigo-600 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50"
      >
        ログアウト
      </button>
    </header>
  )
}
