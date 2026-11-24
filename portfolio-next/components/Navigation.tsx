"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { partnersSiteUrl } from "@/lib/romans8";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
  ariaLabel?: string;
  iconSrc?: string;
};

const navLinks: NavLink[] = [
  { href: "#work", label: "Coding" },
  { href: "#drawing", label: "Drawing" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
  { href: "https://resume.romans8.net", label: "Resumé", external: true },
  {
    href: partnersSiteUrl,
    label: "Partners",
    external: true,
    ariaLabel: "Romans 8 Partners",
    iconSrc: "/images/r8-icon.png",
  },
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
      <ul className="nav__items flex list-none items-center max-w-container w-full mx-auto justify-end px-gutter-normal lg:px-gutter-medium xl:px-0">
        {navLinks.map((link) => {
          const href = getHref(link.href);
          const className = link.iconSrc
            ? "nav__link nav__link--with-icon"
            : "nav__link";
          const content = (
            <>
              {link.iconSrc ? (
                <Image
                  src={link.iconSrc}
                  alt=""
                  width={26}
                  height={26}
                  unoptimized
                  className="nav__link-icon"
                />
              ) : null}
              {link.label}
            </>
          );

          return (
            <li key={link.href}>
              {link.external ? (
                <a
                  href={href}
                  className={className}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                >
                  {content}
                </a>
              ) : (
                <Link href={href} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
