import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FileIcon, X, Upload } from 'lucide-react';

interface FileUploadSectionProps {
    selectedFiles: File[];
    onFilesChange: (files: File[]) => void;
}

export function FileUploadSection({
    selectedFiles,
    onFilesChange,
}: FileUploadSectionProps) {
    const [showFileUpload, setShowFileUpload] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            onFilesChange([...selectedFiles, ...fileArray]);
            // Reset input value to allow selecting the same file again
            event.target.value = '';
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        onFilesChange(selectedFiles.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center space-x-3">
                <Checkbox
                    id="file-upload-checkbox"
                    checked={showFileUpload}
                    onCheckedChange={(checked) => setShowFileUpload(checked as boolean)}
                />
                <label
                    htmlFor="file-upload-checkbox"
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Đính kèm file
                </label>
            </div>

            {showFileUpload && (
                <div className="space-y-3">
                    {/* File Upload Area */}
                    <div className="flex items-center justify-center w-full">
                        <label
                            htmlFor="file-upload-input"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/60 transition-colors"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Nhấn để tải file</span> hoặc kéo thả
                                </p>
                                <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, XLS (MAX. 10MB)</p>
                            </div>
                            <Input
                                id="file-upload-input"
                                type="file"
                                className="hidden"
                                multiple
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                            />
                        </label>
                    </div>

                    {/* Display Selected Files */}
                    {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Đã chọn {selectedFiles.length} file
                            </p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md group hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <FileIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate" title={file.name}>
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveFile(index)}
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
