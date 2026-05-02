import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useRecords } from '../hooks/useRecords'

const today = () => new Date().toISOString().slice(0, 10)

export default function HomePage() {
  const { user } = useAuth()
  const { records, loading } = useRecords()
  const navigate = useNavigate()

  const todayMinutes = useMemo(
    () => records.filter((r) => r.date === today()).reduce((s, r) => s + r.duration_minutes, 0),
    [records]
  )

  const recent = useMemo(() => records.slice(0, 3), [records])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })
  }

  return (
    <Layout title="れんめも">
      <div className="p-4 space-y-4">
        {/* 今日のサマリー */}
        <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-md">
          <p className="text-indigo-200 text-sm">今日の練習</p>
          {loading ? (
            <p className="font-bold text-2xl mt-1">―</p>
          ) : todayMinutes > 0 ? (
            <p className="font-bold text-2xl mt-1">{todayMinutes} 分</p>
          ) : (
            <p className="text-indigo-300 text-sm mt-1">まだ記録がありません</p>
          )}
          <p className="text-xs text-indigo-300 mt-2 truncate">{user?.email}</p>
        </div>

        {/* クイックアクション */}
        <button
          onClick={() => navigate('/records')}
          className="w-full bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-2xl py-4 shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">📝</span>
          <span>練習を記録する</span>
        </button>

        {/* 最近の記録 */}
        <div>
          <h2 className="text-sm font-bold text-gray-600 mb-2">最近の練習記録</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recent.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400">
              <p className="text-3xl mb-1">🎵</p>
              <p className="text-sm">まだ記録がありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">{formatDate(r.date)}</p>
                    <p className="text-sm font-medium text-gray-700">
                      {r.duration_minutes} 分
                      {r.pieces && <span className="text-gray-400 font-normal"> · {r.pieces.title}</span>}
                    </p>
                  </div>
                  <span className="text-xl">🎵</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
