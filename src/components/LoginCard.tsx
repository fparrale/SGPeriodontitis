import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GamepadDirectional, Key, Mail } from "lucide-react";
import { loginApi } from "@/lib/authApi";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const LoginCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resp = await loginApi(email, password);

      if (resp.status !== 200 || !resp.data) {
        setError(resp.message || t('auth.login.invalidCredentials'));
        setPassword(""); // limpiar password
        return;
      }

      localStorage.setItem("auth_user", JSON.stringify(resp.data));

      navigate("/dashboard", { replace: true });
    } catch {
      setError(t('auth.login.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className=" min-w-[450px] shadow-2xl h-fit border-t-4 border-sky-300">
      <CardHeader className="space-y-1 text-center bg-gray-50 p-6 rounded-t-lg">
        <div className="flex items-center justify-center mb-1">
          <GamepadDirectional className="w-7 h-7 text-sky-500" />
        </div>
        <CardTitle className="text-3xl font-extrabold text-gray-800 tracking-wider">
          {t('auth.login.title')}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit}>
          <div className="grid w-full items-center gap-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <Label htmlFor="email" className="font-bold text-sm text-gray-800">
                {t('auth.login.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  className="pl-10 h-11 border-sky-200 focus:border-sky-500 transition duration-300"
                  value={email}
                  maxLength={60}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="password" className="font-bold text-sm text-gray-800">
                {t('auth.login.password')}
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.login.passwordPlaceholder')}
                  className="pl-10 h-11 border-sky-200 focus:border-sky-500 transition duration-300"
                  value={password}
                  maxLength={32}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 text-base py-5 font-bold bg-sky-500 hover:bg-sky-600 transition-all duration-300 shadow-lg shadow-sky-300/40"
            >
              {loading ? t('auth.login.submitting') : t('auth.login.submit')}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center pt-2 text-sm border-t border-gray-100 mt-4 mx-6">
        {/*         <Link
          to="/forgot-password"
          className="font-medium text-gray-500 hover:text-sky-500 transition-colors"
        >
          {t('auth.login.forgotPassword')}
        </Link> */}
        <p className="text-gray-500">
          {t('auth.login.newMember')}
          <Link to="/register" className="ml-1 font-bold text-sky-500 hover:text-sky-600 hover:animate-pulse transition-colors">
            {t('auth.login.register')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginCard;
