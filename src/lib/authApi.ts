import { API_BASE } from "@/lib/config";

export type ApiResponse<T> = {
    status: number;
    message: string;
    data: T | null;
};

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    rol?: string;
    status?: string;
};



export async function loginApi(email: string, password: string): Promise<ApiResponse<AuthUser>> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),

    });

    return res.json();
}

export async function registerApi(
    name: string,
    email: string,
    password: string
): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        //future
    });

    return res.json();
}