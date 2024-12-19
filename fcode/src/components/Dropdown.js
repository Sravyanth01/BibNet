import React from "react";
import MenuItems from "./MenuItems";

const Dropdown = ({ submenus, dropdown, depthlevel }) => {
  const showDropdownClass = dropdown ? "show" : " ";
  const dropdownDepth = depthlevel + 1;
  const subDropdownClass = dropdownDepth > 1 ? "dropdown-submenu" : " ";
  return (
    <ul className={`dropdown ${showDropdownClass} ${subDropdownClass}`}>
      {submenus.map((submenu, index) => (
        // <li className="menu-items" key={index}>
        //   <a href={submenu.url}>{submenu.title}</a>
        // </li>
        <MenuItems items={submenu} key={index} depthlevel={dropdownDepth} />
      ))}
    </ul>
  );
};

export default Dropdown;
