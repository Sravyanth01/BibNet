import React, { useState, useEffect, useRef } from "react";
import Dropdown from "./Dropdown";
import { NavLink } from "react-router-dom";

const MenuItems = ({ items, depthlevel }) => {
  //props like items you will get
  const [dropdown, setDropdown] = useState(false);
  const getDropdown = () => {
    setDropdown((prev) => !prev);
  };

  let ref = useRef();

  useEffect(() => {
    const handler = (event) => {
      if (dropdown && ref.current && !ref.current.contains(event.target)) {
        setDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [dropdown]);

  const showDropDown = () => {
    setDropdown(true);
  };
  const remDropDown = () => {
    setDropdown(false);
  };
  return (
    <li
      className="menu-items"
      ref={ref}
      onMouseEnter={showDropDown}
      onMouseLeave={remDropDown}
    >
      {items.submenu ? (
        <>
          <button
            type="button"
            aria-expanded={dropdown ? "true" : "false"}
            onClick={getDropdown}
          >
            <NavLink to={items.url}>{items.title} </NavLink>
            {depthlevel > 0 ? <span>&raquo;</span> : <span className="arrow" />}
          </button>
          <Dropdown
            dropdown={dropdown}
            submenus={items.submenu}
            depthlevel={depthlevel}
          />
        </>
      ) : (
        <NavLink to={items.url}>{items.title}</NavLink>
      )}
    </li>
  );
};

export default MenuItems;
