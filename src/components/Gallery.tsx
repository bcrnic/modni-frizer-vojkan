import { motion } from "framer-motion";
import { ScrollReveal } from "./animations/ScrollReveal";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

const galleryImages = [
  { src: gallery1, alt: "Elegantna talasasta kosa", caption: "Savršeni talasi za svaku priliku" },
  { src: gallery2, alt: "Balayage pramenovi", caption: "Prirodan preliv boja" },
  { src: gallery3, alt: "Svečana frizura", caption: "Elegantna punđa za posebne trenutke" },
  { src: gallery4, alt: "Profesionalna stilizacija", caption: "Besprekoran look iz salona" },
];

const Gallery = () => {
  return (
    <section id="galerija" className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        {/* Naslov sekcije */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">Portfolio</p>
          <h2 className="heading-section mb-6">
            Naši <span className="text-gold-gradient">Radovi</span>
          </h2>
          <div className="decorative-line mb-8" />
        </ScrollReveal>

        {/* Galerija grid */}
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
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay sa tekstom */}
              <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 
                              bg-gradient-to-t from-black/80 via-black/20 to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-foreground font-heading text-lg">{image.alt}</p>
                <p className="text-primary text-sm">{image.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Poziv za više slika */}
        <ScrollReveal delay={0.3}>
          <p className="text-center text-muted-foreground mt-12">
            Pratite nas na društvenim mrežama za više inspiracije i naših radova
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Gallery;
