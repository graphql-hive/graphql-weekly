import Logo from "./Logo";

export default function Navbar() {
  return (
    <div className="relative z-10 bg-white shadow-[0px_3px_3px_rgba(12,52,75,0.05)] w-screen flex h-14 flex-shrink-0 justify-between">
      <div className="flex items-center">
        <Logo />
        <h1 className="mx-2.5 my-0 text-[#3d556b] text-2xl leading-8">
          qlator
        </h1>
      </div>
    </div>
  );
}
