<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Store florist requests in Cloud with admin-only read/update RLS; public visitors may only submit consented requests, so personal data remains private.
- Store the catalog in Supabase bouquets/bouquet_collections and photos in bouquet-images. Only verified admins can modify catalog data; public visitors may read ACTIVE bouquets. No external commerce provider is required.
- Put the workshop under the client-only authenticated layout; grant owner roles only from verified auth email in a protected database trigger, never from browser state or user metadata.
- Both cart views open the shared delivery request dialog and submit an unpaid request to Cloud; verify selected variants and prices server-side against the Supabase catalog so visitor data cannot override the catalog. Cloud stores request snapshots, not paid orders; payment is separate.
- Bouquet saves write one catalog document atomically, including variants, composition, size, images and collection IDs. Availability derives from ACTIVE status and soldOut; validate request prices on the server.
- Animate page blocks with `data-reveal` markers plus `useScrollReveal()` called from each page component (never the root, which would mutate markup before hydration), and keep server query data transferring through router `dehydrate`/`hydrate` so pages never re-render from a spinner.
