import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Public Transparency Dashboard',
    description: 'Real-time monitoring of civic governance. View accountability heatmaps, department SLA performance, and institutional honesty scores.',
};

export default function TransparencyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
