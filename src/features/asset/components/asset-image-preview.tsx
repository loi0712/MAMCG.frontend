// components/assets/asset-image-preview.tsx
import { useState } from 'react'

export function AssetImagePreview({ 
    src, 
    alt, 
    onRemove,
    className = '' 
}: { 
    src: string
    alt: string
    onRemove?: () => void
    className?: string 
}) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    return (
        <div className={`relative ${className}`}>
            {!imageLoaded && !imageError && (
                <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md border">
                    <span className="text-gray-500 text-sm">Đang tải...</span>
                </div>
            )}
            
            {imageError && (
                <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md border">
                    <span className="text-gray-500 text-sm">Không thể tải ảnh</span>
                </div>
            )}

            <img
                src={src}
                alt={alt}
                className={`max-w-full h-32 object-cover rounded-md border ${!imageLoaded ? 'hidden' : ''}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
            />
            
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="Xóa hình ảnh"
                >
                    ×
                </button>
            )}
        </div>
    )
}
