import { partnersEmail, partnersSiteUrl } from "@/lib/romans8";

const inlineLinkClass =
  "whitespace-nowrap text-white underline decoration-pink underline-offset-4 hover:text-pink";

export default function ContactSection() {
  return (
    <section className="contact" id="contact">
      <div className="row">
        <h2 className="text-large mb-gutter-medium">Get in Touch</h2>

        <div className="max-w-container-medium">
          <p className="mb-gutter-small">
            The quickest way to reach me is via email. I will do my best to
            respond promptly.
          </p>
          <a href="mailto:markdlarson@me.com" className="btn">
            markdlarson@me.com
          </a>
          <p className="mt-gutter-small">
            For small-business AI consulting, visit{" "}
            <a
              href={partnersSiteUrl}
              className={inlineLinkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              Romans 8 Partners
            </a>{" "}
            or email{" "}
            <a href={`mailto:${partnersEmail}`} className={inlineLinkClass}>
              {partnersEmail}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
