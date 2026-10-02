import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isCurrentUserAdmin } from "@/services/booking";

/**
 * Admin entry point – avoids using a separate /admin/login route.
 * Shows login or dashboard based on Supabase session state.
 */
const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Track session changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  // Being logged in is not enough: the user must be listed in admin_users.
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    setIsAdmin(null);
    isCurrentUserAdmin().then((result) => {
      if (!cancelled) setIsAdmin(result);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading || (session && isAdmin === null)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <AdminLogin />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-4">
          <ShieldAlert className="w-10 h-10 mx-auto text-destructive" />
          <h1 className="font-heading text-2xl">Nemate pristup</h1>
          <p className="text-sm text-muted-foreground">
            Nalog {session.user.email} nije administrator salona.
          </p>
          <Button variant="outline" onClick={() => supabase?.auth.signOut()}>
            Odjavi se
          </Button>
        </div>
      </div>
    );
  }

  return <AdminDashboard session={session} />;
};

export default Admin;
