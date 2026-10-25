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
- Keep Shopify as the product/order source of truth and open its authenticated editor for product changes, avoiding duplicate catalogs or exposing Admin API credentials.
- Put the workshop under the client-only authenticated layout; grant owner roles only from verified auth email in a protected database trigger, never from browser state or user metadata.
