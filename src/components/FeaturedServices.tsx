import { ArrowUpRight } from "lucide-react";
import { services } from "@/content/pricing";
import { servicePagePath } from "@/content/servicePages";

const featuredServices = services.flatMap(({ slug, items }) =>
  slug ? items.flatMap((item) => item.featuredImage ? [{ ...item, slug, image: item.featuredImage }] : []) : [],
);

const FeaturedServices = () => (
  <section aria-labelledby="featured-services-title" className="bg-secondary/30 px-4 py-12 md:px-8 md:py-16">
    <div className="mx-auto max-w-6xl">
      <h2 id="featured-services-title" className="heading-section mb-7">
        Radovi iz salona
      </h2>
      <ul className="grid gap-5 sm:grid-cols-3">
        {featuredServices.map(({ name, price, slug, image }) => (
          <li key={slug}>
            <a
              href={servicePagePath(slug)}
              className="group block h-full overflow-hidden border border-border bg-card transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/${image.file}`}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                className={`aspect-[4/3] w-full object-cover ${image.position ?? ""}`}
              />
              <div className="flex items-start justify-between gap-3 p-4 md:p-5">
                <div>
                  <h3 className="text-lg leading-snug">{name}</h3>
                  <p className="mt-2 text-primary">{price}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default FeaturedServices;
