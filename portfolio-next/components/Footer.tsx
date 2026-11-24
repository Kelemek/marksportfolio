import Image from "next/image";
import { partnersSiteUrl } from "@/lib/romans8";

type SocialLink = {
  href: string;
  icon: string;
  alt: string;
  title: string;
  unoptimized?: boolean;
};

const socialLinks: SocialLink[] = [
  {
    href: "https://github.com/kelemek/",
    icon: "/images/github.svg",
    alt: "GitHub",
    title: "Link to GitHub Profile",
  },
  {
    href: "https://www.linkedin.com/in/mark-larson-a33b3588",
    icon: "/images/linkedin.svg",
    alt: "LinkedIn",
    title: "Link to LinkedIn Profile",
  },
  {
    href: partnersSiteUrl,
    icon: "/images/r8-icon.png",
    alt: "Romans 8 Partners",
    title: "Link to Romans 8 Partners",
    unoptimized: true,
  },
];

export default function Footer() {
  return (
    <footer className="text-center py-2" role="contentinfo">
      <div className="row">
        <ul className="flex justify-center py-gutter-normal list-none">
          {socialLinks.map((link) => (
            <li key={link.href} className="mr-gutter-small last:mr-0">
              <a
                href={link.href}
                title={link.title}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={link.icon}
                  width={40}
                  height={40}
                  alt={link.alt}
                  unoptimized={link.unoptimized}
                  className={
                    link.unoptimized
                      ? "h-10 w-10 object-contain transition-transform hover:scale-110"
                      : "h-10 w-10 transition-transform hover:scale-110"
                  }
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
