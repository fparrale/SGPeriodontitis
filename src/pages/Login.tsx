import { LanguageSelector } from "@/components/LanguageSelector";
import LoginCard from "@/components/LoginCard";
import LoginLayout from "@/layouts/LoginLayout";
import { Link } from "react-router-dom";
const Login = () => {
   

    return (
        <LoginLayout navbar={ 
        <>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-wide">
                <Link to="/">
                    <span className="text-sky-500">Serious</span> Game Admin
                </Link>
            </h1>
            <LanguageSelector />
        </>
    }>

            <LoginCard />

        </LoginLayout>
    )
}
export default Login;