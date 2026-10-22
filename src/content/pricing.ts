/*
=== CENOVNIK - MESTA ZA IZMENU ===
Izmenite cene i opise usluga u nizu "services" ispod.
Iste cene koriste i stranice usluga (src/content/servicePages.ts) i schema u index.html.
*/

export interface PriceItem {
  name: string;
  price: string;
  description: string;
}

export interface PriceCategory {
  category: string;
  /** Stranica usluge za ovu kategoriju, ako postoji. */
  slug?: string;
  items: PriceItem[];
}

export const services: PriceCategory[] = [
  {
    category: "Šišanje & Stilizacija",
    slug: "zensko-sisanje-novi-sad",
    items: [
      { name: "Žensko šišanje + feniranje", price: "od 3.500 RSD", description: "Prilagođeno Vašem stilu" },
      { name: "Feniranje", price: "od 1.200 RSD", description: "Profesionalna stilizacija" },
    ]
  },
  {
    category: "Farbanje Kose",
    slug: "farbanje-kose-novi-sad",
    items: [
      { name: "Farbanje kose - koren", price: "od 4.000 RSD", description: "Premium boje" },
      { name: "Farbanje kose - cela dužina", price: "od 5.000 RSD", description: "Premium boje" },
      { name: "Farbanje kose + šišanje", price: "od 6.000 RSD", description: "Premium boje" },
    ]
  },
  {
    category: "Pramenovi & Prelivi",
    slug: "balayage-novi-sad",
    items: [
      { name: "Pramenovi / Balayage", price: "od 9.000 RSD", description: "Prirodan izgled" },
      { name: "Pramenovi / Balayage + šišanje", price: "od 11.000 RSD", description: "Prirodan izgled" },
      { name: "Preliv / Toniranje", price: "od 4.000 RSD", description: "Osvežavanje boje" },
      { name: "Preliv / Toniranje + šišanje", price: "od 6.000 RSD", description: "Osvežavanje boje" },
    ]
  },
  {
    category: "Tretmani & Nega",
    items: [
      { name: "Regeneracija kose + feniranje", price: "od 2.500 RSD", description: "Dubinski tretman" },
      { name: "Nadogradnja kose", price: "od 450 RSD po pramenu", description: "Transformacija" },
    ]
  }
];
