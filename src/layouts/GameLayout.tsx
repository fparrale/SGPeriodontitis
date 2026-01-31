import NavbarHeader from "@/components/common/NavbarHeader";
import { Outlet } from "react-router-dom";


const GameLayout = () => {
    return (
       <div className="flex flex-col h-screen bg-gray-50">
            <NavbarHeader />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
       </div>
    );
}

export default GameLayout;