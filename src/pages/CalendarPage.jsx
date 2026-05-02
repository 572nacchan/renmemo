import { useState } from 'react'
import Calendar from 'react-calendar'
import Layout from '../components/layout/Layout'
import RecordItem from '../components/records/RecordItem'
import { useRecords } from '../hooks/useRecords'
import 'react-calendar/dist/Calendar.css'

const toYMD = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function CalendarPage() {
  const { records, loading } = useRecords()
  const [selected, setSelected] = useState(new Date())

  const recordsByDate = records.reduce((acc, r) => {
    acc[r.date] = (acc[r.date] ?? 0) + r.duration_minutes
    return acc
  }, {})

  const selectedYMD = toYMD(selected)
  const selectedRecords = records.filter((r) => r.date === selectedYMD)

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    const ymd = toYMD(date)
    const mins = recordsByDate[ymd]
    if (!mins) return null
    return (
      <div className="flex justify-center mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block" />
      </div>
    )
  }

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return ''
    const ymd = toYMD(date)
    if (recordsByDate[ymd]) return 'has-record'
    return ''
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
            <div className="bg-white rounded-2xl shadow-sm p-3 calendar-wrapper">
              <Calendar
                value={selected}
                onChange={setSelected}
                locale="ja-JP"
                tileContent={tileContent}
                tileClassName={tileClassName}
                calendarType="gregory"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                {selected.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
              </p>

              {selectedRecords.length === 0 ? (
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
    </Layout>
  )
}
