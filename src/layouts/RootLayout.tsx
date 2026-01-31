
interface Props {
  children: React.ReactNode;
}


const RootLayout: React.FC<Props> = ({ children }) => {
  return (
      <div className="">
        <header className="border-b border-[#E9EBEE]">
            <p>navbar</p>
        </header>
        <main className="mx-40">
            {children}
        </main>
      <footer className="bg-gray-200 p-4 text-center">© 2025</footer>
    </div>
  );
};

export default RootLayout;
