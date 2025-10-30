// src/features/asset/components/asset-cg-details.tsx
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Loader2,
    ChevronLeft,
} from "lucide-react";
import { env } from "@/config/env";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { getCgDetail } from "../api/get-cg";
import { usePreviewCg } from "../api/preview-cg";

// Get route API
const routeApi = getRouteApi("/_authenticated/assets/cg/details");

// Query keys
const cgQueryKeys = {
    detail: (assetId: string) => ["cg", "detail", assetId] as const,
};

// ==================== TYPES ====================

interface SceneFormData {
    sceneName: string;
    scenePath: string;
    previewPath: string;
    previewType: string;
    variables: Record<string, string>;
}

interface FormData {
    scenes: SceneFormData[];
}

// ==================== UTILITY FUNCTIONS ====================

const getMediaType = (url: string): "image" | "video" | "unknown" => {
    if (!url) return "unknown";

    const extension = url.split(".").pop()?.toLowerCase().split("?")[0];

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv", "m4v"];

    if (extension && imageExtensions.includes(extension)) {
        return "image";
    }
    if (extension && videoExtensions.includes(extension)) {
        return "video";
    }

    return "unknown";
};

const mediaTypes = [
    { label: "MP4", value: "mp4" },
    { label: "JPG", value: "jpg" },
    { label: "PNG", value: "png" },
    { label: "WEBM", value: "webm" },
];

// ==================== MAIN COMPONENT ====================

