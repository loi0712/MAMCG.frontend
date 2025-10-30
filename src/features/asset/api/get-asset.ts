import { apiUrls } from "@/api/config/endpoints"
import { axios } from "@/shared/lib/axios"

// TypeScript interfaces for API response
interface DataType {
    id: number
    name: string
    datasource: string | null
}

interface Field {
    id: number
    fieldName: string
    displayName: string
    dataType: DataType
    isRequired: boolean
    editable: boolean
    value: string
}

interface Panel {
    id: number
    panelName: string
    description: string | null
    visibilityRules: string | null
    fields: Field[]
}

interface WorkfowAction {
    id: string
    name: string
    color: string
    requireUpload: boolean
}

export interface WorkflowHistory {
    id: number
    status: string
    color: string
    assignedBy: string
    assignedTo: string
    action: string
    actionTime: string
    deadline: string | null
    comment: string
}

interface WorkflowItem {
    id: number
    histories: WorkflowHistory[]
    actions: WorkfowAction[]
}

interface Asset {
    id: number
    name: string
    filePath: string
    extension: string
    size: number
    isApproved: boolean
    createdAt: string
    modifiedAt: string
    workflowItem: WorkflowItem
}

export interface AssetDetailResponse {
    asset: Asset
    panels: Panel[]
}

// Parse datasource JSON string to options array
// Based on your JSON structure: [{"Id":"1","Name":"Bar 2 dòng"},...]
const parseDatasource = (datasource: string | null): Array<{ Id: string, Name: string }> => {
    if (!datasource) return []

    try {
        const parsed = JSON.parse(datasource)
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        console.error('Error parsing datasource:', error)
        return []
    }
}

// Get display value from datasource
// Fixed to match the actual JSON structure from your API
export const getDisplayValue = (value: string, datasource: string | null): string => {
    if (!value || !datasource) return value

    const options = parseDatasource(datasource)
    // Match using 'Id' field (capital I) from your JSON structure
    const option = options.find(opt => opt.Id === value)
    return option?.Name || value
}

// API function to fetch asset details
export const fetchAssetDetail = async (assetId: string): Promise<AssetDetailResponse> => {
    try {
        // Fixed: Remove redundant method and headers from axios.get
        const response = await axios.get<AssetDetailResponse>(apiUrls.asset.details(assetId))

        return response.data
    } catch (error) {
        console.error('Error fetching asset detail:', error)
        throw error
    }
}

// API function to save asset changes
export const saveAssetChanges = async (
    assetId: string,
    changes: Record<string, string>,
    action: string
): Promise<void> => {
    try {
        // Use axios for consistency
        await axios.put(apiUrls.asset.update(assetId), {
            fields: changes
        }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
        })
    } catch (error) {
        console.error(`Error ${action} asset:`, error)
        throw error
    }
}

// Export types for use in components
export type {
    Asset,
    Panel,
    Field,
    DataType,
    WorkflowItem
}

// Helper function to get field value by name from panels
export const getFieldValue = (panels: Panel[], fieldName: string): string => {
    for (const panel of panels) {
        const field = panel.fields.find(f => f.fieldName === fieldName)
        if (field) {
            return field.value
        }
    }
    return ''
}

// Helper function to get field display value
export const getFieldDisplayValue = (panels: Panel[], fieldName: string): string => {
    for (const panel of panels) {
        const field = panel.fields.find(f => f.fieldName === fieldName)
        if (field) {
            return getDisplayValue(field.value, field.dataType.datasource)
        }
    }
    return ''
}

// Helper function to get all editable fields from panels
export const getEditableFields = (panels: Panel[]): Field[] => {
    return panels.flatMap(panel =>
        panel.fields.filter(field => field.editable)
    )
}

// Helper function to validate required fields
export const validateRequiredFields = (
    panels: Panel[],
    fieldValues: Record<string, string>
): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = []

    panels.forEach(panel => {
        panel.fields.forEach(field => {
            if (field.isRequired && field.editable) {
                const value = fieldValues[field.fieldName] || field.value
                if (!value || value.trim() === '') {
                    missingFields.push(field.displayName)
                }
            }
        })
    })

    return {
        isValid: missingFields.length === 0,
        missingFields
    }
}
