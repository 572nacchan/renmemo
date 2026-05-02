import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useRecords } from '../hooks/useRecords'
import { useEvents } from '../hooks/useEvents'

const todayYMD = () => new Date().toISOString().slice(0, 10)

const diffDays = (dateStr) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })
}

export default function HomePage() {
  const { user } = useAuth()
  const { records, loading: recordsLoading } = useRecords()
  const { events, loading: eventsLoading } = useEvents()
  const navigate = useNavigate()

  const loading = recordsLoading || eventsLoading

  const todayMinutes = useMemo(
    () => records.filter((r) => r.date === todayYMD()).reduce((s, r) => s + r.duration_minutes, 0),
    [records]
  )

  const recent = useMemo(() => records.slice(0, 3), [records])

  // 直近の演奏会（今日以降）
  const nextConcert = useMemo(
    () => events.find((e) => e.type === 'concert' && e.date >= todayYMD()),
    [events]
  )

  // 直近イベント（演奏会以外も含む、今日以降3件）
  const upcomingEvents = useMemo(
    () => events.filter((e) => e.date >= todayYMD()).slice(0, 3),
    [events]
  )

  const TYPE_ICON = { concert: '🎼', rehearsal: '🎹', other: '📌' }

  return (
    <Layout title="れんめも">
      <div className="p-4 space-y-4">
        {/* 本番カウントダウン */}
        {nextConcert && (() => {
          const days = diffDays(nextConcert.date)
          return (
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-5 shadow-md">
              <p className="text-pink-100 text-xs">本番まで</p>
              <p className="font-bold text-3xl mt-0.5">
                {days === 0 ? '今日！' : days > 0 ? `あと ${days} 日` : `${Math.abs(days)} 日前`}
              </p>
              <p className="text-pink-100 text-sm mt-1 truncate">🎼 {nextConcert.title}</p>
            </div>
          )
        })()}

        {/* 今日の練習 */}
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

        {/* 直近のイベント */}
        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-600 mb-2">直近のイベント</h2>
            <div className="space-y-2">
              {upcomingEvents.map((e) => {
                const days = diffDays(e.date)
                return (
                  <div key={e.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{TYPE_ICON[e.type]}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{e.title}</p>
                        <p className="text-xs text-gray-400">{formatDate(e.date)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ml-2 ${days <= 7 ? 'text-pink-500' : 'text-gray-400'}`}>
                      {days === 0 ? '今日' : `${days}日後`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 最近の練習記録 */}
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
