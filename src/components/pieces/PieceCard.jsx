import Badge from '../ui/Badge'

const TYPE_BG = {
  piece:    'from-indigo-400 to-violet-500',
  textbook: 'from-amber-400 to-orange-400',
}

export default function PieceCard({ piece, onEdit, onDelete }) {
  const handleDelete = () => {
    if (window.confirm(`「${piece.title}」を削除しますか？`)) onDelete(piece.id)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex hover:shadow-md transition-shadow duration-200">
      {/* サムネイル */}
      {piece.image_url ? (
        <img src={piece.image_url} alt={piece.title} className="w-20 shrink-0 object-cover" />
      ) : (
        <div className={`w-20 shrink-0 bg-gradient-to-br ${TYPE_BG[piece.type] ?? TYPE_BG.piece} flex items-center justify-center`}>
          <span className="text-3xl opacity-90">{piece.type === 'textbook' ? '📚' : '🎵'}</span>
        </div>
      )}

      {/* コンテンツ */}
      <div className="flex-1 px-3 py-3 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm leading-snug truncate">{piece.title}</p>
            {piece.composer && (
              <p className="text-xs text-gray-400 truncate mt-0.5">{piece.composer}</p>
            )}
          </div>
          <div className="flex shrink-0 -mr-1">
            <button
              onClick={() => onEdit(piece)}
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

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <Badge variant={piece.type} />
          <Badge variant={piece.is_active ? 'active' : 'inactive'} />
          {piece.external_url && (
            <a
              href={piece.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-600 underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              リンク ↗
            </a>
          )}
        </div>

        {piece.memo && (
          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{piece.memo}</p>
        )}
      </div>
    </div>
  )
}
