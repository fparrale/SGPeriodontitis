import { LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { LanguageSelector } from "../LanguageSelector";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo_no_text.png";

const NavbarHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const stored = localStorage.getItem("auth_user");
  const user = stored ? (JSON.parse(stored) as { name?: string }) : null;

  const displayName = user?.name?.trim() ? user.name : "UserTest";

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-sky-100 shadow-sm sticky top-0 z-10">
      <div className="flex items-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <img
            src={logo}
            alt="GUM_Logo"
            className="h-10 w-10 shrink-0 block"
          />

          <div className="flex flex-col justify-center leading-none">
            <span className="text-2xl font-extrabold tracking-tight text-sky-300">
              GUM
            </span>

            <span className="-mt-1 text-xs font-semibold text-sky-800 hidden sm:block">
              Gum Understanding Mission
            </span>
          </div>
        </Link>
      </div>
      <div className="flex gap-2" >
        <Link
          to="/profile"
          title={t('navbar.profile')}
          className="group flex items-center gap-2 rounded-md px-2 py-1 text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
        >
          <User className="w-5 h-5 text-gray-600 group-hover:text-sky-600 transition-colors" />
          <span className="text-sm font-medium underline-offset-4 group-hover:underline">
            {displayName}
          </span>
        </Link>
        <LanguageSelector />
        <Button variant="ghost" className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" size="icon" title={t('navbar.logout')} onClick={() => {
          localStorage.removeItem("auth_user");
          navigate("/login");
        }}>
          <LogOut className="w-5 h-5" />
        </Button>

      </div>
    </header>
  );
};

export default NavbarHeader;    