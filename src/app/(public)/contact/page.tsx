import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with the JanMitra team for support, partnerships, or implementation inquiries. building accountable cities together.",
};

export default function ContactPage() {
    return <ContactPageClient />;
}
