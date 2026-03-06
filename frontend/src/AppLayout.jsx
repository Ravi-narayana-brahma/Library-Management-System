import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function AppLayout() {

  const [open, setOpen] = useState(false);

  return (
    <div className="layout">

      <Sidebar open={open} setOpen={setOpen} />

      <div className="main">
        <Topbar setOpen={setOpen} />

        <div className="content">
          <Outlet />
        </div>
      </div>

    </div>
  );
}
