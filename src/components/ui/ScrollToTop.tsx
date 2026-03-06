import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Prikaži dugme kada korisnik odskroluje 300px nadole
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <Button
            variant="default"
            size="icon"
            onClick={scrollToTop}
            className={cn(
                "fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 shadow-lg transition-all duration-300",
                "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110",
                // Animacija pojavljivanja/nestajanja
                isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0 pointer-events-none"
            )}
            aria-label="Vrati se na vrh"
        >
            <ArrowUp className="w-5 h-5" />
        </Button>
    );
};
