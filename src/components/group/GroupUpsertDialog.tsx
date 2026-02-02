import React, { useMemo, useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { generarCodigoUnicoString } from "../../lib/utils";
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { API_BASE } from '@/lib/config';

interface GameGroupUpsertDialogProps {
    group?: GameGroup; // Si se pasa, es modo edición
    triggerComponent?: React.ReactNode;
    onSuccess: () => void;
    existingCodes?: { codigo: string }[];
}

type StoredAuthUser = {
    id: string;
    name?: string;
    email?: string;
    rol?: string;
    status?: string;
};

export interface GameGroup {
    id: string;
    name: string;
    description: string | null;
    created_on: string;
    code: string;
    status: 'active' | 'inactive' | 'deleted' | string;
}


const GameGroupUpsertDialog: React.FC<GameGroupUpsertDialogProps> = ({ group, triggerComponent, onSuccess, existingCodes = [] }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('');
    //const [statuses, setStatuses] = useState<Array<{ id: string; name: string; description: string }>>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const isEditMode = !!group;

    const USER_STATUS = [
        { id: 'active', name: t('users.status.active') },
        { id: 'inactive', name: t('common.inactive') },
    ]

    const storedUser = useMemo(() => {
        const raw = localStorage.getItem("auth_user");

        if (!raw) {
            toast.error("Usuario no autenticado. Por favor, inicia sesión.");
            return null;
        }
        try {
            return JSON.parse(raw) as StoredAuthUser;
        } catch {
            toast.error("Usuario no autenticado. Por favor, inicia sesión.");
            return null;
        }
    }, []);

    // cargar datos cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            if (isEditMode && group) {
                // Modo edición -llenar con datos del grupo
                setName(group.name || '');
                setDescription(group.description || '');
                setCode(group.code || '');
                setStatus(group.status || '');
            } else {
                // Modo creación - generar código y resetear campos
                const generatedCode = generarCodigoUnicoString(existingCodes, 6);
                setCode(generatedCode);
                setName('');
                setDescription('');
                setStatus('');
            }
            setIsLoading(false);
        } else {
            // reset al cerrar
            setName('');
            setDescription('');
            setCode('');
            setStatus('');
            setError(null);
        }
    }, [isOpen, isEditMode, group, existingCodes]);

    // manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!name.trim()) {
            setError(t('groups.dialog.errorRequired'));
            setIsSubmitting(false);
            return;
        }

        const groupData = {
            name: name.trim(),
            description: description.trim() || null,
            code: code.trim() || null,
            status: status || null,
            ...(isEditMode ? {} : { created_by: storedUser?.id || null }),
        };

        try {
            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode
                ? `${API_BASE}/groups/${group?.id}`
                : `${API_BASE}/groups/save`;

            console.log(`${method} request to:`, url);
            console.log('Datos a enviar:', groupData);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(groupData),
            });
            console.log('Respuesta recibida:', response);
            const responseData = await response.json();
            console.log('Respuesta del servidor:', responseData);
            
            if( response.status === 200 || response.status === 201 ){
                console.log(`Grupo ${isEditMode ? 'actualizado' : 'creado'} con éxito`, responseData);

                setName('');
                setDescription('');
                setCode('');
                setStatus('');
                setIsOpen(false);
                toast.success(isEditMode ? t('groups.dialog.successUpdate', 'Grupo actualizado exitosamente') : t('groups.dialog.successCreate'));
                onSuccess();
            }else{ 
                const errorMessage = responseData.message || (isEditMode ? t('groups.dialog.errorUpdate', 'Error al actualizar el grupo') : t('groups.dialog.errorCreate'));
                toast.error(errorMessage);
                setError(errorMessage);
            }
        } catch (err) {
            console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} el grupo:`, err);
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {triggerComponent || (
                    <Button className="bg-sky-500 hover:bg-sky-600 font-semibold shadow-md shadow-sky-300/40">
                        <Users className="w-4 h-4 mr-2" /> {t('groups.createNew')}
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEditMode ? t('groups.dialog.titleEdit', 'Editar Grupo') : t('groups.dialog.titleCreate')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode ? t('groups.dialog.descriptionEdit', 'Modifica los datos del grupo') : t('groups.dialog.descriptionCreate')}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                        <span className="ml-2 text-gray-600">{t('groups.dialog.loadingData', 'Cargando datos...')}</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                        {/* Campo Código (auto) */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="code" className="text-left pt-1.5">{t('groups.dialog.codeLabel')}</Label>
                            <div className="col-span-3">
                                <Input
                                    id="code"
                                    value={code}
                                    maxLength={6}
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('groups.dialog.codeHint', 'Generado automáticamente')}</p>
                            </div>
                        </div>

                        {/* Campo Nombre */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">{t('groups.dialog.nameLabel')}</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                autoFocus
                                maxLength={60}
                                required
                            />
                        </div>

                        {/* Campo Descripción */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">{t('groups.dialog.descriptionLabel')}</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3 resize-none"
                                rows={3}
                                maxLength={200}
                            />
                        </div>
                        {/* Campo Estado (Select) */}
                        {isEditMode && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">{t('groups.dialog.statusLabel', 'Estado')}</Label>
                                <Select value={status} name="status" onValueChange={(v) => setStatus(v)} required>
                                    <SelectTrigger className="col-span-3 border-sky-200 focus:border-sky-500 h-10">
                                        <SelectValue placeholder={t('groups.dialog.selectStatus', 'Seleccionar estado')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {USER_STATUS.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Mensaje de Error */}
                        {error && (
                            <div>

                                <p className="col-span-4 text-center text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-200">
                                    {error}
                                </p>
                            </div>
                        )}

                        <DialogFooter className="mt-4">
                            <Button type="submit" className='bg-sky-500 hover:bg-sky-600' disabled={isSubmitting || !name.trim() || !code.trim() || (code.trim().length > 0 && code.trim().length !== 6) || description.trim().length === 0}>
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isEditMode ? t('groups.dialog.buttonUpdating', 'Actualizando...') : t('groups.dialog.buttonCreating')}</>
                                ) : (
                                    isEditMode ? t('groups.dialog.buttonUpdate', 'Actualizar') : t('groups.dialog.buttonSave')
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default GameGroupUpsertDialog;