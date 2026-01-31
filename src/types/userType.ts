export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role_id: string;
    status_id: string;
    created_on: string;

}

export interface UserResponse {
    success: boolean;
    data: [{
        id: number;
        name: string;
        email: string;
        password: string;
        rol: string;
        status: string;
        created_on: string;
    }
]

}
