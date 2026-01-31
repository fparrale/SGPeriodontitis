
export interface GroupByCodeResponse {
    status: number;
    message: string;
    data: Group;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    code: string;
    created_on: string;
    status: string;
    created_by: string;
}