import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DynamicField, getFieldKey, getSelectItems } from "../api/create"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SelectDropdown } from "@/components/select-dropdown"

export function DynamicFieldRenderer({
    field,
    control
}: {
    field: DynamicField
    control: any
}) {
    const fieldKey = getFieldKey(field.id)
    const selectItems = getSelectItems(field.dataType.datasource)

    switch (field.dataType.name) {
        case 'singleline':
            return (
                <FormField
                    control={control}
                    name={fieldKey}
                    render={({ field: formField }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>
                                {field.displayName}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={`Nhập ${field.displayName.toLowerCase()}`}
                                    className='col-span-4'
                                    autoComplete='off'
                                    {...formField}
                                />
                            </FormControl>
                            <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                    )}
                />
            )

        case 'multiline':
            return (
                <FormField
                    control={control}
                    name={fieldKey}
                    render={({ field: formField }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>
                                {field.displayName}
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={`Nhập ${field.displayName.toLowerCase()}`}
                                    className='col-span-4 min-h-[60px]'
                                    {...formField}
                                />
                            </FormControl>
                            <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                    )}
                />
            )

        case 'category':
        case 'project':
        case 'assettype': // Add handling for new field type
            return (
                <FormField
                    control={control}
                    name={fieldKey}
                    render={({ field: formField }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>
                                {field.displayName}
                            </FormLabel>
                            <SelectDropdown
                                defaultValue={formField.value || ''}
                                onValueChange={formField.onChange}
                                placeholder={`Chọn ${field.displayName.toLowerCase()}`}
                                className='col-span-4'
                                items={selectItems}
                            />
                            <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                    )}
                />
            )

        default:
            return null
    }
}
