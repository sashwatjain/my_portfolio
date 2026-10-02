"use client";

import type { ContactFormData, ContactPageState } from "@/components/contact/types";

import * as React from "react";
import emailjs from "@emailjs/browser";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";

import { ContactForm } from "@/components/contact/contact-form";
import { SITE } from "@/data/site";
import { cn } from "@/lib/utils";

const EMAIL_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};

const MISSING_ENV = [
  ["serviceId", "NEXT_PUBLIC_EMAILJS_SERVICE_ID"],
  ["templateId", "NEXT_PUBLIC_EMAILJS_TEMPLATE_ID"],
  ["publicKey", "NEXT_PUBLIC_EMAILJS_PUBLIC_KEY"],
] as const;

/**
 * The one contact block, shared by both pages. Registered in SECTIONS with
 * page: "both", so it is navigable from either side.
 *
 * Reuses the original ContactForm and its validation hook — only the chrome
 * around it is new, and all colour is token-based so it inverts with the theme.
 */
export const PageFooter = () => {
  const [state, setState] = React.useState<ContactPageState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
  });

  const handleSubmit = React.useCallback(async (formData: ContactFormData) => {
    setState((previous) => ({ ...previous, isSubmitting: true, error: null }));

    const missing = MISSING_ENV.filter(([key]) => !EMAIL_CONFIG[key]).map(([, name]) => name);

    if (missing.length > 0) {
      console.error("[contact] email configuration is incomplete:", missing);

      setState((previous) => ({ ...previous, isSubmitting: false }));

      addToast({
        title: "Form not configured",
        description: `Missing ${missing.join(", ")}`,
        color: "warning",
      });

      return;
    }

    try {
      await emailjs.send(
        EMAIL_CONFIG.serviceId as string,
        EMAIL_CONFIG.templateId as string,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        EMAIL_CONFIG.publicKey as string,
      );

      setState((previous) => ({ ...previous, isSuccess: true }));

      addToast({
        title: "Message sent",
        description: "Thanks — I'll get back to you soon.",
        color: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send. Please try again.";

      setState((previous) => ({ ...previous, error: errorMessage }));

      addToast({ title: "Failed to send", description: errorMessage, color: "danger" });
    } finally {
      setState((previous) => ({ ...previous, isSubmitting: false }));
    }
  }, []);

  const handleReset = React.useCallback(() => {
    setState({ isSubmitting: false, isSuccess: false, error: null });
  }, []);

  return (
    <footer
      className="scroll-mt-top border-t border-divider bg-background"
      id="contact"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <p className="eyebrow">
              <Icon aria-hidden className="text-sm" icon="lucide:send" />
              Contact
            </p>

            <h2 className="mt-4 max-w-md text-balance text-3xl font-semibold tracking-tight text-ink-strong md:text-4xl">
              {SITE.contact.heading}
            </h2>

            <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-ink-body">
              {SITE.contact.description}
            </p>

            <ul className="mt-8 space-y-3">
              <ContactRow href={`mailto:${SITE.contact.email}`} icon="lucide:mail" label={SITE.contact.email} />
              <ContactRow href={`tel:${SITE.contact.phone.replace(/\s+/g, "")}`} icon="lucide:phone" label={SITE.contact.phone} />
              <ContactRow icon="lucide:map-pin" label={SITE.contact.location} />
            </ul>

            <div className="mt-10">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
                Services
              </h3>

              <ul className="mt-4 flex flex-wrap gap-2">
                {SITE.services.map((service) => (
                  <li
                    key={service}
                    className="rounded-full border border-divider bg-content1 px-3 py-1.5 text-sm text-ink-body"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
                Elsewhere
              </h3>

              <ul className="mt-4 flex flex-wrap gap-2">
                {SITE.socialLinks.map((link) => (
                  <li key={link.platform}>
                    <a
                      aria-label={link.platform}
                      className="flex size-10 items-center justify-center rounded-full border border-divider text-ink-body transition-colors hover:border-primary hover:text-primary"
                      href={link.url}
                      rel="noopener noreferrer"
                      target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                    >
                      <Icon aria-hidden className="size-4" icon={link.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-large border border-divider bg-content1 p-6 md:p-8">
            <ContactForm
              isSubmitting={state.isSubmitting}
              isSuccess={state.isSuccess}
              onReset={handleReset}
              onSubmit={handleSubmit}
            />

            {state.error ? (
              <p className={cn("mt-6 rounded-small bg-danger/10 px-4 py-3 text-sm text-danger")}>
                {state.error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-2 border-t border-divider pt-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <p>{SITE.role}</p>
        </div>
      </div>
    </footer>
  );
};

const ContactRow = ({
  icon,
  label,
  href,
}: {
  icon: string;
  label: string;
  href?: string;
}) => (
  <li className="flex items-center gap-3 text-sm text-ink-body">
    <Icon aria-hidden className="size-4 shrink-0 text-ink-muted" icon={icon} />

    {href ? (
      <a className="transition-colors hover:text-primary" href={href}>
        {label}
      </a>
    ) : (
      <span>{label}</span>
    )}
  </li>
);
