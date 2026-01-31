import { API_BASE } from "@/lib/config";

export type ApiResponse<T> = {
    status: number;
    message: string;
    data: T | null;
};

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    rol: string;
    status: string;
};

export async function getProfileApi(userId: string): Promise<ApiResponse<UserProfile>> {
    const res = await fetch(`${API_BASE}/users/profile?userId=${encodeURIComponent(userId)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
    });

    return res.json();
}
