import { useAuth } from '../../contexts/AuthContext'

export default function Header({ title = 'れんめも' }) {
  const { signOut } = useAuth()

  return (
    <header className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <h1 className="text-lg font-bold tracking-wide">{title}</h1>
      <button
        onClick={signOut}
        className="text-xs text-indigo-200 hover:text-white transition-colors"
      >
        ログアウト
      </button>
    </header>
  )
}
