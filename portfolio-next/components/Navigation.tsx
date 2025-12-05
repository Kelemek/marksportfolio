"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navLinks = [
  { href: "#work", label: "Coding" },
  { href: "#drawing", label: "Drawing" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
  { href: "https://resume.romans8.net", label: "Resumé", external: true },
];

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Convert hash links to full paths when not on homepage
  const getHref = (href: string) => {
    if (href.startsWith("#") && !isHomePage) {
      return `/${href}`;
    }
    return href;
  };

  useEffect(() => {
    let ticking = false;

    function updateNavOnScroll() {
      const nav = navRef.current;
      if (!nav) return;

      const scrollY = window.scrollY;
      const maxScroll = 300;
      const progress = Math.min(scrollY / maxScroll, 1);

      nav.style.setProperty("--scroll-progress", String(progress));

      if (progress > 0.05) {
        nav.classList.add("nav--scrolled");
      } else {
        nav.classList.remove("nav--scrolled");
      }
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateNavOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateNavOnScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="nav fixed top-0 left-0 right-0 z-[1000] flex justify-end transition-all"
      role="navigation"
    >
      <ul className="nav__items flex list-none max-w-container w-full mx-auto justify-end px-gutter-normal lg:px-gutter-medium xl:px-0">
        {navLinks.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                className="nav__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={getHref(link.href)}
                className="nav__link"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
