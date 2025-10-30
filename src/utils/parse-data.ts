import { DataSource } from "@/features/asset/api/create";

/**
 * Parse datasource JSON string to array of DataSource objects
 */
export const parseDatasource = (datasource: string | null): DataSource[] => {
    if (!datasource) return [];
    
    try {
        return JSON.parse(datasource);
    } catch (error) {
        console.error('Error parsing datasource:', error);
        return [];
    }
};

/**
 * Get select items for dropdown from datasource
 */
export const getSelectItems = (datasource: string | null) => {
    const options = parseDatasource(datasource);
    return options.map((item) => ({
        label: item.Name,
        value: item.Id,
    }));
};