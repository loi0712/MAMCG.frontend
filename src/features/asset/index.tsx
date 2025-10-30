import { createFileRoute, getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { Main } from "@/components/layout/Main"
import { AssetsTable } from "./components/assets-table"
import { Loader2, FolderOpen, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAssetsPaginated } from "./api/get-assets"
import { AssetsProvider } from "./components/assets-provider"
import { useFolderDetailsRaw } from "@/components/layout/api/get-folder-details"
import { AssetsDialogs } from "./components/assets-dialogs"

export const Route = createFileRoute('/_authenticated/assets/')({
    component: Assets,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            folderId: (search.folderId as string) || undefined,
            page: search.page ? Number(search.page) : undefined,
            pageSize: Number(search.pageSize) || 10,
            name: (search.name as string) || undefined,
            searchTerm: typeof search.searchTerm === 'string' ? (search.searchTerm as string) : undefined,
        }
    },
})

const route = getRouteApi("/_authenticated/assets/")

function AssetsContent() {
    const search = route.useSearch()
    const navigate = route.useNavigate()

    const foldersPath = useFolderDetailsRaw('0', true);
    const parentPath =
        foldersPath.data?.parentFolders
            ?.find((folder) => folder.id.toString() === search.folderId)
            ?.name ?? '';

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching
    } = useAssetsPaginated({
        pageNumber: search.page,
        pageSize: search.pageSize,
        folderId: search.folderId ? Number.parseInt(search.folderId) : 0,
        searchTerm: search.searchTerm
    })

    if (isLoading || isRefetching) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Đang tải danh sách thiết kế...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <Alert variant="destructive" className="max-w-md mx-auto h-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                    <span>Lỗi khi tải dữ liệu: {error?.message || 'Không xác định'}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                    >
                        {isRefetching ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            'Thử lại'
                        )}
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }

    if (!search.folderId) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground">
                <FolderOpen className="h-12 w-12" />
                <p>Vui lòng chọn một thư mục để xem thiết kế</p>
                <Button
                    variant="outline"
                    onClick={() => navigate({ search: { ...search, folderId: '0' } })}
                >
                    Chọn thư mục gốc
                </Button>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground">
                <FolderOpen className="h-12 w-12" />
                <p>Không tìm thấy thiết kế trong thư mục này</p>
            </div>
        )
    }

    return (
        <div className="h-fit">
            {/* Assets table */}
            <div className="flex-1 px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12 h-full">
                <AssetsTable
                    folderPath={parentPath}
                    data={data}
                    search={search}
                    navigate={navigate}
                />
            </div>
        </div>
    )
}

export function Assets() {
    return (
        <AssetsProvider>
            <Main>
                <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                }>
                    <AssetsContent />
                </Suspense>
            </Main>
            <AssetsDialogs />
        </AssetsProvider>
    )
}
