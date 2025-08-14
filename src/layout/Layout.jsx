import { Outlet } from "react-router";

import Navbar from "./Navbar";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="forest-rays">
        <Outlet />
      </main>
    </>
  );
}
