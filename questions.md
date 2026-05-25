## i saw on next.js website they havea ui folder under app/ in their example. should i have this too?

## for components, im imagining a titan card folder which has the titan card component itself, and children elements (titan card header, stat widgets, per-round stats). please refactor as such, which will clean up TitanCard.jsx

## Should any of the components be converted to tsx? and/or are there any other files that would benefit from being converted to ts? if so then do so

## exclude from vs code search results all md files, config files, package files, etc. things that are ancillary to my actual codebase

## google search console still says it couldn't fetch sitemap. i found the following in next.js tutorial, should we do static xml file at project root would taht help, and/or should we add the MetadataRoute import to sitemap.ts would that help? "sitemap.xml

Last updated May 19, 2026
sitemap.(xml|js|ts) is a special file that matches the Sitemaps XML format to help search engine crawlers index your site more efficiently.

Sitemap files (.xml)
For smaller applications, you can create a sitemap.xml file and place it in the root of your app directory.

app/sitemap.xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>https://acme.com</loc>
<lastmod>2023-04-06T15:02:24.021Z</lastmod>
<changefreq>yearly</changefreq>
<priority>1</priority>
</url>
<url>
<loc>https://acme.com/about</loc>
<lastmod>2023-04-06T15:02:24.021Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>https://acme.com/blog</loc>
<lastmod>2023-04-06T15:02:24.021Z</lastmod>
<changefreq>weekly</changefreq>
<priority>0.5</priority>
</url>
</urlset>
Generating a sitemap using code (.js, .ts)
You can use the sitemap.(js|ts) file convention to programmatically generate a sitemap by exporting a default function that returns an array of URLs. If using TypeScript, a Sitemap type is available.

Good to know: sitemap.js is a special Route Handler that is cached by default unless it uses a Request-time API or dynamic config option.

app/sitemap.ts
TypeScript

TypeScript
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
return [
{
url: 'https://acme.com',
lastModified: new Date(),
changeFrequency: 'yearly',
priority: 1,
},
{
url: 'https://acme.com/about',
lastModified: new Date(),
changeFrequency: 'monthly',
priority: 0.8,
},
{
url: 'https://acme.com/blog',
lastModified: new Date(),
changeFrequency: 'weekly',
priority: 0.5,
},
]
}
Output:

acme.com/sitemap.xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>https://acme.com</loc>
<lastmod>2023-04-06T15:02:24.021Z</lastmod>
<changefreq>yearly</changefreq>
<priority>1</priority>
</url>
<url>
<loc>https://acme.com/about</loc>
<lastmod>2023-04-06T15:02:24.021Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>https://acme.com/blog</loc>
<lastmod>2023-04-06T15:02:24.021Z</lastmod>
<changefreq>weekly</changefreq>
<priority>0.5</priority>
</url>
</urlset>
"

## commit and push changes
