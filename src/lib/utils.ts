import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DateTime } from 'luxon';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generarCodigoUnicoString(
  lista: { codigo: string }[],
  longitud = 6
): string {
  const codigos = new Set(lista.map(i => i.codigo));
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let codigo: string;
  do {
    codigo = Array.from({ length: longitud }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  } while (codigos.has(codigo));

  return codigo;
}

export function generatePassword(length = 8): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%&*';

  const allChars = lowercase + uppercase + numbers + symbols;

  // al menos un carácter de cada tipo
  const password = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  // completar caracteres aleatorios
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }


  return password.sort(() => Math.random() - 0.5).join('');
}


export function formatMysqlMadridToUser(mysql: string, locale = navigator.language) {
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dt = DateTime.fromFormat(mysql, "yyyy-MM-dd HH:mm:ss", { zone: "Europe/Madrid" })
    .setZone(userTz);

  return dt.setLocale(locale).toJSDate();
}
