import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Loader2, Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { API_BASE } from "@/lib/config";

interface UserResetPasswordDialogProps {
    userId: number;
    triggerComponent: React.ReactNode;
    onSuccess: () => void;
}

interface UserData {
    name: string;
    email: string;
}

export function UserResetPasswordDialog({ userId, triggerComponent, onSuccess }: UserResetPasswordDialogProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [emailConfirmation, setEmailConfirmation] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleDialogChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setShowSuccess(false);
            setEmailConfirmation('');
            setNewPassword('');
            setShowPassword(false);
        }
    };

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/users/${userId}`);
            if (!response.ok) {
                throw new Error('Error loading user');
            }
            const result = await response.json();
            setUserData(result.data);
        } catch (error) {
            console.error('Error loading user:', error);
            toast.error(t('users.resetPassword.loadError'));
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUserData();
            setEmailConfirmation('');
            setNewPassword('');
            setShowSuccess(false);
            setShowPassword(false);
        }
    }, [isOpen, userId]);

    const handleReset = async () => {
        if (!userData || emailConfirmation.toLowerCase() !== userData.email.toLowerCase()) {
            toast.error(t('users.resetPassword.emailMismatch'));
            return;
        }

        setIsResetting(true);
        try {
            const response = await fetch(`${API_BASE}/users/${userId}/password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();

            if (response.ok) {
                setNewPassword(result.data.password);
                setShowSuccess(true);
                toast.success(result.message || t('users.resetPassword.success'));
                onSuccess();
            } else {
                toast.error(result.message || t('users.resetPassword.error'));
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error(t('users.resetPassword.networkError'));
        } finally {
            setIsResetting(false);
        }
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(newPassword);
        toast.success(t('users.resetPassword.copied'));
    };

    const isConfirmValid = emailConfirmation.trim() !== '' &&
        userData &&
        emailConfirmation.toLowerCase() === userData.email.toLowerCase();

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>{triggerComponent}</DialogTrigger>

            <DialogContent className="sm:max-w-[450px]">
                {isLoading ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="sr-only">{t('common.loading')}</DialogTitle>
                            <DialogDescription className="sr-only">{t('common.loading')}</DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                            <span className="ml-2 text-gray-600">{t('common.loading')}</span>
                        </div>
                    </>
                ) : showSuccess ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <KeyRound className="w-6 h-6" />
                                {t('users.resetPassword.successTitle')}
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                {t('users.resetPassword.copyWarning')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="newPassword" className="font-bold">
                                    {t('users.resetPassword.newPassword')}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        readOnly
                                        className="h-10 border-sky-200 bg-gray-50 pr-10 font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-sm text-amber-800">
                                    {t('users.resetPassword.copyWarning')}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={handleCopyPassword}
                                    className="flex-1 bg-sky-500 hover:bg-sky-600"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    {t('users.resetPassword.copy')}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <KeyRound className="w-6 h-6" />
                                {t('users.resetPassword.title')}
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                {t('users.resetPassword.description')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {userData && (
                                <>
                                    <div className="grid gap-2">
                                        <Label className="font-bold">{t('users.resetPassword.userName')}</Label>
                                        <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded border">
                                            {userData.name}
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="font-bold">{t('users.resetPassword.userEmail')}</Label>
                                        <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded border">
                                            {userData.email}
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="emailConfirm" className="font-bold text-gray-800">
                                            {t('users.resetPassword.confirmEmail')}
                                        </Label>
                                        <Input
                                            id="emailConfirm"
                                            type="email"
                                            value={emailConfirmation}
                                            onChange={(e) => setEmailConfirmation(e.target.value)}
                                            placeholder={t('users.resetPassword.emailPlaceholder')}
                                            className="h-10 border-red-200 focus:border-red-500"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isResetting}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleReset}
                                disabled={!isConfirmValid || isResetting}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isResetting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('users.resetPassword.resetting')}
                                    </>
                                ) : (
                                    t('users.resetPassword.confirmReset')
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
