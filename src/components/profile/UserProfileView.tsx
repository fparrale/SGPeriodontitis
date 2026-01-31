import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, ShieldCheck, UserRound, Activity, User as UserIcon, KeyRound } from "lucide-react";
import { API_BASE } from "@/lib/config";
import { useTranslation } from "react-i18next";
import { UserUpdatePasswordDialog } from "../user/UserUpdatePasswordDialog";

type ApiResponse<T> = {
    status: number;
    message: string;
    data: T | null;
};

type UserProfile = {
    id: string;
    name: string;
    email: string;
    rol: string;
    status: string;
};

type StoredAuthUser = {
    id: string;
    name?: string;
    email?: string;
    rol?: string;
    status?: string;
};

export default function UserProfileView() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const storedUser = useMemo(() => {
        const raw = localStorage.getItem("auth_user");
        if (!raw) return null;
        try {
            return JSON.parse(raw) as StoredAuthUser;
        } catch {
            return null;
        }
    }, []);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!storedUser?.id) {
            navigate("/login", { replace: true });
            return;
        }

        let alive = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const url = `${API_BASE}/users/profile?userId=${encodeURIComponent(storedUser.id)}`;
                const res = await fetch(url, {
                    method: "GET",
                    headers: { Accept: "application/json" },
                });

                const resp = (await res.json()) as ApiResponse<UserProfile>;

                if (!alive) return;

                if (resp.status !== 200 || !resp.data) {
                    setError(resp.message || "No fue posible obtener los datos del perfil del usuario");
                    setLoading(false);
                    return;
                }

                setProfile(resp.data);

                setLoading(false);
            } catch {
                if (!alive) return;
                setError("No fue posible conectar con el servidor");
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [navigate, storedUser]);

    const name = profile?.name ?? storedUser?.name ?? "-—";
    const email = profile?.email ?? storedUser?.email ?? "-—";
    const rol = profile?.rol ?? storedUser?.rol ?? "—-";
    const status = profile?.status ?? storedUser?.status ?? "—-";

    return (
        <Card className="w-full shadow-xl border-t-4 border-sky-300">
            <CardHeader className="bg-gray-50 p-6 border-b border-gray-100">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <UserIcon className="w-6 h-6 text-sky-500" />
                        <CardTitle className="text-2xl font-bold text-gray-800">{t('profile.title')}</CardTitle>
                    </div>
                    {storedUser?.id && (
                        <UserUpdatePasswordDialog
                            userId={storedUser.id}
                            triggerComponent={
                                <Button className="bg-sky-500 hover:bg-sky-600">
                                    <KeyRound className="w-4 h-4 mr-2" />
                                    {t('users.updatePassword.title')}
                                </Button>
                            }
                        />
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {loading && <div className="text-gray-600">{t('profile.loading')}</div>}

                {!loading && error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar  */}
                        <div className="flex items-center justify-center">
                            <div className="w-28 h-28 rounded-full bg-sky-100 flex items-center justify-center border border-sky-200">
                                <UserIcon className="w-12 h-12 text-sky-600" />
                            </div>
                        </div>

                        {/* Datos del perfil */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div className="sm:col-span-2 flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                <UserRound className="w-5 h-5 text-sky-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 tracking-wide">{t('profile.name')}</p>
                                    <p className="text-base font-bold text-gray-800">{name}</p>
                                </div>
                            </div>

                            {/* Correo */}
                            <div className="sm:col-span-2 flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                <Mail className="w-5 h-5 text-sky-600 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-500 tracking-wide">{t('profile.email')}</p>
                                    <p className="text-gray-800 font-semibold break-words">{email}</p>
                                </div>
                            </div>

                            {/* Rol */}
                            <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                <ShieldCheck className="w-5 h-5 text-sky-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 tracking-wide">{t('profile.role')}</p>
                                    <Badge className="mt-1 w-fit bg-sky-500 hover:bg-sky-600 font-bold">
                                        {rol}
                                    </Badge>
                                </div>
                            </div>

                            {/* Estado */}
                            <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                <Activity className="w-5 h-5 text-sky-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 tracking-wide">{t('profile.status')}</p>
                                    <Badge variant="outline" className="mt-1 w-fit">
                                        {status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
