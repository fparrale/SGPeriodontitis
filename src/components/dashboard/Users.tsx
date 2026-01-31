import { Ban, Calendar, Pencil, PlusCircle, User, Zap, KeyRound, Search, Loader2, Activity, Mail, ShieldCheck, Settings } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useEffect, useState } from "react";
import type { UserResponse } from "@/types/userType";
import { UserUpsertDialog } from "../user/UserUpsertDialog";
import { UserResetPasswordDialog } from "../user/UserResetPasswordDialog";
import { GenericDeleteConfirmationDialog } from "../common/DeleteDialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { API_BASE } from "@/lib/config";


export interface AppUser {
    id: number;
    name: string;
    email: string;
    role_id: '1' | '2' | '3';
    status_id: '1' | '2';
    created_on: string;
}


const DashboardUser = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<UserResponse | null>(null);
    const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
    const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
    const [searchText, setSearchText] = useState<string>('');
    const [debouncedQ, setDebouncedQ] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(true);

    const USER_STATUS = [
        { id: 'active', name: t('users.status.active') },
        { id: 'inactive', name: t('users.status.inactive') },
        { id: 'pending', name: t('users.status.pending') },
        { id: 'deleted', name: t('users.status.deleted') },
    ]

    const fetchUsers = async () => {
        setIsSearching(true);
        const params = new URLSearchParams();

        // agregar filtro de estado si existe
        const statusToSend = userStatusFilter !== "all" ? userStatusFilter : "";
        if (statusToSend) params.set("status", statusToSend);

        // agregar texto de busqueda si existe
        const q = (debouncedQ ?? searchText).trim();
        if (q) params.set("q", q);

        const queryString = params.toString();
        const url = `${API_BASE}/users${queryString ? `?${queryString}` : ""}`;

        await fetch(url)
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching user data:', error))
            .finally(() => {
                setLoadingUsers(false);
                setIsSearching(false);
            });
    }

    useEffect(() => {
        fetchUsers();

    }, [userStatusFilter, debouncedQ]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQ(searchText.trim()), 800);
        return () => clearTimeout(t);
    }, [searchText]);


    const deleteUser = async (id: string | number): Promise<void> => {
        const API_URL = `${API_BASE}/users/${id}`;

        const response = await fetch(API_URL, {
            method: 'DELETE',

        });

        if (!response.ok) {

            throw new Error(t('users.deleteError'));
        }

        toast.success(t('users.deleteSuccess'));
    };


    // Función de mapeo de Role ID a Badge
    const getRoleBadge = (rol: string) => {
        switch (rol) {
            case 'admin':
                return <Badge className="bg-sky-500 hover:bg-sky-600 font-bold">{t('users.roles.admin')}</Badge>;
            case 'participant':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">{t('users.roles.participant')}</Badge>;
            case 'dev':
                return <Badge variant="secondary" className="text-sky-600 border-sky-300">{t('users.roles.dev')}</Badge>;
            case 'superadmin':
                return <Badge variant="secondary" className="text-purple-500 hover:bg-purple-600 font-bold">{t('users.roles.superadmin')}</Badge>;
            default:
                return <Badge variant="outline">N/A</Badge>;
        }
    };

    //  mapeo de Status ID a Badge
    const getStatusBadge = (statusId: string) => {
        switch (statusId) {
            case 'active':
                return (
                    <Badge className="bg-green-500/10 text-green-700 border border-green-300 hover:bg-green-500/20">
                        <Zap className="w-3 h-3 mr-1" /> {t('users.status.active')}
                    </Badge>
                );
            case 'deleted':
                return (
                    <Badge className="bg-red-500/10 text-red-700 border border-red-300 hover:bg-red-500/20">
                        <Ban className="w-3 h-3 mr-1" /> {t('users.status.deleted')}
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge className="bg-red-500/10 text-red-700 border border-red-300 hover:bg-red-500/20">
                        <Ban className="w-3 h-3 mr-1" /> {t('users.status.inactive')}
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-500/10 text-yellow-700 border border-yellow-300 hover:bg-yellow-500/20">
                        <Ban className="w-3 h-3 mr-1" /> {t('users.status.pending')}
                    </Badge>
                );
            default:
                return <Badge variant="outline">Desconocido</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };


    if (loadingUsers) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-600">{t('users.loading')}</p>
            </div>
        );
    }
    // para refrescar data después de crear/editar/borrar un usuario
    const handleDataRefresh = () => {
        fetchUsers();

    };

    return (
        <Card className="w-full shadow-xl h-[83vh] overflow-auto border-t-4 border-sky-300">

            <CardHeader className="bg-gray-50 p-6 border-b border-gray-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-sky-500" />
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        {t('users.title')}
                    </CardTitle>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder={t('users.searchPlaceholder')}
                            maxLength={35}
                            className="w-[280px] pl-10 border-sky-200 focus:border-sky-500"
                        />
                        {isSearching && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-sky-500" />}
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                                        <SelectTrigger className="border-sky-200 focus:border-sky-500">
                                            <SelectValue>
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-gray-500" />
                                                    <span>{userStatusFilter === "all" ? t('users.all') : USER_STATUS?.find(s => s.id === userStatusFilter)?.name || t('users.all')}</span>
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>

                                        <SelectContent>
                                            {/* OPCIÓN TODOS */}
                                            <SelectItem value="all">
                                                {t('users.all')}
                                            </SelectItem>

                                            {USER_STATUS?.map((g) => (
                                                <SelectItem key={g.id} value={g.id}>
                                                    {g.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('users.filterStatus')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Botón Nuevo Usuario (Modo Crear) */}
                    <UserUpsertDialog
                        onSuccess={handleDataRefresh}
                        triggerComponent={
                            <Button className="bg-sky-500 hover:bg-sky-600 font-semibold shadow-md shadow-sky-300/40">
                                <PlusCircle className="w-4 h-4" /> {t('users.createNew')}
                            </Button>
                        }
                    />
                </div>
            </CardHeader>

            <CardContent className="flex flex-col px-5 overflow-y-auto flex-1">
                <Table>
                    <TableHeader className="bg-sky-100/90 sticky top-0 z-10">
                        <TableRow>
                            <TableHead className="font-bold text-gray-800">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-sky-500" />
                                    <span>{t('users.table.name')}</span>
                                </div>
                            </TableHead>
                            <TableHead className="font-bold text-gray-800">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-sky-500" />
                                    <span>{t('users.table.email')}</span>
                                </div>
                            </TableHead>
                            <TableHead className="font-bold text-gray-800">
                                <div className="flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-sky-500" />
                                    <span>{t('users.table.role')}</span>
                                </div>
                            </TableHead>
                            <TableHead className="font-bold text-gray-800">
                                <div className="flex items-center justify-center gap-2">
                                    <Activity className="w-4 h-4 text-sky-500" />
                                    <span>{t('users.table.status')}</span>
                                </div>
                            </TableHead>
                            <TableHead className="font-bold text-gray-800 flex justify-center items-center gap-2">
                                <Calendar className="w-4 h-4 text-sky-500" />
                                <span>{t('users.table.createdOn')}</span>
                            </TableHead>
                            <TableHead className="w-[100px] text-center font-bold text-gray-800">
                                <div className="flex items-center justify-center gap-2">
                                    <Settings className="w-4 h-4 text-sky-500" />
                                    <span>{t('users.table.actions')}</span>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users && users.data.length > 0 ? users.data.map((user) => (
                            <TableRow key={user.id} className="hover:bg-sky-50/50 transition-colors">

                                {/* Nombre */}
                                <TableCell className="font-semibold text-gray-700">{user.name}</TableCell>

                                {/* Email */}
                                <TableCell className="text-gray-600 flex items-center gap-1">
                                    {user.email}
                                </TableCell>

                                {/* Role ID (con Badge) */}
                                <TableCell className="text-center">{getRoleBadge(user.rol)}</TableCell>

                                {/* Status ID (con Badge) */}
                                <TableCell className="text-center">{getStatusBadge(user.status)}</TableCell>

                                {/* Created On (Formateado) */}
                                <TableCell className="text-center text-gray-600">{formatDate(user.created_on)}</TableCell>

                                {/* Acciones */}
                                <TableCell className="text-center flex gap-1 justify-end">
                                    <UserResetPasswordDialog
                                        userId={user.id}
                                        onSuccess={handleDataRefresh}
                                        triggerComponent={
                                            <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-100">
                                                <KeyRound className="w-4 h-4" />
                                            </Button>
                                        }
                                    />
                                    <UserUpsertDialog
                                        onSuccess={handleDataRefresh}
                                        userId={user.id}
                                        triggerComponent={
                                            <Button variant="ghost" size="sm" className="text-sky-500 hover:bg-sky-100">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        }
                                    />
                                    {/* Botón de Borrar - con modal generico */}
                                    <GenericDeleteConfirmationDialog
                                        itemId={user.id}
                                        itemDescription={t('genericDialogs.delete.description', {
                                            itemType: t('genericDialogs.delete.itemTypes.user'),
                                            itemName: user.name
                                        })}
                                        onConfirm={() => deleteUser(user.id)}
                                        onSuccess={handleDataRefresh}
                                    />
                                </TableCell>

                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                        <Ban className="w-12 h-12 text-gray-400" />
                                        <p>{t('users.noResults')}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default DashboardUser;