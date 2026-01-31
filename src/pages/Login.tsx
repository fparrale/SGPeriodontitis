import LoginCard from "@/components/LoginCard";
import LoginLayout from "@/layouts/LoginLayout";

const Login = () => {
   

    return (
        <LoginLayout navbar={ 
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-wide">
          <span className="text-sky-500">Serious</span> Game Admin
        </h1>}>

            <LoginCard />

        </LoginLayout>
    )
}
export default Login;