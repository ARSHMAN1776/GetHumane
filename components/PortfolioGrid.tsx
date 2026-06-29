interface PortfolioItem {
  id: string
  image_url: string
  caption: string | null
}

interface Props {
  items: PortfolioItem[]
}

export default function PortfolioGrid({ items }: Props) {
  if (!items.length) return null

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Portfolio</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map(item => (
          <div
            key={item.id}
            className="group relative rounded-xl overflow-hidden bg-gray-100"
            style={{ aspectRatio: '1' }}
          >
            <img
              src={item.image_url}
              alt={item.caption ?? 'Portfolio photo'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium line-clamp-2 leading-snug">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
