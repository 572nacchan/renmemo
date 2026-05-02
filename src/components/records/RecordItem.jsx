import Badge from '../ui/Badge'

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default function RecordItem({ record, onEdit, onDelete }) {
  const handleDelete = () => {
    if (window.confirm('この記録を削除しますか？')) onDelete(record.id)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{formatDate(record.date)}</p>
          <p className="font-bold text-gray-800 mt-0.5">
            {record.duration_minutes} 分練習
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(record)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
            ✏️
          </button>
          <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
            🗑️
          </button>
        </div>
      </div>

      {record.pieces && (
        <div className="mt-2">
          <Badge variant={record.pieces.type} />
          <span className="text-xs text-gray-600 ml-1.5">{record.pieces.title}</span>
        </div>
      )}

      {record.memo && (
        <p className="text-sm text-gray-500 mt-2 line-clamp-3">{record.memo}</p>
      )}
    </div>
  )
}
