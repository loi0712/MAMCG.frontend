// src/routes/_authenticated/assets/details.tsx
import { AssetCgDetailPage } from '@/features/asset/components/asset-cg-details'
import { createFileRoute } from '@tanstack/react-router'

// Định nghĩa search params để nhận assetId
type AssetDetailsSearchParams = {
  id: string
}

export const Route = createFileRoute('/_authenticated/assets/cg/details')({
    validateSearch: (search: Record<string, unknown>): AssetDetailsSearchParams => {
        return {
            id: String(search.id || '')
        }
    },
    component: AssetCgDetailPage,
    pendingComponent: () => (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
            </div>
        </div>
    ),
    errorComponent: ({ error }) => (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center space-y-4">
                <p className="text-sm text-red-600">{error.message}</p>
                <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    onClick={() => window.location.reload()}
                >
                    Thử lại
                </button>
            </div>
        </div>
    )
})
