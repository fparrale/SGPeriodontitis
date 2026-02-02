interface Props {
  children: React.ReactNode;
  navbar: React.ReactNode;
}

const LoginLayout: React.FC<Props> = ({ children, navbar }) => {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 bg-white border-b border-sky-100 shadow-sm sticky top-0 z-10">
        {navbar}
      </header>
      <main className="flex flex-col grow justify-center items-center">
        {children}
      </main>

    </div>
  );
};

export default LoginLayout;
