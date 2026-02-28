import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Scissors } from "lucide-react";

/**
 * Login forma za admin.
 * Ne koristi navigate – Admin.tsx detectuje sesiju i menja prikaz.
 */
const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast({
        title: "Greška konfiguracije",
        description: "Supabase nije podešen. Kontaktirajte administratora.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Admin.tsx detektuje session promenu automatski – ne treba navigate
    } catch (error: any) {
      toast({
        title: "Pogrešan email ili lozinka",
        description: error?.message ?? "Pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Brend */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Scissors className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading text-2xl">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Modni Frizer Vojkan</p>
        </div>

        {/* Forma */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@salon.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Lozinka</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Prijavljivanje...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Prijavi se
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">
            ← Nazad na sajt
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