export function AssetCgDetailPage() {
    // Route params
    const search = routeApi.useSearch();

    const assetId = useMemo(() => {
        try {
            if (!search?.id) return null;

            const rawId = String(search.id);
            const decodedId = decodeURIComponent(rawId).replace(/^"|"$/g, "");

            return decodedId || null;
        } catch (error) {
            console.error("Error parsing asset ID from URL:", error);
            return null;
        }
    }, [search.id]);

    // React Query
    const {
        data: cgDetail,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: cgQueryKeys.detail(assetId as string),
        queryFn: () => getCgDetail(assetId as string),
        enabled: !!assetId,
        staleTime: 5 * 60 * 1000,
    });

    // Initialize form with React Hook Form
    const form = useForm<FormData>({
        defaultValues: {
            scenes: [],
        },
    });

    const { mutate: previewCg, isPending: isPreviewing } = usePreviewCg();

    // Load data into form when cgDetail is available
    useEffect(() => {
        if (cgDetail?.scenes && cgDetail.scenes.length > 0) {
            const formattedScenes = cgDetail.scenes.map((scene: any) => ({
                sceneName: scene.sceneName || "",
                scenePath: scene.scenePath || "",
                previewPath: scene.previewPath || "",
                previewType: scene.previewType || "png",
                variables: scene.variables || {},
            }));

            form.reset({ scenes: formattedScenes });
            toast.success(`Đã tải ${cgDetail.scenes.length} scene`);
        }
    }, [cgDetail, form]);

    useEffect(() => {
        if (isError && error) {
            toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu");
        }
    }, [isError, error]);

    // Video playback state
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    const [mediaLoadError, setMediaLoadError] = useState(false);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);

    // Current scene from form data
    const watchedScenes = form.watch("scenes");
    const currentScene = useMemo(() => {
        const scenes = watchedScenes;
        if (!scenes || scenes.length === 0) return null;
        return scenes[currentSceneIndex] || null;
    }, [watchedScenes, currentSceneIndex]);

    // const currentScene = useWatch({
    //     control: form.control,
    //     name: "scenes",
    // });

    // Detect media type
    const mediaType = currentScene?.previewPath 
    ? getMediaType(currentScene.previewPath) 
    : "unknown";

    // Handle back button
    const handleBack = useCallback(() => {
        window.history.back();
    }, []);

    // Handle form submission
    const onSubmit = (data: FormData) => {
        const currentSceneData = data.scenes[currentSceneIndex];
        if (!currentSceneData) {
            toast.error("No scene data available to preview.");
            return;
        }

        // Comprehensive logging
        console.group('🎬 Form Submission');
        console.log('Current Scene Index:', currentSceneIndex);
        console.log('Current Scene Data:', currentSceneData);
        console.table({
            'Scene Name': currentSceneData.sceneName,
            'Scene Path': currentSceneData.scenePath,
            'Preview Path': currentSceneData.previewPath,
            'Preview Type': currentSceneData.previewType,
        });
        console.log('Variables:', currentSceneData.variables);
        console.groupEnd();

        previewCg(currentSceneData, {
            onSuccess: (response) => {
                // Update the form with the new previewPath if successful
                if (response.success && response.previewPath) {
                    // Update the current scene's previewPath in the form
                    form.setValue(
                        `scenes.${currentSceneIndex}.previewPath`,
                        response.previewPath,
                        { shouldDirty: true, shouldValidate: true }
                    );
                    cacheBustRef.current = Date.now();
                }

            },
            onError: (error) => {
                console.error('💥 Preview failed:', error);
            }
        });
    };

    // Reset playback when scene changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
        setMediaLoadError(false);
    }, [currentSceneIndex]);

    // ==================== RENDER HELPERS ====================



    const renderInfoSection = useCallback(() => {
        if (!cgDetail) return null;

        return (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin</h3>

                {/* Basic Info */}
                <div className="space-y-4">
                    {cgDetail.asset.fields.map((field: any) => (
                        <div
                            key={field.fieldName || field.id}
                            className="flex items-start space-x-3 w-full"
                        >
                            <p className="text-xs font-medium w-24 flex-shrink-0">
                                {field.displayName}
                            </p>
                            <p className="flex-1">{field.value}</p>
                        </div>
                    ))}

                    <div className="flex items-start space-x-3 w-full">
                        <p className="text-xs font-medium w-24 flex-shrink-0">
                            Mã đồ họa
                        </p>
                        <p className="">{cgDetail.asset.name}</p>
                    </div>
                </div>

                {/* Scene Variables Form */}
                {currentScene && (
                    <FormProvider {...form}>
                        <form
                            id={`scene-form-${currentSceneIndex}`}
                            className="space-y-4"
                            key={`scene-form-${currentSceneIndex}`}
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <div className="flex mb-3 border-b pb-2 place-items-center gap-2 justify-between">
                                <h4 className="text-sm font-semibold ">
                                Scene {currentSceneIndex + 1}
                                </h4>
                            </div>

                            {/* Scene Name */}
                            <FormField
                                control={form.control}
                                name={`scenes.${currentSceneIndex}.sceneName`}
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel className="text-sm font-medium min-w-[100px]">
                                                Scene name:
                                            </FormLabel>
                                            <FormControl>
                                                <input
                                                    {...field}
                                                    type="text"
                                                    className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Scene Path */}
                            <FormField
                                control={form.control}
                                name={`scenes.${currentSceneIndex}.scenePath`}
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel className="text-sm font-medium min-w-[100px]">
                                                Scene path:
                                            </FormLabel>
                                            <FormControl>
                                                <input
                                                    {...field}
                                                    type="text"
                                                    className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Preview Type */}
                            <FormField
                                control={form.control}
                                name={`scenes.${currentSceneIndex}.previewType`}
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel className="text-sm font-medium min-w-[100px]">
                                                Loại media:
                                            </FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                >
                                                    {mediaTypes.map((type) => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dynamic Variables */}
                            {currentScene.variables &&
                                Object.entries(currentScene.variables).map(
                                    ([key], idx) => (
                                        <FormField
                                            key={`${key}-${idx}`}
                                            control={form.control}
                                            name={`scenes.${currentSceneIndex}.variables.${key}`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <FormLabel className="text-sm font-medium min-w-[100px]">
                                                            {key}:
                                                        </FormLabel>
                                                        <FormControl>
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                                )}
                        </form>
                    </FormProvider>
                )}
            </div>
        );
    }, [cgDetail, currentSceneIndex, currentScene, form]);;

    const cacheBustRef = useRef<number>(0);
    // Render media content (image or video)
    const renderMediaContent = () => {
        if (!currentScene?.previewPath) {
            return (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Không có nội dung</p>
                </div>
            );
        }
        const mediaUrl = `${env.apiUrl}${currentScene.previewPath}${cacheBustRef.current ? `?t=${cacheBustRef.current}` : ''}`;

        if (mediaLoadError) {
            return (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center space-y-2">
                        <p className="text-sm">File không tồn tại</p>
                    </div>
                </div>
            );
        }

        if (mediaType === "image") {
            return (
                <img
                    src={mediaUrl}
                    alt={currentScene.sceneName}
                    className="h-full object-contain"
                    onError={() => {
                        console.error("Image failed to load");
                        toast.error("Không thể tải hình ảnh");
                        setMediaLoadError(true);
                    }}
                />
            );
        }

        if (mediaType === "video") {
            return (
                <video
                    src={mediaUrl}
                    controls
                    className="max-w-full max-h-full object-contain"
                    onError={() => {
                        console.error("Video failed to load");
                        toast.error("Không thể tải video");
                        setMediaLoadError(true);
                    }}
                >
                    Trình duyệt không hỗ trợ video
                </video>
            );
        }

        return (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Định dạng không được hỗ trợ</p>
            </div>
        );
    };

    // ==================== LOADING & ERROR STATES ====================

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                        Đang tải thông tin CG...
                    </span>
                </div>
            </div>
        );
    }

    if (isError || !cgDetail) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                        <p className="text-sm text-destructive mb-4">
                            {error instanceof Error
                                ? error.message
                                : "Không tìm thấy dữ liệu CG"}
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={() => refetch()}>
                                Thử lại
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleBack}>
                                Quay lại
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const scenes = form.watch("scenes");

    // ==================== MAIN RENDER ====================

    return (
        <div className="h-full w-full flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="hover:bg-muted"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">Chi tiết đồ họa</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden h-full">
                {/* Left Side - Media Player */}
                <div className="flex-1 flex flex-col p-6 bg-muted/30 overflow-y-auto w-7/10">
                    {/* Media Container */}
                    <div className="flex-1 bg-black place-items-center-safe rounded-lg overflow-hidden relative mb-6 min-h-[400px]">
                        {renderMediaContent()}
                    </div>

                    {/* Scene Info */}
                    {scenes && scenes.length > 0 && (
                        <div className="text-center mt-4">
                            <p className="text-sm text-muted-foreground">
                                Scene {currentSceneIndex + 1} / {scenes.length}
                                {currentScene && (
                                    <span className="ml-2 font-medium text-foreground">
                                        {currentScene.sceneName}
                                    </span>
                                )}
                                <span className="ml-2 text-xs px-2 py-1 bg-muted rounded">
                                    {currentScene?.previewType}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Scene Thumbnails */}
                    {scenes && scenes.length > 1 && (
                        <div className="mt-6">
                            <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth">
                                {scenes.map((scene, index) => (
                                    <button
                                        key={`scene-${index}`}
                                        onClick={() => {
                                            setCurrentSceneIndex(index);
                                        }}
                                        className={cn(
                                            "flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border-2 transition-all",
                                            currentSceneIndex === index
                                                ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                                                : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        
                                        <img
                                            src={`${env.apiUrl}${scene.previewPath}${cacheBustRef.current ? `?t=${cacheBustRef.current}` : ''}`}
                                            alt={scene.sceneName}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side - Info Panel */}
                <div className="w-3/10 border-l bg-card overflow-y-auto h-full">
                    <div className="p-6 space-y-6 h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            {renderInfoSection()}
                        </div>

                        <div className="flex-shrink-0">
                        <Button
                                className="w-full"
                                size="lg"
                                type="submit"
                                form={`scene-form-${currentSceneIndex}`}
                                disabled={isPreviewing}
                            >
                                {isPreviewing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Kiểm tra CG
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
