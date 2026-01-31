interface Props {
  children: React.ReactNode;
  navbar: React.ReactNode;
}

const LoginLayout: React.FC<Props> = ({ children, navbar }) => {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-[#E9EBEE] p-3 font-bold text-2xl" >
        {navbar}
      </header>
      <main className="flex flex-col grow justify-center items-center">
        {children}
      </main>

    </div>
  );
};

export default LoginLayout;
