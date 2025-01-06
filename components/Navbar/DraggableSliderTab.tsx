"use client";

import React, { useState, useEffect } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

function DraggableSliderTabs() {
  const [isDragging, setIsDragging] = useState(false);

  const tabsBoxRef = React.useRef<HTMLUListElement | null>(null);
  const allTabsRef = React.useRef<NodeListOf<HTMLLIElement> | undefined>(
    undefined
  );

  const handleIcons = () => {
    const tabsBox = tabsBoxRef.current;
    const arrowIcons = document.querySelectorAll<HTMLElement>(".icon i");

    if (tabsBox) {
      const maxScrollableWidth = tabsBox.scrollWidth - tabsBox.clientWidth;
      arrowIcons[0].parentElement!.style.display =
        tabsBox.scrollLeft <= 0 ? "none" : "flex";
      arrowIcons[1].parentElement!.style.display =
        maxScrollableWidth - tabsBox.scrollLeft <= 1 ? "none" : "flex";
    }
  };

  useEffect(() => {
    const tabsBox = tabsBoxRef.current;
    const allTabs = tabsBox?.querySelectorAll<HTMLLIElement>(".tab");

    allTabsRef.current = allTabs; // Set the value of allTabsRef

    if (allTabsRef.current) {
      allTabsRef.current.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabsBox!.querySelector(".active")!.classList.remove("active");
          tab.classList.add("active");
        });
      });
    }

    const arrowIcons = document.querySelectorAll<HTMLElement>(".icon i");

    arrowIcons.forEach((icon) => {
      icon.addEventListener("click", () => {
        if (icon.id === "left") {
          tabsBox!.scrollLeft = 0; // Scroll to the beginning
        } else if (icon.id === "right") {
          const maxScrollableWidth =
            tabsBox!.scrollWidth - tabsBox!.clientWidth;
          tabsBox!.scrollLeft = maxScrollableWidth; // Scroll to the end
        }
        handleIcons();
      });
    });

    tabsBox!.addEventListener("mousedown", () => setIsDragging(true));
    tabsBox!.addEventListener("mousemove", () => {
      if (isDragging) {
        tabsBox!.classList.add("dragging");
        handleIcons();
      }
    });
    document.addEventListener("mouseup", () => {
      if (isDragging) {
        setIsDragging(false);
        tabsBox!.classList.remove("dragging");
      }
    });

    // Add event listener to window resize
    window.addEventListener("resize", handleIcons);

    // Clean up event listeners on unmount
    return () => {
      arrowIcons.forEach((icon) => {
        icon.removeEventListener("click", () => {});
      });
      allTabs!.forEach((tab) => {
        tab.removeEventListener("click", () => {});
      });
      tabsBox!.removeEventListener("mousedown", () => {});
      tabsBox!.removeEventListener("mousemove", () => {});
      document.removeEventListener("mouseup", () => {});
      window.removeEventListener("resize", handleIcons);
    };
  }, []);

  // Initial call to handleIcons
  useEffect(() => {
    handleIcons();
  }, []);

  return (
    <div className="wrapper">
      <div className="icon">
        <i id="left" className="fa-solid fa-angle-left">
          <HiChevronLeft />
        </i>
      </div>
      <ul className="tabs-box" ref={tabsBoxRef}>
        <li className="tab active">전체</li>
        <li className="tab">만화</li>
        <li className="tab">일러스트</li>
        <li className="tab">UX/UI</li>
        <li className="tab">건축디자인</li>
        <li className="tab">사진</li>
        <li className="tab">Graphics & Design</li>
        <li className="tab">Writing & Translation</li>
        <li className="tab">AI Services</li>
        <li className="tab">Programming & Tech</li>
      </ul>
      <div className="icon">
        <i id="right" className="fa-solid fa-angle-right">
          <HiChevronRight />
        </i>
      </div>
    </div>
  );
}

export default DraggableSliderTabs;