import { LanguageSelector } from "@/components/LanguageSelector";
import LoginCard from "@/components/LoginCard";
import LoginLayout from "@/layouts/LoginLayout";
import { Link } from "react-router-dom";
import logo from "@/assets/logo_no_text.png";
const Login = () => {


    return (
        <LoginLayout navbar={
            <>
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
                <LanguageSelector />
            </>
        }>

            <LoginCard />

        </LoginLayout>
    )
}
export default Login;