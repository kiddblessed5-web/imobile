/* =========================================================
   iMobile — connection settings
   Leave both values empty to run in DEMO MODE: everything the
   dashboard saves is kept in this browser only (great for previews).

   To go live, create a Supabase project, run supabase/schema.sql,
   then paste your project URL and anon (public) key below.
   See ADMIN.md for the full step-by-step.
   ========================================================= */
window.IMOBILE_CONFIG = {
  supabaseUrl: "",      // e.g. "https://abcdxyz.supabase.co"
  supabaseAnonKey: "",  // Project Settings → API → anon public key
  imageBucket: "product-images",
};

/* Load the Supabase client only when the site is connected
   (keeps demo mode light). Must stay a classic, non-async script. */
if (window.IMOBILE_CONFIG.supabaseUrl && window.IMOBILE_CONFIG.supabaseAnonKey) {
  document.write('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"><\/script>');
}
