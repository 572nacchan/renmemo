import { useState } from 'react'
import Calendar from 'react-calendar'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import EventBadge from '../components/calendar/EventBadge'
import EventForm from '../components/calendar/EventForm'
import RecordItem from '../components/records/RecordItem'
import { useRecords } from '../hooks/useRecords'
import { useEvents } from '../hooks/useEvents'
import 'react-calendar/dist/Calendar.css'

const toYMD = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function CalendarPage() {
  const { records, loading: recordsLoading } = useRecords()
  const { events, loading: eventsLoading, addEvent, updateEvent, deleteEvent } = useEvents()
  const [selected, setSelected] = useState(new Date())
  const [modal, setModal] = useState(null)

  const loading = recordsLoading || eventsLoading

  const recordsByDate = records.reduce((acc, r) => {
    acc[r.date] = (acc[r.date] ?? 0) + r.duration_minutes
    return acc
  }, {})

  const eventsByDate = events.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = []
    acc[e.date].push(e)
    return acc
  }, {})

  const selectedYMD = toYMD(selected)
  const selectedRecords = records.filter((r) => r.date === selectedYMD)
  const selectedEvents = events.filter((e) => e.date === selectedYMD)

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    const ymd = toYMD(date)
    const hasRecord = !!recordsByDate[ymd]
    const dayEvents = eventsByDate[ymd] ?? []
    if (!hasRecord && dayEvents.length === 0) return null

    return (
      <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap px-0.5">
        {hasRecord && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block shrink-0" />}
        {dayEvents.map((e) => (
          <span
            key={e.id}
            className={`w-1.5 h-1.5 rounded-full block shrink-0 ${
              e.type === 'concert' ? 'bg-pink-500' : e.type === 'rehearsal' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    )
  }

  const handleSubmit = async (values) => {
    if (modal.mode === 'add') {
      await addEvent({ ...values, date: values.date || selectedYMD })
    } else {
      await updateEvent(modal.event.id, values)
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('このイベントを削除しますか？')) deleteEvent(id)
  }

  return (
    <Layout title="カレンダー">
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* カレンダー */}
            <div className="bg-white rounded-2xl shadow-sm p-3 calendar-wrapper">
              <Calendar
                value={selected}
                onChange={setSelected}
                locale="ja-JP"
                tileContent={tileContent}
                calendarType="gregory"
              />
            </div>

            {/* 凡例 */}
            <div className="flex gap-4 px-1 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500 block" />練習記録</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500 block" />演奏会</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 block" />練習</span>
            </div>

            {/* 選択日の詳細 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500">
                  {selected.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
                </p>
                <button
                  onClick={() => setModal({ mode: 'add' })}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full transition-colors"
                >
                  ＋ イベント追加
                </button>
              </div>

              {/* イベント */}
              {selectedEvents.length > 0 && (
                <div className="space-y-2 mb-3">
                  {selectedEvents.map((e) => (
                    <div key={e.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <EventBadge type={e.type} />
                        <p className="font-bold text-gray-800 text-sm mt-1">{e.title}</p>
                        {e.memo && <p className="text-xs text-gray-400 mt-0.5">{e.memo}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setModal({ mode: 'edit', event: e })} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">✏️</button>
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 練習記録 */}
              {selectedRecords.length === 0 && selectedEvents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl">
                  この日の記録はありません
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedRecords.map((r) => (
                    <RecordItem key={r.id} record={r} onEdit={() => {}} onDelete={() => {}} />
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
