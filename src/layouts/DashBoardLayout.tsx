import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, User, HelpCircle, UsersRound } from 'lucide-react';
import NavbarHeader from '@/components/common/NavbarHeader';
import { useTranslation } from 'react-i18next';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, text }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-sky-100/70 hover:text-sky-600 transition-colors duration-200 font-semibold"
  >
    {icon}
    {text}
  </Link>
);

export function DashboardLayout() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-screen bg-gray-50">

      <NavbarHeader />

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar Fijo */}
        <nav className="w-56 bg-white p-4 border-r border-sky-100 flex flex-col justify-between shadow-lg">
          <div>
            <h2 className="text-lg font-bold text-gray-500 mb-4 uppercase tracking-wider">{t('dashboard.menu')}</h2>
            <div className="space-y-2">
              <NavLink
                to="home"
                icon={<LayoutDashboard className="w-5 h-5" />}
                text={t('dashboard.general')}
              />
              <NavLink
                to="groups"
                icon={<UsersRound className="w-5 h-5" />}
                text={t('dashboard.groups')}
              />
              <NavLink
                to="users"
                icon={<User className="w-5 h-5" />}
                text={t('dashboard.users')}
              />
              <NavLink
                to="questions"
                icon={<HelpCircle className="w-5 h-5" />}
                text={t('dashboard.questions')}
              />

            </div>
          </div>
          {/* Pie de página del sidebar */}
          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
            {t('dashboard.version')}
          </div>
        </nav>

        {/* Contenido Dinámico  Outlet */}
        <main className="flex-1 p-8 overflow-y-auto">

          <Outlet />
        </main>
      </div>
    </div>
  );
}