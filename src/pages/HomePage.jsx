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

const TYPE_ICON = { concert: '🎼', rehearsal: '🎹', other: '📌' }

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

  const nextConcert = useMemo(
    () => events.find((e) => e.type === 'concert' && e.date >= todayYMD()),
    [events]
  )

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.date >= todayYMD()).slice(0, 3),
    [events]
  )

  return (
    <Layout title="れんめも">
      <div className="p-4 space-y-5 max-w-lg mx-auto">

        {/* 本番カウントダウン */}
        {nextConcert && (() => {
          const days = diffDays(nextConcert.date)
          return (
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400" />
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="relative px-5 py-5 text-white">
                <p className="text-pink-100 text-xs font-medium tracking-widest uppercase">Concert Countdown</p>
                <p className="font-black text-5xl mt-1 leading-none">
                  {days === 0 ? '今日！' : days > 0 ? `${days}` : `${Math.abs(days)}`}
                  {days !== 0 && <span className="text-2xl font-bold ml-1">{days > 0 ? '日後' : '日前'}</span>}
                </p>
                <p className="text-pink-100 text-sm mt-2 truncate">🎼 {nextConcert.title}</p>
              </div>
            </div>
          )
        })()}

        {/* 今日の練習 + クイックアクション */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-md">
            <p className="text-indigo-200 text-xs font-medium">今日の練習</p>
            {loading ? (
              <p className="font-bold text-2xl mt-1 leading-none">―</p>
            ) : todayMinutes > 0 ? (
              <>
                <p className="font-black text-3xl mt-1 leading-none">{todayMinutes}</p>
                <p className="text-indigo-300 text-xs mt-0.5">分</p>
              </>
            ) : (
              <p className="text-indigo-300 text-xs mt-2 leading-snug">まだ記録<br/>がありません</p>
            )}
          </div>

          <button
            onClick={() => navigate('/records')}
            className="bg-gradient-to-br from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 active:scale-95 text-white font-bold rounded-2xl p-4 shadow-md transition-all flex flex-col items-start justify-between"
          >
            <span className="text-2xl">📝</span>
            <span className="text-sm leading-tight mt-2">練習を<br/>記録する</span>
          </button>
        </div>

        {/* 直近のイベント */}
        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Upcoming</h2>
            <div className="space-y-2">
              {upcomingEvents.map((e) => {
                const days = diffDays(e.date)
                return (
                  <div key={e.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                    <span className="text-2xl shrink-0">{TYPE_ICON[e.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{e.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(e.date)}</p>
                    </div>
                    <span className={`text-xs font-bold shrink-0 px-2 py-1 rounded-full ${
                      days <= 7
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {days === 0 ? '今日' : `${days}日`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 最近の練習記録 */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Recent Practice</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recent.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">🎵</p>
              <p className="text-sm font-medium text-gray-500">まだ練習記録がありません</p>
              <p className="text-xs text-gray-400 mt-1">「記録する」ボタンから始めてみましょう</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((r, i) => (
                <div key={r.id} className={`bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3 ${i === 0 ? 'ring-1 ring-indigo-100' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    i === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-400'
                  }`}>
                    <span className="text-xs font-bold">{r.duration_minutes}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 leading-tight">
                      {r.pieces?.title ?? '自由練習'}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(r.date)} · {r.duration_minutes}分</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
