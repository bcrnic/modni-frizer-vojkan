import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { AppRoutes, AppToaster } from "./App";
import { servicePages } from "./content/servicePages";

const SITE = "https://frizervojkan.rs";
const SALON_ID = `${SITE}/#salon`;

// Renders a page to HTML at build time, so search engines and AI crawlers get
// the full text without running JavaScript. The tree mirrors App, so the
// browser can hydrate it instead of drawing it again.
export function render(path = "/") {
  return renderToString(
    <LazyMotion features={domAnimation} strict>
      <AppToaster />
      <StaticRouter location={path}>
        <AppRoutes />
      </StaticRouter>
    </LazyMotion>,
  );
}

const minPrice = (price: string) => Number(price.replace(/[^\d]/g, ""));

/**
 * Head data for every prerendered page except "/", whose head lives in index.html.
 * The salon itself (HairSalon) is described on the home page; service pages refer to it by @id.
 */
export const pages = servicePages.map((page) => {
  const url = `${SITE}/${page.slug}`;
  return {
    path: `/${page.slug}`,
    url,
    title: page.title,
    description: page.description,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "@id": `${url}#usluga`,
          name: page.serviceName,
          serviceType: page.serviceName,
          url,
          description: page.intro,
          provider: {
            "@type": "HairSalon",
            "@id": SALON_ID,
            name: "Modni frizer VOJKAN",
            url: `${SITE}/`,
            telephone: "+381621445958",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Uspenska 1, ulaz iz Pavla Papa",
              addressLocality: "Novi Sad",
              postalCode: "21000",
              addressCountry: "RS",
            },
          },
          areaServed: { "@type": "City", name: "Novi Sad" },
          offers: page.prices.map((item) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: item.name },
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: minPrice(item.price),
              priceCurrency: "RSD",
            },
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: page.serviceName, item: url },
          ],
        },
        {
          "@type": "FAQPage",
          mainEntity: page.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        },
      ],
    },
  };
});
