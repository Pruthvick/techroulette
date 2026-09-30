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

## ConceptDrop structure
- The concept bank lives in `src/data/concepts.ts` as category/difficulty name lists, expanded into `Concept[]` at module load — keeps hundreds of entries editable without hand-written boilerplate.
- Countdowns use `src/hooks/useCountdown.ts`, which derives remaining time from `Date.now()` timestamps so timers stay accurate when the tab is backgrounded.
- Progress/streak/recent state goes through `src/hooks/useProgress.ts` on top of `src/lib/storage.ts`, which swallows localStorage failures so the app never crashes without storage.
