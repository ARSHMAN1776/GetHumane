'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Edit2, Check, X, Loader2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface PortfolioItem {
  id: string
  image_url: string
  caption: string | null
  sort_order: number
}

interface Props {
  userId: string
}

export default function PortfolioUpload({ userId }: Props) {
  const [items,       setItems]       = useState<PortfolioItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [uploading,   setUploading]   = useState(false)
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [dragging,    setDragging]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/portfolio?user_id=${userId}`)
      .then(r => r.json())
      .then(json => { if (json.data) setItems(json.data) })
      .catch(() => toast.error('Failed to load portfolio'))
      .finally(() => setLoading(false))
  }, [userId])

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    if (items.length >= 12) { toast.error('Maximum 12 photos allowed'); return }
    setUploading(true)
    for (const file of Array.from(files)) {
      if (items.length >= 12) break
      const fd = new FormData()
      fd.append('image', file)
      fd.append('sort_order', String(items.length))
      try {
        const res  = await fetch('/api/portfolio', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setItems(p => [...p, json.data])
        toast.success('Photo uploaded!')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      }
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this photo from your portfolio?')) return
    setDeletingId(id)
    try {
      const res  = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setItems(p => p.filter(i => i.id !== id))
      toast.success('Photo removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove')
    } finally { setDeletingId(null) }
  }

  const handleSaveCaption = async (id: string) => {
    try {
      const res  = await fetch(`/api/portfolio/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ caption: editCaption }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setItems(p => p.map(i => i.id === id ? { ...i, caption: json.data.caption } : i))
      setEditingId(null)
      toast.success('Caption saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save caption')
    }
  }

  const canUpload = items.length < 12

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragging
            ? 'border-brand-400 bg-brand-50'
            : canUpload
              ? 'border-gray-200 hover:border-brand-300 hover:bg-gray-50 cursor-pointer'
              : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
        }`}
        onClick={() => canUpload && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); if (canUpload) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); if (canUpload) handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-brand-500" />
            <p className="text-sm text-gray-500 font-medium">Uploading photos…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
              <Upload size={24} className="text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {canUpload ? 'Drop photos here or click to upload' : 'Maximum photos reached'}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                JPEG, PNG, WebP · Max 5MB · {12 - items.length} slot{12 - items.length !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="py-8 text-center">
          <ImageIcon size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No photos yet. Upload some to show seekers what you do!</p>
        </div>
      )}

      {/* Grid */}
      {!loading && items.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm"
                style={{ aspectRatio: '1' }}
              >
                <img
                  src={item.image_url}
                  alt={item.caption ?? 'Portfolio photo'}
                  className="w-full h-full object-cover"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                    >
                      {deletingId === item.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Trash2 size={13} />
                      }
                    </button>
                  </div>

                  {editingId === item.id ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={editCaption}
                        onChange={e => setEditCaption(e.target.value)}
                        maxLength={150}
                        placeholder="Add a caption…"
                        className="w-full px-2 py-1 text-xs rounded-lg border border-white/30 bg-black/50 text-white placeholder:text-white/50 focus:outline-none focus:border-white"
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveCaption(item.id) }}
                        autoFocus
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={e => { e.stopPropagation(); handleSaveCaption(item.id) }}
                          className="flex-1 flex items-center justify-center gap-1 py-1 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium"
                        >
                          <Check size={11} /> Save
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setEditingId(null) }}
                          className="px-2 py-1 text-xs bg-white/20 text-white rounded-lg hover:bg-white/30"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setEditingId(item.id); setEditCaption(item.caption ?? '') }}
                      className="flex items-center gap-1.5 px-2 py-1 bg-black/40 text-white text-xs rounded-lg hover:bg-black/60 transition-colors self-start"
                    >
                      <Edit2 size={11} />
                      {item.caption ? 'Edit caption' : 'Add caption'}
                    </button>
                  )}
                </div>

                {/* Caption pill (always visible) */}
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2 pointer-events-none group-hover:opacity-0 transition-opacity">
                    <p className="text-white text-xs font-medium line-clamp-1">{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">{items.length}/12 photos · Hover to edit or remove</p>
        </>
      )}
    </div>
  )
}
