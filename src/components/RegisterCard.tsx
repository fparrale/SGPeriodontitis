import { useState } from "react";
import { CheckCircle, Mail, User, Lock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { registerApi } from "@/lib/authApi";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const RegisterCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const resp = await registerApi(name, email, password);

      if (resp.status !== 201) {
        setError(resp.message || t('auth.register.registrationError'));
        return;
      }

      // confirmación y redirección automatica al login
      setSuccess(t('auth.register.registrationSuccess'));
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);

    } catch {
      setError(t('auth.register.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[450px] shadow-2xl h-fit border-t-4 border-sky-300">
      <CardHeader className="space-y-1 text-center bg-gray-50 p-6 rounded-t-lg">
        <div className="flex items-center justify-center mb-1">
          <CheckCircle className="w-7 h-7 text-sky-500" />
        </div>
        <CardTitle className="text-3xl font-extrabold text-gray-800 tracking-wider">
          {t('auth.register.title')}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit}>
          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 mb-3 text-sm text-green-700">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 mb-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid w-full items-center gap-6 max-h-[250px] overflow-auto">


            <div className="flex flex-col space-y-2">
              <Label htmlFor="name" className="font-bold text-sm text-gray-800">
                {t('auth.register.fullName')}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.register.fullNamePlaceholder')}
                  className="pl-10 h-11 border-sky-200 focus:border-sky-500 transition duration-300"
                  value={name}
                  onChange={(e) => {
                    if (error) setError(null);
                    setName(e.target.value);
                  }}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="email" className="font-bold text-sm text-gray-800">
                {t('auth.register.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  className="pl-10 h-11 border-sky-200 focus:border-sky-500 transition duration-300"
                  value={email}
                  onChange={(e) => {
                    if (error) setError(null);
                    setEmail(e.target.value);
                  }}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="password" className="font-bold text-sm text-gray-800">
                {t('auth.register.password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.register.passwordPlaceholder')}
                  autoComplete="new-password"
                  className="pl-10 h-11 border-sky-200 focus:border-sky-500 transition duration-300"
                  value={password}
                  onChange={(e) => {
                    if (error) setError(null);
                    setPassword(e.target.value);
                  }}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="confirmPassword" className="font-bold text-sm text-gray-800">
                {t('auth.register.confirmPassword')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  autoComplete="new-password"
                  className="pl-10 h-11 border-sky-200 focus:border-sky-500 transition duration-300"
                  value={confirmPassword}
                  onChange={(e) => {
                    if (error) setError(null);
                    setConfirmPassword(e.target.value);
                  }}
                  required
                />
              </div>
            </div>


            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 text-base py-5 font-bold bg-sky-500 hover:bg-sky-600 transition-all duration-300 shadow-lg shadow-sky-300/40"
            >
              {loading ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>

          </div>

        </form>

      </CardContent>

      <CardFooter className="flex justify-center pt-2 text-sm border-t border-gray-100 mt-4 mx-6">
        <p className="text-gray-500">
          {t('auth.register.haveAccount')}
          <Link to="/login" className="ml-1 font-bold text-sky-500 hover:text-sky-600 transition-colors">
            {t('auth.register.signIn')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterCard;