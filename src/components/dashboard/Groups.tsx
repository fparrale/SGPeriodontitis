import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChevronDown, ChevronUp, Users, FileSearchCorner, Plus, Edit, Search, Copy, Check } from "lucide-react";
import { ChartBarDecreasing } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect, useState, useCallback } from "react";
import GameGroupUpsertDialog from "../group/GroupUpsertDialog";
import { GenericDeleteConfirmationDialog } from "../common/DeleteDialog";
import GroupQuestionDialog from "../group/GroupQuestionDialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { API_BASE } from "@/lib/config";

export interface GameGroup {
    id: string;
    name: string;
    description: string | null;
    created_on: string;
    code: string;
    status: 'active' | 'inactive' | 'archived' | string; // tipo de estado
}

type FetchResponse = {
    message: string;
    status: number;
    data?: GameGroup[];
};

const DashboardGroups = () => {
    const { t } = useTranslation();
    const [groups, setGroups] = useState<FetchResponse | null>(null);
    const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const [openGroupId, setOpenGroupId] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // alternar la visibilidad de la descripción del grupo
    const handleToggle = (id: string) => {
        setOpenGroupId(openGroupId === id ? null : id);
    };

    // copiar código al portapapeles
    const copyCodeToClipboard = async (code: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            toast.success(t('groups.codeCopied', 'Código copiado al portapapeles'));
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            toast.error(t('groups.copyError', 'Error al copiar código'));
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // mapear el estado del grupo
    const getStatusLabel = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'active':
                return t('common.active');
            case 'inactive':
                return t('common.inactive');
            default:
                return t('common.unknown', 'Desconocido');
        }
    };

    const deleteGroup = async (id: string): Promise<void> => {
        const API_URL = `${API_BASE}/groups/delete/${id}`;

        const response = await fetch(API_URL, {
            method: 'PUT',

        });

        const data = await response.json();

        if (!response.ok || data.success === false) {

            throw new Error(t('groups.deleteError'));
        }

        toast.success(t('groups.deleteSuccess'));
        console.log('Delete response data:', data);

    };

    // Callback para recargar los datos
    const fetchGroups = useCallback(async () => {
        setLoadingGroups(true);
        try {
            // URL de la API 
            const response = await fetch(`${API_BASE}/groups`);
            const data = await response.json();

            setGroups(data);

        } catch (error) {
            console.error('Error fetching game groups:', error);

        } finally {
            setLoadingGroups(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, []);

    const searchGroups = useCallback(async (query: string, status: string) => {
        setIsSearching(true);
        try {
            let url = `${API_BASE}/groups/search?`;

            // Agregar parámetros a la URL
            const params = new URLSearchParams();
            if (query.trim()) {
                params.append('q', query);
            }
            if (status !== 'all') {
                params.append('status', status);
            }

            url += params.toString();

            const response = await fetch(url);
            const data = await response.json();
            setGroups(data);
        } catch (error) {
            console.error('Error searching groups:', error);
            toast.error(t('groups.searchError', 'Error al buscar grupos'));
        } finally {
            setIsSearching(false);
        }
    }, [t]);

    // realizar búsqueda con debounce
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            searchGroups(searchQuery, statusFilter);
        }, 800); // Espera 800ms después de que el usuario deja de escribir

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, statusFilter, searchGroups]);


    console.log('Groups data:', groups);
    if (loadingGroups && !groups) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-600">{t('groups.loading')}</p>
            </div>
        );
    }
    // Extrae los códigos existentes
    const existingCodes = (groups?.data ?? [])
        .map((g) => g.code)
        .filter(Boolean)
        .map((code) => ({ codigo: code }));

    return (
        <Card className="w-full h-[81vh] shadow-xl border-t-4 border-sky-300">

            {/* --- Card Header (Título y Botón de Acción) --- */}
            <CardHeader className="bg-gray-50 p-6 border-b border-gray-100">
                <div className="flex flex-row items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-sky-500" />
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            {t('groups.title')}
                        </CardTitle>
                    </div>
                    <GameGroupUpsertDialog onSuccess={fetchGroups} existingCodes={existingCodes} />
                </div>

                {/* Barra de Búsqueda y Filtros */}
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder={t('groups.searchPlaceholder', 'Buscar por nombre, descripción o código de acceso...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-9 border-sky-200 focus:border-sky-500"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Selector de Estado */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] h-10 border-sky-200 focus:border-sky-500">
                            <SelectValue placeholder={t('groups.filterByStatus', 'Filtrar por estado')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('common.all')}</SelectItem>
                            <SelectItem value="active">{t('common.active')}</SelectItem>
                            <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            {/* --- Card Content (Lista de Grupos) --- */}
            <CardContent className="p-0 h-96 overflow-y-auto">

                <div className="divide-y divide-gray-100">
                    {groups?.data && groups.data.length > 0 ? (
                        groups.data.map((group) => {
                            const isOpen = openGroupId === group.id;
                            const isDescriptionVisible = group.description && group.description.trim() !== "";
                            return (
                                <div key={group.id} className="w-full">
                                    {/* Fila del Título (Clickable Header) */}
                                    <div
                                        className={`flex items-center cursor-pointer justify-between p-4 transition-colors duration-200 ${isOpen ? 'bg-sky-50/70' : 'hover:bg-sky-50'} `}
                                    >
                                        <div
                                            className="flex items-center gap-4 flex-1"
                                            onClick={() => handleToggle(group.id)}
                                        >
                                            {/* Ícono Abierto/Cerrado */}
                                            {
                                                isOpen ? (
                                                    <ChevronUp className="w-5 h-5 text-sky-600" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                )
                                            }
                                            {/* Nombre del Grupo y Código */}
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-800">{group.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 leading-none">{t('groups.codeLabel', 'Código')}:</span>
                                                    <span className="font-mono font-sm text-base text-sky-600 leading-none">#{group.code}</span>
                                                    <button
                                                        onClick={(e) => copyCodeToClipboard(group.code, e)}
                                                        className="p-1 hover:bg-sky-100 rounded transition-colors cursor-pointer"
                                                        title={t('groups.copyCode', 'Copiar código')}
                                                    >
                                                        {copiedCode === group.code ? (
                                                            <Check className="w-3 h-3 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-3 h-3 text-gray-400 hover:text-sky-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {/* datos en la Fila Principal (Código, Estatus, Fecha) */}
                                        <div className="flex items-center gap-6 text-sm">

                                            <div className="flex flex-col items-end">
                                                <span className="text-gray-500">{t('groups.created')}</span>
                                                <span className="font-medium text-gray-700">{formatDate(group.created_on)}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-gray-500">{t('users.table.status')}</span>
                                                <span className="font-medium text-gray-700">{getStatusLabel(group.status)}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {/* botones de acción */}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <GameGroupUpsertDialog
                                                                    group={group}
                                                                    onSuccess={fetchGroups}
                                                                    existingCodes={existingCodes}
                                                                    triggerComponent={
                                                                        <Button variant="ghost" size="sm" className="text-blue-500 hover:bg-blue-100">
                                                                            <Edit className="w-4 h-4" />
                                                                        </Button>
                                                                    }
                                                                />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{t('common.edit')}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <GroupQuestionDialog
                                                                    onSuccess={() => (console.log('Preguntas actualizadas'))}
                                                                    groupId={group.id}
                                                                    //groupName={group.name}
                                                                    triggerComponent={
                                                                        <Button variant="ghost" size="sm" className="text-sky-500 hover:bg-sky-100" disabled={group.status !== "active"}>
                                                                            <Plus className="w-4 h-4" />
                                                                        </Button>
                                                                    }
                                                                />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{t('common.addQuestions')}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <Link to={`/dashboard/home/${group.id}`}>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-purple-400 hover:bg-purple-100"
                                                                    >
                                                                        <ChartBarDecreasing className="w-6 h-6 text-purple-500 hover:text-purple-700" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{t('common.statistics')}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <GenericDeleteConfirmationDialog
                                                                    itemId={group.id}
                                                                    itemDescription={t('genericDialogs.delete.description', {
                                                                        itemType: t('genericDialogs.delete.itemTypes.group'),
                                                                        itemName: group.name
                                                                    })}
                                                                    onConfirm={() => deleteGroup(group.id)}
                                                                    onSuccess={fetchGroups}
                                                                    disabled={group.status !== "active"}
                                                                />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{t('common.delete')}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <div>

                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                    {/*  Contenido Expandible (Descripción) */}
                                    {isOpen && (
                                        <div className="p-4 pt-0 bg-white border-t border-sky-100">
                                            <div className="ml-9 space-y-1">
                                                <span className="text-[11px] text-gray-500 tracking-wide">{t('groups.description', 'Descripción')}</span>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {isDescriptionVisible ? group.description : "Sin descripción."}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-10 text-center text-gray-500">
                            <FileSearchCorner className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-lg">
                                {searchQuery.trim() ? t('groups.noSearchResults', 'No se encontraron grupos que coincidan con la búsqueda') : t('groups.noGroups')}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DashboardGroups;