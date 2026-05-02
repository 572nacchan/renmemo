import { useState } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import PieceCard from '../components/pieces/PieceCard'
import PieceForm from '../components/pieces/PieceForm'
import { usePieces } from '../hooks/usePieces'

export default function PiecesPage() {
  const { pieces, loading, error, addPiece, updatePiece, deletePiece } = usePieces()
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', piece }
  const [filter, setFilter] = useState('all') // 'all' | 'piece' | 'textbook'

  const filtered = pieces.filter((p) => filter === 'all' || p.type === filter)

  const handleSubmit = async (values) => {
    if (modal.mode === 'add') await addPiece(values)
    else await updatePiece(modal.piece.id, values)
    setModal(null)
  }

  return (
    <Layout title="曲・教本">
      <div className="p-4 space-y-4">
        {/* フィルタータブ */}
        <div className="flex gap-2">
          {[['all', 'すべて'], ['piece', '曲'], ['textbook', '教本']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === val
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ローディング */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* 一覧 */}
        {!loading && filtered.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <p className="text-4xl mb-2">🎵</p>
            <p className="text-sm">まだ登録されていません</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((piece) => (
            <PieceCard
              key={piece.id}
              piece={piece}
              onEdit={(p) => setModal({ mode: 'edit', piece: p })}
              onDelete={deletePiece}
            />
          ))}
        </div>
      </div>

      {/* 追加FAB */}
      <button
        onClick={() => setModal({ mode: 'add' })}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center text-2xl transition-colors z-10"
        aria-label="曲・教本を追加"
      >
        ＋
      </button>

      {/* モーダル */}
      {modal && (
        <Modal
          title={modal.mode === 'add' ? '曲・教本を追加' : '曲・教本を編集'}
          onClose={() => setModal(null)}
        >
          <PieceForm
            initial={modal.mode === 'edit' ? modal.piece : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </Layout>
  )
}
