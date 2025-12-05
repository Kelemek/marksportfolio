import Image from "next/image";

const socialLinks = [
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
                  className="h-10 w-10 transition-transform hover:scale-110"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
