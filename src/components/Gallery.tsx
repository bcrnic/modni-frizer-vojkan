import { motion } from "framer-motion";
import { ScrollReveal } from "./animations/ScrollReveal";

const galleryImages = [
  {
    src: `${import.meta.env.BASE_URL}assets/gallery-1.jpg`,
    alt: "Platinasto plava ravna kosa",
    caption: "Čista plava nijansa i savršeno ravno feniranje"
  },
  {
    src: `${import.meta.env.BASE_URL}assets/gallery-2.jpg`,
    alt: "Ravna frizura na srednju dužinu",
    caption: "Prirodan sjaj i precizno šišanje"
  },

  {
    src: `${import.meta.env.BASE_URL}assets/gallery-4.jpg`,
    alt: "Bob sa pramenovima",
    caption: "Topli pramenovi i čiste linije šišanja"
  },
  {
    src: `${import.meta.env.BASE_URL}assets/gallery-5.jpg`,
    alt: "Talasasta smeđa kosa",
    caption: "Mekani talasi za prirodan, elegantan look"
  },
  // Add more images like this:
  // {
  //   src: "/assets/gallery-6.jpg",
  //   alt: "Image description",
  //   caption: "Short caption"
  // },
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
