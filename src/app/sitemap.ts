import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://janmitra.in';

    const routes = [
        '',
        '/about',
        '/how-it-works',
        '/transparency',
        '/contact',
        '/terms',
        '/privacy',
        '/departments',
        '/login',
        '/signup',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
