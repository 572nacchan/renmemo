import Badge from '../ui/Badge'

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
}

const durationColor = (mins) => {
  if (mins >= 60) return 'bg-indigo-600 text-white'
  if (mins >= 30) return 'bg-indigo-400 text-white'
  return 'bg-indigo-100 text-indigo-600'
}

export default function RecordItem({ record, onEdit, onDelete }) {
  const handleDelete = () => {
    if (window.confirm('この記録を削除しますか？')) onDelete(record.id)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 py-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        {/* 練習時間インジケーター */}
        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${durationColor(record.duration_minutes)}`}>
          <span className="text-sm font-black leading-none">{record.duration_minutes}</span>
          <span className="text-[9px] font-medium opacity-80 leading-none mt-0.5">分</span>
        </div>

        {/* メイン情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-400 leading-none">{formatDate(record.date)}</p>
              {record.pieces ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant={record.pieces.type} />
                  <p className="text-sm font-semibold text-gray-700 truncate">{record.pieces.title}</p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-500 mt-1">自由練習</p>
              )}
            </div>
            <div className="flex shrink-0 -mr-1">
              <button
                onClick={() => onEdit(record)}
                className="p-1.5 text-gray-300 hover:text-indigo-500 transition-colors rounded-lg hover:bg-indigo-50"
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
              >
                🗑️
              </button>
            </div>
          </div>

          {record.memo && (
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed border-l-2 border-indigo-100 pl-2">
              {record.memo}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
