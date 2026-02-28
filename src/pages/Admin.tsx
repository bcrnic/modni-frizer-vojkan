import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import { Loader2 } from "lucide-react";

/**
 * Admin entry point – ne koristi router /admin/login.
 * Prikazuje login ili dashboard na osnovu Supabase session stanja.
 */
const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Učitaj inicijalnu sesiju
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Prati promene sesije (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return session ? <AdminDashboard session={session} /> : <AdminLogin />;
};

export default Admin;
