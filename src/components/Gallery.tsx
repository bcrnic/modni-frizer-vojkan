import { motion } from "framer-motion";
import { ScrollReveal } from "./animations/ScrollReveal";

const galleryImages = [
  { 
    src: `${import.meta.env.BASE_URL}assets/1.jpeg`, 
    alt: "Bakarni talasi (srednja dužina)", 
    caption: "Topla bakarna nijansa i mekani talasi" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/2.jpeg`, 
    alt: "Ledeno plavi lob (ravno)", 
    caption: "Precizan rez i hladni tonovi plave" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/3.jpeg`, 
    alt: "Ravna kosa sa toplim prelivom", 
    caption: "Prirodan preliv i sjajno feniranje" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/4.jpeg`, 
    alt: "Kratka bob frizura (blond)", 
    caption: "Geometrijski bob sa čistom linijom" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/5.jpeg`, 
    alt: "Kratki bob sa volumenom (blond)", 
    caption: "Pun volumen i svetli blond ton" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/6.jpeg`, 
    alt: "Platinasto plavi bob", 
    caption: "Kratka forma i hladna plava nijansa" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/7.jpeg`, 
    alt: "Talasasta smeđa kosa", 
    caption: "Mekani talasi za prirodan, elegantan look" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/8.jpeg`, 
    alt: "Plava balayage sa loknama", 
    caption: "Mekani prelivi i glamurozne lokne" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/9.jpeg`, 
    alt: "Platinasto plava ravna kosa", 
    caption: "Ravno feniranje i čist, hladan ton plave" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/10.jpeg`, 
    alt: "Svečana frizura (niska punđa)", 
    caption: "Romantične lokne i elegantno podignuta kosa" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/gallery-2.jpg`, 
    alt: "Ravno feniranje (srednja dužina)", 
    caption: "Prirodan sjaj i uredne linije šišanja" 
  },
  { 
    src: `${import.meta.env.BASE_URL}assets/gallery-3.jpg`, 
    alt: "Kratki bob sa šiškama", 
    caption: "Moderni bob sa punim volumenom" 
  },
];

const Gallery = () => {
  return (
    <section id="galerija" className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        {/* Section Title */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">Galerija</p>
          <h2 className="heading-section mb-6">
            Naši <span className="text-gold-gradient">Radovi</span>
          </h2>
          <div className="decorative-line mb-8" />
        </ScrollReveal>

        {/* Gallery grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="gallery-item aspect-[4/5] group"
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                width={600}
                height={750}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Text overlay */}
              <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 
                              bg-gradient-to-t from-black/80 via-black/20 to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-foreground font-heading text-lg">{image.alt}</p>
                <p className="text-primary text-sm">{image.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action for more photos */}
        <ScrollReveal delay={0.3}>
          <p className="text-center text-muted-foreground mt-12">
            Ako želiš frizuru u ovom stilu, pošalji sliku porukom i napiši željeni termin.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Gallery;
