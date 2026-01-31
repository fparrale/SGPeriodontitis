import RegisterCard from "@/components/RegisterCard";
import LoginLayout from "@/layouts/LoginLayout";
import type { User } from "@/types/userType";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";

const Register = () => {
    const [users, setUsers] = useState<User | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            await fetch(`${API_BASE}/users`).then(response => response.json())
                .then(data => setUsers(data))
                .catch(error => console.error('Error fetching user data:', error));

        }
        fetchUsers();

    }, []);


    console.log(users);

    return (
        <LoginLayout navbar={<h1 className="text-2xl font-extrabold text-gray-800 tracking-wide">
            <span className="text-sky-500">Serious</span> Game Admin
        </h1>}>

            <RegisterCard />

        </LoginLayout>
    )
}
export default Register;