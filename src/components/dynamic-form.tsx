'use client'

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormItem {
  title: string;
  content: string;
}

interface DynamicFormProps {
  value?: FormItem[];
  onChange?: (items: FormItem[]) => void;
  disabled?: boolean;
}

export function DynamicForm({
  value = [],
  onChange,
  disabled = false
}: DynamicFormProps) {
  const [formItems, setFormItems] = useState<FormItem[]>(value || [{ title: '', content: '' }]);

  // Sync internal state with external value
  useEffect(() => {
    // Ensure value is an array before setting it
    if (Array.isArray(value)) {
      setFormItems(value);
    } else {
      // If value is not an array (e.g., null or undefined), reset to default
      setFormItems([{ title: '', content: '' }]);
    }
  }, [value]);

  const handleInputChange = (
    index: number,
    field: 'title' | 'content',
    newValue: string
  ) => {
    const updatedItems = [...formItems];
    updatedItems[index][field] = newValue;
    setFormItems(updatedItems);
    onChange?.(updatedItems);
  };

  const handleAddField = () => {
    const newItems = [...formItems, { title: '', content: '' }];
    setFormItems(newItems);
    onChange?.(newItems);
  };

  const handleRemoveField = (index: number) => {
    if (formItems.length <= 1) return;
    const updatedItems = formItems.filter((_, i) => i !== index);
    setFormItems(updatedItems);
    onChange?.(updatedItems);
  };

  return (
      formItems.length > 0 ?
        (
          <>
          <div className="w-full border rounded-md border-input">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 border-b font-medium text-sm text-muted-foreground">
              <div className="col-span-1">STT</div>
              <div className="col-span-4">Nội dung</div>
              <div className="col-span-6">Mô tả</div>
              <div className="col-span-1 text-right"></div>
            </div>

            {/* Table Body */}
            <div className="divide-y">
              {formItems.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "grid grid-cols-12 gap-4 px-4 py-3 items-center text-start",
                    "hover:bg-muted/30 transition-colors "
                  )}
                >
                  {/* STT Column */}
                  <div className="col-span-1 text-sm text-muted-foreground">
                    {index + 1}
                  </div>

                  {/* Nội dung Column */}
                  <div className="col-span-4">
                    <Input
                      placeholder="Nhập nội dung..."
                      value={item.title}
                      onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                      disabled={disabled}
                      className="h-8 border-0 bg-transparent focus-visible:ring-1"
                    />
                  </div>

                  {/* Mô tả Column */}
                  <div className="col-span-6">
                    <Input
                      placeholder="Nhập mô tả..."
                      value={item.content}
                      onChange={(e) => handleInputChange(index, 'content', e.target.value)}
                      disabled={disabled}
                      className="h-9 border-0 bg-transparent focus-visible:ring-1"
                    />
                  </div>

                  {/* Actions Column */}
                  {!disabled && (
                    <div className="col-span-1 flex justify-start">
                    {formItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveField(index)}
                        disabled={disabled}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    {formItems.length == (index + 1) && (
                      <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleAddField}
                      disabled={disabled}
                      className="h-8 w-8 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    )}
                  </div>
                  )}
                </div>
              ))}
              
            </div>
          </div>
        </>
        ) : (
          <>
          <div className="space-y-1">
                            <div className="px-3 py-2 rounded-md text-sm border">
                                —
                            </div>
                        </div>
          </>
        )
    
  );
}
