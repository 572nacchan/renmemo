import { useMemo } from 'react'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

const EVENT_STYLE = {
  concert:   'bg-pink-100 text-pink-700',
  rehearsal: 'bg-emerald-100 text-emerald-700',
  other:     'bg-gray-100 text-gray-500',
}

export default function CalendarView({ year, month, recordsByDate, eventsByDate, selectedYMD, onSelect }) {
  const todayYMD = new Date().toISOString().slice(0, 10)

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const blanks = Array(firstDow).fill(null)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    return [...blanks, ...days]
  }, [year, month])

  const toYMD = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-indigo-50">
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-indigo-100">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`py-2 text-center text-xs font-bold tracking-wide ${
              i === 0 ? 'text-rose-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日グリッド */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) {
            return (
              <div
                key={`blank-${i}`}
                className="h-[72px] border-b border-r border-gray-50 bg-gray-50/50"
              />
            )
          }

          const ymd = toYMD(day)
          const dayEvents = eventsByDate[ymd] ?? []
          const mins = recordsByDate[ymd]
          const isToday = ymd === todayYMD
          const isSelected = ymd === selectedYMD
          const dow = (i % 7)
          const isSun = dow === 0
          const isSat = dow === 6

          return (
            <div
              key={ymd}
              onClick={() => onSelect(ymd)}
              className={`h-[72px] border-b border-r border-gray-100 p-1 cursor-pointer transition-colors flex flex-col ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-100'
                  : 'hover:bg-indigo-50/40'
              }`}
            >
              {/* 日付 + 練習時間 */}
              <div className="flex items-center justify-between px-0.5 mb-0.5">
                <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none ${
                  isToday
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isSelected
                      ? 'text-indigo-700'
                      : isSun
                        ? 'text-rose-400'
                        : isSat
                          ? 'text-blue-400'
                          : 'text-gray-700'
                }`}>
                  {day}
                </span>
                {mins && (
                  <span className="text-[9px] text-indigo-400 font-semibold leading-none">
                    {mins}m
                  </span>
                )}
              </div>

              {/* 練習記録バー */}
              {mins && (
                <div
                  className="mx-0.5 h-0.5 rounded-full bg-indigo-300 mb-0.5"
                  style={{ width: `${Math.min(100, (mins / 120) * 100)}%` }}
                />
              )}

              {/* イベント */}
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    className={`text-[9px] leading-[1.3] px-1 py-px rounded truncate font-medium ${EVENT_STYLE[e.type] ?? EVENT_STYLE.other}`}
                  >
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[8px] text-gray-400 pl-1 leading-none">
                    +{dayEvents.length - 2}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
