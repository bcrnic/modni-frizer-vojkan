import { services, type PriceItem } from "./pricing";

/*
=== STRANICE USLUGA - MESTA ZA IZMENU ===
Svaka stranica ima svoju adresu (slug), naslov za Google (title, do ~60 karaktera),
opis za Google (description, do ~155 karaktera) i tekst.
Cene se uzimaju iz src/content/pricing.ts, pa se menjaju samo tamo.
Nova stranica mora i u public/sitemap.xml i public/llms.txt.
*/

export interface ServicePageSection {
  heading: string;
  paragraphs: string[];
}

export interface ServicePageImage {
  file: string;
  alt: string;
}

export interface ServicePage {
  slug: string;
  /** Ime usluge za schema.org i navigaciju. */
  serviceName: string;
  /** Tekst linka sa početne i iz footera. */
  linkLabel: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  /** Prvi pasus: direktan odgovor, 40 do 60 reči. */
  intro: string;
  prices: PriceItem[];
  duration: string;
  sections: ServicePageSection[];
  images: ServicePageImage[];
  faq: { question: string; answer: string }[];
}

const pricesOf = (slug: string) => services.find((c) => c.slug === slug)?.items ?? [];

export const servicePages: ServicePage[] = [
  {
    slug: "balayage-novi-sad",
    serviceName: "Balayage i pramenovi",
    linkLabel: "Sve o balayage-u i pramenovima",
    title: "Balayage i pramenovi u Novom Sadu | Modni frizer Vojkan",
    description:
      "Balayage, pramenovi i toniranje u centru Novog Sada. Cene od 9.000 RSD, besplatne konsultacije i dogovor o ceni pre početka rada.",
    eyebrow: "Balayage i pramenovi",
    h1: "Balayage i pramenovi u Novom Sadu",
    intro:
      "Balayage i pramenove radimo u salonu Modni frizer VOJKAN u centru Novog Sada, kod Hotela Centar. Cena počinje od 9.000 RSD, a tačna zavisi od dužine i gustine kose i utroška materijala. Pre rada su konsultacije besplatne, pa cenu znate pre nego što počnemo.",
    prices: pricesOf("balayage-novi-sad"),
    duration: "Farbanje i balayage traju od 2 do 3.5 sata, zavisno od dužine i gustine kose.",
    sections: [
      {
        heading: "Šta je balayage i po čemu se razlikuje od klasičnih pramenova?",
        paragraphs: [
          "Balayage je tehnika posvetljivanja kod koje se boja nanosi slobodnom rukom, sa mekim prelazom od korena ka krajevima. Rezultat izgleda kao kosa posvetljena suncem, bez oštre linije izrastka.",
          "Klasični pramenovi idu od samog korena i daju ravnomerniji, izraženiji kontrast. Na konsultacijama vam predlažemo šta više odgovara vašem tenu, boji kose i tome koliko često želite da dolazite na osvežavanje.",
        ],
      },
      {
        heading: "Koliko košta balayage u Novom Sadu?",
        paragraphs: [
          "Kod nas pramenovi i balayage koštaju od 9.000 RSD, a uz šišanje od 11.000 RSD. Preliv ili toniranje, kada samo osvežavate postojeću nijansu, košta od 4.000 RSD.",
          "Cena se razlikuje od osobe do osobe jer duga i gusta kosa traži više materijala i vremena. Tačnu cenu dogovaramo na kratkim konsultacijama pre početka.",
        ],
      },
      {
        heading: "Kako izgleda dolazak na balayage?",
        paragraphs: [
          "Počinjemo kratkim razgovorom: šta želite, šta vam stoji i šta je realno za vašu kosu. Tada dogovaramo i cenu, pre nego što krenemo sa radom.",
          "Posle tretmana dobijate savet kako da boja traje duže i kako da kosa ostane sjajna.",
        ],
      },
    ],
    images: [
      { file: "8.webp", alt: "Plava balayage sa loknama" },
      { file: "3.webp", alt: "Ravna kosa sa toplim prelivom" },
      { file: "1.webp", alt: "Bakarni talasi (srednja dužina)" },
    ],
    faq: [
      {
        question: "Koliko traje balayage?",
        answer: "Balayage traje od 2 do 3.5 sata, zavisno od dužine i gustine kose.",
      },
      {
        question: "Da li mogu da dođem na balayage bez zakazivanja?",
        answer:
          "Da, primamo i bez zakazivanja. Imajte na umu da balayage traje nekoliko sati.",
      },
      {
        question: "Da li je cena balayage-a konačna?",
        answer:
          "Cene su okvirne. Tačnu cenu dogovaramo na kratkim konsultacijama pre početka rada, kada vidimo dužinu i gustinu kose.",
      },
    ],
  },
  {
    slug: "farbanje-kose-novi-sad",
    serviceName: "Farbanje kose",
    linkLabel: "Sve o farbanju kose",
    title: "Farbanje kose u Novom Sadu | Modni frizer Vojkan",
    description:
      "Farbanje korena i cele dužine kose u centru Novog Sada. Cene od 4.000 RSD, besplatne konsultacije, a dolazak je moguć i bez zakazivanja.",
    eyebrow: "Farbanje kose",
    h1: "Farbanje kose u Novom Sadu",
    intro:
      "Farbanje kose radimo u salonu Modni frizer VOJKAN u centru Novog Sada. Farbanje korena košta od 4.000 RSD, cele dužine od 5.000 RSD, a farbanje uz šišanje od 6.000 RSD. Pre svakog farbanja su konsultacije besplatne, a cenu dogovaramo pre početka rada.",
    prices: [
      ...pricesOf("farbanje-kose-novi-sad"),
      ...pricesOf("balayage-novi-sad").filter((p) => p.name.startsWith("Preliv")),
    ],
    duration: "Farbanje traje od 2 do 3.5 sata, zavisno od usluge, dužine i gustine kose.",
    sections: [
      {
        heading: "Koren ili cela dužina: šta vam treba?",
        paragraphs: [
          "Farbanje korena je za kosu koja je već farbana, kada se vidi izrastak, a ostatak dužine je još u dobroj nijansi. Farbanje cele dužine je za promenu boje ili kada je boja na dužini izbledela.",
          "Ako samo želite da osvežite nijansu i vratite sjaj, ponekad je dovoljno preliv ili toniranje, od 4.000 RSD. Na konsultacijama vam kažemo šta je potrebno za vašu kosu.",
        ],
      },
      {
        heading: "Koliko košta farbanje kose u Novom Sadu?",
        paragraphs: [
          "Kod nas farbanje korena košta od 4.000 RSD, farbanje cele dužine od 5.000 RSD, a farbanje uz šišanje od 6.000 RSD. Radimo sa premium bojama.",
          "Tačna cena zavisi od dužine i gustine kose i od toga koliko boje je potrebno. Zato je dogovaramo pre početka, na kratkim konsultacijama.",
        ],
      },
      {
        heading: "Kako da boja traje duže?",
        paragraphs: [
          "Posle farbanja dobijate savet kako da boja traje duže i kako da kosa ostane sjajna. Ako je kosa posle više farbanja suva ili oštećena, uz farbanje možete da uradite i regeneraciju sa feniranjem, od 2.500 RSD.",
        ],
      },
    ],
    images: [
      { file: "1.webp", alt: "Bakarni talasi (srednja dužina)" },
      { file: "2.webp", alt: "Ledeno plavi lob (ravno)" },
      { file: "6.webp", alt: "Platinasto plavi bob" },
    ],
    faq: [
      {
        question: "Koliko traje farbanje kose?",
        answer: "Farbanje traje od 2 do 3.5 sata, zavisno od usluge, dužine i gustine kose.",
      },
      {
        question: "Da li mogu da dođem na farbanje bez zakazivanja?",
        answer:
          "Da, uvek primamo i klijentkinje bez zakazivanja.",
      },
      {
        question: "Zašto je cena farbanja okvirna?",
        answer:
          "Utrošak boje i vreme rada zavise od dužine i gustine kose. Zato radimo kratke konsultacije i dogovaramo cenu pre početka.",
      },
    ],
  },
  {
    slug: "zensko-sisanje-novi-sad",
    serviceName: "Žensko šišanje i feniranje",
    linkLabel: "Sve o šišanju i feniranju",
    title: "Žensko šišanje u Novom Sadu | Modni frizer Vojkan",
    description:
      "Žensko šišanje i feniranje u centru Novog Sada, od 3.500 RSD. Traje 45 minuta do sat vremena. Dolazak je moguć bez zakazivanja.",
    eyebrow: "Šišanje i feniranje",
    h1: "Žensko šišanje i feniranje u Novom Sadu",
    intro:
      "Žensko šišanje sa feniranjem radimo u salonu Modni frizer VOJKAN u centru Novog Sada, kod Hotela Centar. Košta od 3.500 RSD i traje oko 45 minuta do sat vremena. Možete da dođete bez zakazivanja, tokom celog radnog vremena.",
    prices: [
      ...pricesOf("zensko-sisanje-novi-sad"),
      ...services.flatMap((c) => c.items).filter((p) => p.name.startsWith("Regeneracija")),
    ],
    duration: "Šišanje sa feniranjem traje u proseku 45 minuta do sat vremena, zavisno od dužine i gustine kose.",
    sections: [
      {
        heading: "Kakvo šišanje radimo?",
        paragraphs: [
          "Cilj nam je oblik koji se lepo nosi i kada nemate vremena za stilizovanje, i frizura koju lako održavate kod kuće. Pre šišanja razgovaramo šta želite i šta vam stoji, prema obliku lica, tipu kose i načinu života.",
          "Salon je porodični, sa tradicijom dugom preko 40 godina. Rade Vojkan i Boža.",
        ],
      },
      {
        heading: "Koliko košta žensko šišanje u Novom Sadu?",
        paragraphs: [
          "Kod nas žensko šišanje sa feniranjem košta od 3.500 RSD, a samo feniranje od 1.200 RSD. Šišanje se može spojiti sa farbanjem (od 6.000 RSD) ili sa balayage-om (od 11.000 RSD).",
          "Cena zavisi od dužine kose, a tačnu cenu dogovaramo pre početka.",
        ],
      },
      {
        heading: "Mogu li da dođem bez zakazivanja?",
        paragraphs: [
          "Da. Uvek ostavljamo deo kapaciteta za klijentkinje koje dolaze bez zakazivanja, pa ste dobrodošli u bilo kom trenutku tokom radnog vremena.",
        ],
      },
    ],
    images: [
      { file: "4.webp", alt: "Kratka bob frizura (blond)" },
      { file: "gallery-3.webp", alt: "Kratki bob sa šiškama" },
      { file: "gallery-2.webp", alt: "Ravno feniranje (srednja dužina)" },
    ],
    faq: [
      {
        question: "Koliko traje šišanje i feniranje?",
        answer:
          "Klasično žensko šišanje sa feniranjem traje u proseku oko 45 minuta do sat vremena, zavisno od dužine i gustine kose.",
      },
      {
        question: "Da li radite nedeljom?",
        answer:
          "Ne, nedeljom ne radimo. Radno vreme je od ponedeljka do petka od 11:00 do 19:00, i subotom od 08:00 do 16:00.",
      },
      {
        question: "Da li ima parkinga u blizini?",
        answer:
          "Salon je u strogom centru Novog Sada, kod Hotela Centar. Najbliži javni parking je ispred Pozorišta, kao i u okolnim ulicama (plava zona).",
      },
    ],
  },
];

export const servicePageBySlug: Record<string, ServicePage> = Object.fromEntries(
  servicePages.map((page) => [page.slug, page]),
);

/** Putanja stranice usluge, uz BASE_PATH (GitHub Pages koristi podfolder). */
export const servicePagePath = (slug: string) => `${import.meta.env.BASE_URL}${slug}`;

