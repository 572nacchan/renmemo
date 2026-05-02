import { useState } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import RecordItem from '../components/records/RecordItem'
import RecordForm from '../components/records/RecordForm'
import { useRecords } from '../hooks/useRecords'
import { usePieces } from '../hooks/usePieces'

export default function RecordsPage() {
  const { records, loading, error, addRecord, updateRecord, deleteRecord } = useRecords()
  const { pieces } = usePieces()
  const [modal, setModal] = useState(null)

  const handleSubmit = async (values) => {
    if (modal.mode === 'add') await addRecord(values)
    else await updateRecord(modal.record.id, values)
    setModal(null)
  }

  const totalToday = records
    .filter((r) => r.date === new Date().toISOString().slice(0, 10))
    .reduce((sum, r) => sum + r.duration_minutes, 0)

  return (
    <Layout title="練習記録">
      <div className="p-4 space-y-4">
        {/* 今日のサマリー */}
        {totalToday > 0 && (
          <div className="bg-indigo-600 text-white rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-3xl">🎵</span>
            <div>
              <p className="text-indigo-200 text-xs">今日の練習</p>
              <p className="font-bold text-lg">{totalToday} 分</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        {!loading && records.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm">まだ記録がありません</p>
          </div>
        )}

        <div className="space-y-3">
          {records.map((record) => (
            <RecordItem
              key={record.id}
              record={record}
              onEdit={(r) => setModal({ mode: 'edit', record: r })}
              onDelete={deleteRecord}
            />
          ))}
        </div>
      </div>

      {/* 追加FAB */}
      <button
        onClick={() => setModal({ mode: 'add' })}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center text-2xl transition-colors z-10"
        aria-label="練習記録を追加"
      >
        ＋
      </button>

      {modal && (
        <Modal
          title={modal.mode === 'add' ? '練習記録を追加' : '練習記録を編集'}
          onClose={() => setModal(null)}
        >
          <RecordForm
            initial={modal.mode === 'edit' ? modal.record : undefined}
            pieces={pieces}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </Layout>
  )
}
