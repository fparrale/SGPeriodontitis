import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Loader2, Save, Eye, EyeOff, KeyRound } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { API_BASE } from "@/lib/config";

interface UserUpdatePasswordDialogProps {
    userId: string;
    triggerComponent: React.ReactNode;
}

export function UserUpdatePasswordDialog({ userId, triggerComponent }: UserUpdatePasswordDialogProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        }
    }, [isOpen]);

    const handleDialogChange = (open: boolean) => {
        setIsOpen(open);
    };

    const isFormValid =
        currentPassword.trim() !== '' &&
        newPassword.length >= 8 &&
        newPassword.length <= 32 &&
        confirmPassword.length >= 8 &&
        confirmPassword.length <= 32 &&
        newPassword === confirmPassword &&
        newPassword !== currentPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            if (newPassword !== confirmPassword) {
                toast.error(t('users.updatePassword.passwordMismatch'));
            } else if (newPassword === currentPassword) {
                toast.error(t('users.updatePassword.samePassword'));
            }
            return;
        }

        setIsSubmitting(true);
        try {
            const data = {
                currentPassword,
                newPassword,
                confirmPassword
            };

            console.log('User ID:', userId);
            console.log('Password upd data send:', data);

            const response = await fetch(`${API_BASE}/users/${userId}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            console.log('Password upd api resp:', result);

            if (response.ok && result.status === 200) {
                toast.success(result.message || t('users.updatePassword.success'));
                setIsOpen(false);
            } else {
                toast.error(result.message || t('users.updatePassword.error'));
            }
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(t('users.updatePassword.networkError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>{triggerComponent}</DialogTrigger>

            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <KeyRound className="w-6 h-6" />
                        {t('users.updatePassword.title')}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        {t('users.updatePassword.description')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {/* Contraseña Actual */}
                    <div className="grid gap-2">
                        <Label htmlFor="currentPassword" className="font-bold">
                            {t('users.updatePassword.fields.currentPassword')}
                        </Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="h-10 border-sky-200 focus:border-sky-500 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Nueva Contraseña */}
                    <div className="grid gap-2">
                        <Label htmlFor="newPassword" className="font-bold">
                            {t('users.updatePassword.fields.newPassword')}
                        </Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="h-10 border-sky-200 focus:border-sky-500 pr-10"
                                minLength={8}
                                maxLength={32}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">{t('users.updatePassword.fields.passwordHint')}</p>
                        {newPassword && currentPassword && newPassword === currentPassword && (
                            <p className="text-xs text-red-600">{t('users.updatePassword.samePassword')}</p>
                        )}
                    </div>

                    {/* Confirmar Contraseña */}
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword" className="font-bold">
                            {t('users.updatePassword.fields.confirmPassword')}
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-10 border-sky-200 focus:border-sky-500 pr-10"
                                minLength={8}
                                maxLength={32}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-600">{t('users.updatePassword.passwordMismatch')}</p>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className="bg-sky-500 hover:bg-sky-600 font-semibold shadow-md shadow-sky-300/40"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('users.updatePassword.updating')}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {t('users.updatePassword.updateButton')}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
