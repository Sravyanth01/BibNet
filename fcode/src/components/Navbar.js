import React from "react";
import { menuItemsData } from "../menuItemsData";

import MenuItems from "./MenuItems";
import "../App.css";

const Navbar = () => {
  const depthLevel = 0;
  return (
    <>
    <p className="navbar-brand fs-2">BibNet</p>
    <nav className="desktop-nav mt-4 fs-4">
      
      <ul className="menus">
        {menuItemsData.map((menu, index) => {
          return <MenuItems items={menu} key={index} depthlevel={depthLevel} />;
        })}
      </ul>
    </nav>
    </>
  );
};

export default Navbar;
