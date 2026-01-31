import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-sky-500" />
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="es">Español</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
