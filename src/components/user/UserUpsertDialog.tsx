import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { generatePassword } from "../../lib/utils";
import { API_BASE } from "@/lib/config";


interface UserFormData {
    name: string;
    email: string;
    password?: string; // Solo para creación
    rol_id: string;
    status_id: string;
}
// Valores iniciales  modo crear 
const initialFormData: UserFormData = {
    name: '',
    email: '',
    password: '',
    rol_id: '',
    status_id: '',
};

// Propiedades del componente: acepta un ID opcional
interface UserUpsertDialogProps {
    userId?: number; // Si se pasa, es modo edición
    triggerComponent: React.ReactNode;
    onSuccess: () => void;
}

export function UserUpsertDialog({ userId, triggerComponent, onSuccess }: UserUpsertDialogProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState<Array<{ id: string; name: string; description: string }>>([]);
    const [statuses, setStatuses] = useState<Array<{ id: string; name: string; description: string }>>([]);
    const isEditMode = !!userId;
    const title = isEditMode ? `${t('users.dialog.titleEdit')} ${formData.name}` : t('users.dialog.titleCreate');

    const getUserRoles = async () => {
        const API_URL = `${API_BASE}/users/roles`;

        const response = await fetch(API_URL, {
            method: 'GET',

        });
        if (!response.ok) {
            throw new Error(`Fallo al Obtener los roles: ${response.statusText}`);
        }
        console.log('Respuesta de roles:', response);
        return response.json();

    }

    const getAllStatuses = async () => {
        const API_URL = `${API_BASE}/users/statuses`;
        const response = await fetch(API_URL, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Fallo al Obtener los estados: ${response.statusText}`);
        }
        return response.json();

    }


    const getUserById = async (id: number) => {
        const API_URL = `${API_BASE}/users/${id}`;

        const response = await fetch(API_URL, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Fallo al Obtener el usuario: ${response.statusText}`);
        }
        return response.json();
    }

    const fetchRolesAndStatuses = async () => {
        setIsLoading(true);
        const rolesResponse = await getUserRoles();
        const statusesResponse = await getAllStatuses();
        setRoles(rolesResponse.data);
        setStatuses(statusesResponse.data);
        setIsLoading(false);
    }

    const fetchUserData = async (id: number) => {
        setIsLoading(true);
        const userResponse = await getUserById(id);
        fetchRolesAndStatuses();

        console.log('Datos del usuario cargados para edición:', userResponse);
        const userData = userResponse.data;

        setFormData({
            name: userData.name,
            email: userData.email,
            rol_id: userData.rol_id,
            status_id: userData.status_id,
            password: '',
        });

        setIsLoading(false);
    };

    // cargar datos si estamos en modo edición
    useEffect(() => {
        if (isOpen && isEditMode && userId) {
            fetchUserData(userId);
        } else if (isOpen && !isEditMode) {
            // modo creación reset form y cargar roles/estados
            fetchRolesAndStatuses();
            setFormData({
                ...initialFormData,
                password: generatePassword() // Generar una contraseña segura por defecto
            });
        }
    }, [isOpen, isEditMode, userId]);


    // Manejadores de cambios
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (field: keyof UserFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    // Validación, todos los campos necesarios deben tener valor
    const isFormValid =
        formData.name.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.rol_id !== '' &&
        formData.status_id !== '' &&
        (!isEditMode ? (formData.password && formData.password.length >= 8 && formData.password.length <= 32) : true);


    // Manejador de Envío (Crear o Actualizar)
    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);
        console.log('Datos del formulario a enviar:', formData);

        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode
            ? `${API_BASE}/users/${userId}`
            : `${API_BASE}/users`;

        // no incluir contraseña si es modo edición
        const { password, ...dataWithoutPassword } = formData;
        const dataToSend = isEditMode ? dataWithoutPassword : formData;

        try {
            console.log("data sending to API:", dataToSend);
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            console.log('Respuesta de la API:', response);

            if (response.ok) {
                // Éxito
                onSuccess();
                toast.success(isEditMode ? t('users.dialog.messages.updated') : t('users.dialog.messages.created'));
                setIsOpen(false);
            } else {
                console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} usuario.`);
            }

        } catch (error) {
            console.error('Error de red:', error);
        } finally {
            setIsSubmitting(false);
        }
    };



    console.log('Roles cargados:', roles);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>

            <DialogTrigger asChild>{triggerComponent}</DialogTrigger>

            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2 min-w-0 break-words">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        {isEditMode ? t('users.dialog.descriptionEdit') : t('users.dialog.descriptionCreate')}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                        <span className="ml-2 text-gray-600">{t('users.dialog.loadingData')}</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                        {/* Campo Nombre */}
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="font-bold">{t('users.dialog.fields.name')}</Label>
                            <div className="relative">

                                <Input id="name" type="text" name="name" value={formData.name} onChange={handleChange} className="h-10 border-sky-200 focus:border-sky-500" maxLength={55} required />
                            </div>
                        </div>

                        {/* Campo Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="font-bold">{t('users.dialog.fields.email')}</Label>
                            <div className="relative">

                                <Input id="email" type="email" value={formData.email} onChange={handleChange} className="h-10 border-sky-200 focus:border-sky-500" maxLength={55} required />
                            </div>
                        </div>

                        {/* Campo Contraseña - Solo en modo creación */}
                        {!isEditMode && (
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="font-bold">{t('users.dialog.fields.password')}</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password || ''}
                                        onChange={handleChange}
                                        className="h-10 border-sky-200 focus:border-sky-500 pr-10"
                                        minLength={8}
                                        maxLength={32}
                                        autoComplete="off"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">{t('users.dialog.fields.passwordHint')}</p>
                            </div>
                        )}
                        <div className="flex w-full gap-2">

                            {/* Campo Rol (Select) */}
                            <div className="grid gap-2 flex-1 w-full">
                                <Label htmlFor="role_id" className="font-bold">{t('users.dialog.fields.role')}</Label>
                                <Select value={formData.rol_id} name="role_id" onValueChange={(v) => handleSelectChange('rol_id', v)} required>
                                    <SelectTrigger className="border-sky-200 focus:border-sky-500 h-10 w-full">
                                        <SelectValue placeholder={t('users.dialog.fields.selectRole')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                                        ))}


                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Campo Estado (Select) */}
                            <div className="grid gap-2 flex-1">
                                <Label htmlFor="status_id" className="font-bold">{t('users.dialog.fields.status')}</Label>
                                <Select value={formData.status_id} name="status_id" onValueChange={(v) => handleSelectChange('status_id', v)} required>
                                    <SelectTrigger className="border-sky-200 focus:border-sky-500 h-10 w-full">
                                        <SelectValue placeholder={t('users.dialog.fields.selectStatus')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status.id} value={status.id.toString()}>{status.name}</SelectItem>
                                        ))}

                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={!isFormValid || isSubmitting} className="bg-sky-500 hover:bg-sky-600 font-semibold shadow-md shadow-sky-300/40">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 " />}
                                {isEditMode ? t('users.dialog.buttons.saveChanges') : t('users.dialog.buttons.createUser')}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}