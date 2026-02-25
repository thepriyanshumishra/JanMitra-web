import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/officer/', '/api/'],
        },
        sitemap: 'https://janmitra.in/sitemap.xml',
    };
}
