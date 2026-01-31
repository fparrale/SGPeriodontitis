/* prev env
export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost/seriousgame/public";

*/
export const API_BASE = import.meta.env.VITE_API_BASE as string;
if (!API_BASE) throw new Error("Missing API_BASE");