import { useState, useMemo } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import CalendarView from '../components/calendar/CalendarView'
import EventBadge from '../components/calendar/EventBadge'
import EventForm from '../components/calendar/EventForm'
import RecordItem from '../components/records/RecordItem'
import { useRecords } from '../hooks/useRecords'
import { useEvents } from '../hooks/useEvents'

const todayYMD = new Date().toISOString().slice(0, 10)

const formatSelectedDate = (ymd) => {
  const d = new Date(ymd + 'T00:00:00')
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday: ['日', '月', '火', '水', '木', '金', '土'][d.getDay()],
    isToday: ymd === todayYMD,
  }
}

export default function CalendarPage() {
  const { records, loading: recordsLoading, updateRecord, deleteRecord } = useRecords()
  const { events, loading: eventsLoading, addEvent, updateEvent, deleteEvent } = useEvents()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedYMD, setSelectedYMD] = useState(todayYMD)
  const [modal, setModal] = useState(null)

  const loading = recordsLoading || eventsLoading

  const recordsByDate = useMemo(() =>
    records.reduce((acc, r) => {
      acc[r.date] = (acc[r.date] ?? 0) + r.duration_minutes
      return acc
    }, {}),
    [records]
  )

  const eventsByDate = useMemo(() =>
    events.reduce((acc, e) => {
      if (!acc[e.date]) acc[e.date] = []
      acc[e.date].push(e)
      return acc
    }, {}),
    [events]
  )

  const selectedRecords = records.filter((r) => r.date === selectedYMD)
  const selectedEvents = events.filter((e) => e.date === selectedYMD)
  const dateInfo = formatSelectedDate(selectedYMD)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }
  const goToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedYMD(todayYMD)
  }

  const handleSubmit = async (values) => {
    if (modal.mode === 'add') await addEvent({ ...values, date: values.date || selectedYMD })
    else await updateEvent(modal.event.id, values)
    setModal(null)
  }

  const handleDeleteEvent = (id) => {
    if (window.confirm('このイベントを削除しますか？')) deleteEvent(id)
  }

  return (
    <Layout title="カレンダー">
      <div className="max-w-lg mx-auto">

        {/* 月ナビゲーション */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-indigo-50">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-indigo-50 text-gray-500 transition-colors">
            ‹
          </button>
          <div className="text-center">
            <p className="text-lg font-black text-indigo-800 leading-none">
              {month + 1}<span className="text-sm font-bold ml-0.5">月</span>
            </p>
            <p className="text-xs text-gray-400">{year}</p>
          </div>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-indigo-50 text-gray-500 transition-colors">
            ›
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* カレンダーグリッド */}
            <div className="px-3 pt-3">
              <CalendarView
                year={year}
                month={month}
                recordsByDate={recordsByDate}
                eventsByDate={eventsByDate}
                selectedYMD={selectedYMD}
                onSelect={setSelectedYMD}
              />
            </div>

            {/* 今日ボタン */}
            {(year !== today.getFullYear() || month !== today.getMonth()) && (
              <div className="flex justify-center pt-2">
                <button onClick={goToday} className="text-xs text-indigo-500 hover:text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors">
                  今日に戻る
                </button>
              </div>
            )}

            {/* 選択日の詳細 — スケジュール帳ページ */}
            <div className="mt-3 mx-3 mb-4 bg-white rounded-2xl shadow-sm overflow-hidden border border-indigo-50">
              {/* 日付ヘッダー */}
              <div className={`px-4 py-3 flex items-center justify-between border-b border-indigo-50 ${
                dateInfo.isToday ? 'bg-indigo-600' : 'bg-white'
              }`}>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black leading-none ${dateInfo.isToday ? 'text-white' : 'text-indigo-800'}`}>
                    {dateInfo.day}
                  </span>
                  <span className={`text-sm font-medium ${dateInfo.isToday ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {dateInfo.month}月 ({dateInfo.weekday})
                    {dateInfo.isToday && <span className="ml-2 text-xs">Today</span>}
                  </span>
                </div>
                <button
                  onClick={() => setModal({ mode: 'add' })}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    dateInfo.isToday
                      ? 'bg-white/20 hover:bg-white/30 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  ＋ 追加
                </button>
              </div>

              {/* イベント・記録リスト */}
              {selectedEvents.length === 0 && selectedRecords.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-300">
                  <p className="text-2xl mb-1">—</p>
                  <p className="text-xs">この日の予定・記録はありません</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {/* イベント */}
                  {selectedEvents.map((e) => (
                    <div key={e.id} className="px-4 py-3 flex items-start gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        e.type === 'concert' ? 'bg-pink-400' :
                        e.type === 'rehearsal' ? 'bg-emerald-400' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <EventBadge type={e.type} />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{e.title}</p>
                        {e.memo && <p className="text-xs text-gray-400 mt-0.5">{e.memo}</p>}
                      </div>
                      <div className="flex shrink-0">
                        <button onClick={() => setModal({ mode: 'edit', event: e })} className="p-1.5 text-gray-300 hover:text-indigo-500 transition-colors rounded-lg hover:bg-indigo-50">✏️</button>
                        <button onClick={() => handleDeleteEvent(e.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">🗑️</button>
                      </div>
                    </div>
                  ))}

                  {/* 練習記録 */}
                  {selectedRecords.map((r) => (
                    <div key={r.id} className="px-4 py-3 flex items-start gap-3">
                      <div className="mt-0.5 w-2 h-2 rounded-full shrink-0 bg-indigo-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-indigo-400 font-semibold">練習 {r.duration_minutes}分</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {r.pieces?.title ?? '自由練習'}
                        </p>
                        {r.memo && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{r.memo}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'イベントを追加' : 'イベントを編集'}
          onClose={() => setModal(null)}
        >
          <EventForm
            initial={modal.mode === 'edit' ? modal.event : { date: selectedYMD }}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </Layout>
  )
}
