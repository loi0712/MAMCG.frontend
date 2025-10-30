export type TField = {
    id: string;
    name: string;
}

export type TQueryFieldsKeys = {
    pageNumber?: string,
    pageSize?: boolean,
    searchTerm?: string,
    includeSystemField: boolean
}

export type GetFieldsProps = {
    queryKey: [string, TQueryFieldsKeys];
};

export type TFieldsResponse = {fields: TField[], totalCount: number};