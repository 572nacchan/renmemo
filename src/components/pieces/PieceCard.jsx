import Badge from '../ui/Badge'

export default function PieceCard({ piece, onEdit, onDelete }) {
  const handleDelete = () => {
    if (window.confirm(`「${piece.title}」を削除しますか？`)) onDelete(piece.id)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex">
      {piece.image_url ? (
        <img src={piece.image_url} alt={piece.title} className="w-20 h-full object-cover shrink-0" />
      ) : (
        <div className="w-20 shrink-0 bg-indigo-50 flex items-center justify-center text-3xl">
          {piece.type === 'textbook' ? '📚' : '🎵'}
        </div>
      )}

      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm truncate">{piece.title}</p>
            {piece.composer && (
              <p className="text-xs text-gray-400 truncate">{piece.composer}</p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onEdit(piece)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
              ✏️
            </button>
            <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
              🗑️
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <Badge variant={piece.type} />
          <Badge variant={piece.is_active ? 'active' : 'inactive'} />
          {piece.external_url && (
            <a
              href={piece.external_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-600 underline"
              onClick={(e) => e.stopPropagation()}
            >
              リンク
            </a>
          )}
        </div>

        {piece.memo && (
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{piece.memo}</p>
        )}
      </div>
    </div>
  )
}
