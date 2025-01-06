"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";
import { NavLinks } from "@/constants";

interface MenuProps {
  activeSection: string;
  handleMenuClick: (link: NavLink) => void;
  windowWidth: number;
}

interface NavLink {
  text: string;
  icon: JSX.Element;
  href: string;
}

const MenuContainer: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(0);
  const [activeSection, setActiveSection] = useState("Home");

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      setWindowWidth(window.innerWidth);

      const storedActiveSection = localStorage.getItem("activeSection");
      if (storedActiveSection) {
        setActiveSection(storedActiveSection);
      }

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const handleMenuClick = (link: NavLink) => {
    setActiveSection(link.text);
    localStorage.setItem("activeSection", link.text);
  };

  return (
    <div>
      <MainMenu
        activeSection={activeSection}
        handleMenuClick={handleMenuClick}
        windowWidth={windowWidth}
      />
      <BottomTab
        activeSection={activeSection}
        handleMenuClick={handleMenuClick}
        windowWidth={windowWidth}
      />
    </div>
  );
};

const MainMenu: React.FC<MenuProps> = ({
  activeSection,
  handleMenuClick,
  windowWidth,
}) => {
  return (
    <div>
      {windowWidth >= 825 && (
        <ul className="bg-[#e8e3f0] rounded-full shadow-sm py-2 px-2 xm:flex hidden text-md gap-10 ">
          {NavLinks.map((link) => (
            <motion.li
              className="h-3/4 flex items-center justify-center relative "
              key={link.text}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Link
                className={clsx(
                  "z-10 flex text-primary-purple px-5 py-1.5 font-semibold relative group items-center gap-2"
                )}
                href={link.href}
                onClick={() => handleMenuClick(link)}
              >
                {link.icon}
                {link.text}
                {link.text === activeSection && (
                  <motion.span
                    className="bg-[#fffff3] effect-inner rounded-full absolute inset-0 -z-10"
                    layoutId="activeSection"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  ></motion.span>
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
};

const BottomTab: React.FC<MenuProps> = ({
  activeSection,
  handleMenuClick,
  windowWidth,
}) => {
  return (
    <div>
      {windowWidth < 825 && (
        <div
          className="bg-[#e8e3f094] rounded-2xl shadow-sm py-1 xm:flex text-md gap-8 backdrop-blur-[0.5rem] z-[4]"
          style={{
            position: "fixed",
            width: "160px",
            transform: "translateX(-50%)",
            bottom: 5,
            left: "50%",
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {NavLinks.map((link) => (
            <motion.li
              className="h-3/4 flex items-center justify-center relative "
              key={link.text}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Link
                className={clsx(
                  "z-10 flex text-primary-purple px-5 py-4  font-semibold relative group items-center text-xl"
                )}
                href={link.href}
                onClick={() => handleMenuClick(link)}
              >
                {link.icon}
                {link.text === activeSection && (
                  <motion.span
                    className="bg-[#fffff3] effect-inner rounded-2xl absolute inset-0 -z-10"
                    layoutId="activeSection"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  ></motion.span>
                )}
              </Link>
            </motion.li>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuContainer;
