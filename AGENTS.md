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
- Keep Shopify as the product/order source of truth; the workshop edits bouquets through admin-checked server functions that call the Shopify Admin API, so there is no duplicate catalog and the Admin token never reaches the browser.
- Put the workshop under the client-only authenticated layout; grant owner roles only from verified auth email in a protected database trigger, never from browser state or user metadata.
- Both cart views open the shared delivery request dialog and submit an unpaid request to Cloud; verify selected variants and prices server-side against Shopify so visitor data cannot override the catalog. Cloud stores request snapshots, not paid orders; payment is separate.
