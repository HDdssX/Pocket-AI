# Pocket AI v1.1.0

This release promotes the `1.0.20-beta.6` Android composer/keyboard fix to the stable `v1.1.0` line and consolidates the full update history since `v1.0.0`.

## Highlights Since v1.0.0

- Fixed the Android composer getting stuck above the bottom of the screen after the keyboard closes or the screen size changes.
- Added and stabilized Markdown, LaTeX, KaTeX, and code block rendering across streaming and completed messages.
- Added message selection, copy/share/regenerate actions, user-message editing, variants, and branch switching.
- Reworked the conversation drawer, gesture handling, settings navigation, and session management flows.
- Improved API profile handling, model list caching, reasoning effort support, streaming behavior, and release checking.
- Refined the composer, attachment row, dark/light/system appearance, About page, status insets, and touch ergonomics.
- Updated release metadata for `v1.1.0` and pointed latest-release checks to `HDdssX/Pocket-AI`.

## Fixed: Android Composer Stuck Above Bottom

- Reproduction: open a chat on Android, focus the composer, close the input method, then optionally change the screen resolution. The composer could remain fixed above the bottom instead of returning to the bottom edge.
- Cause: Android was receiving duplicate keyboard avoidance from both native `adjustResize` and `KeyboardAvoidingView`, while stale composer lift measurements/animations could still complete after keyboard hide or screen resize.
- Fix: Android now relies on native resize behavior, while iOS keeps `KeyboardAvoidingView`. Composer lift animations and measurements are guarded so stale callbacks are ignored after keyboard hide or window-size changes.

## Version-by-Version Summary

- `v1.0.0`: Baseline release that stabilized chat Markdown rendering.
- `v1.0.1`: Added KaTeX-based LaTeX rendering, preserved formula delimiters, bundled offline KaTeX CSS/fonts/runtime, and rendered formulas through WebView.
- `v1.0.2`: Fixed blank assistant areas around formula messages, added native Markdown fallback paths, improved formula WebView/no-response fallbacks, and stabilized bubble width.
- `v1.0.3`: Fixed inline `\(...\)` layout, made formula backgrounds transparent, and prerendered formula-heavy messages as full-message HTML.
- `v1.0.4`: Improved formula rendering stability with first-frame/layout waits, no-cache remounts, non-blocking font handling, native Markdown during streaming, and throttled auto-scroll.
- `v1.0.5`: Added long-press message menus, text selection, copy/share/regenerate actions, a sliding session drawer, drawer search/settings, batch delete, layout updates, expanded composer behavior, and code syntax highlighting.
- `v1.0.6`: Fixed crashes after code output, switched to native token code rendering, removed the syntax-highlighter dependency, replaced Unicode/emoji icons, improved long composer/search text, restored drawer swipe back, adjusted status insets, simplified labels, and kept original bubble text selectable.
- `v1.0.7`: Added the selection bottom panel, user-message editing, response variants, branch switching, lucide icons, full-screen composer, a higher expand threshold, and overlay buttons.
- `v1.0.8`: Reworked the composer with separate attachment/input controls, a taller input, attachment row support, a FlatList drawer, and smoother drawer animation.
- `v1.0.9`: Added settings subpage navigation, status inset refinements, expanded editor cleanup, system selection panel updates, model picker cleanup, and bottom-sheet close animation improvements.
- `v1.0.10`: Made the attachment area full width, stacked input actions on the right, and prevented unnecessary drawer reopen animation.
- `v1.0.11`: Improved API configuration model fetch caching/display, composer sizing, top model area layout, and compact session list dividers/time display.
- `v1.0.12`: Added per-profile cached model lists and reasoning efforts, and limited model fetching to explicit user actions.
- `v1.0.13`: Refined composer expand/send placement, added an animated thinking placeholder, improved overlay backdrop animation, reduced API sheet jank, restored the home model button style, and updated About credits.
- `v1.0.14`: Removed "latest chats first", restored left-swipe navigation, lowered the drawer header, centered the single-line composer, added app version/latest-release display, and added light/dark/system appearance modes.
- `v1.0.15`: Updated About co-maintainers, improved code block horizontal scrolling and dark surfaces, supported system orientation rotation, fixed dark-mode drawer button contrast, moved API config into a settings subpage, kept the composer editable while streaming, added auto-scroll pause/resume, improved drawer finger tracking, and limited generated titles to 15 characters.
- `v1.0.16`: Removed broad button layout animation, replaced it with focused slide/fade popovers, kept assistant content stable, loosened drawer swipe detection, added runtime composer lift, aligned About entries, and added the version checking card.
- `v1.0.17`: Allowed diagonal left swipe from blank drawer areas, made the swipe footer transparent, and expanded the touchable session list area.
- `v1.0.18`: Tracked touch continuously across drawer root/backdrop/list/footer and increased drawer close sensitivity.
- `v1.0.19`: Further increased drawer close sensitivity without changing home swipe-open behavior.
- `v1.0.20-beta.1`: Moved the drawer out of the native modal into the main scene, introduced a shared horizontal animated value, and added directional transitions for settings subpages.
- `v1.0.20-beta.2`: Fixed the blank launch screen caused by drawer/home animation starting open, initialized the drawer hidden, and resynced drawer position on window-width changes.
- `v1.0.20-beta.3`: Fixed the composer staying lifted after keyboard dismissal by listening for keyboard show/hide events, canceling pending lift work, and resetting immediately/delayed after hide.
- `v1.0.20-beta.5`: Smoothed composer lift/drop with native transforms, stabilized measurements during animation, and deduplicated drawer close animation for smoother interaction.
- `v1.0.20-beta.6`: Fixed the Android composer remaining above the bottom after keyboard close by removing duplicate Android keyboard avoidance and ignoring stale lift measurements/animations after hide or resize.
- `v1.1.0`: Promotes the beta keyboard/composer fix to stable, sets app/package/Android version metadata to `1.1.0`, uses Android `versionCode` 27, and updates the latest-release API URL to `HDdssX/Pocket-AI`.

## Verification

- `cmd /c node_modules\.bin\tsc.cmd --noEmit`
- `git diff --check`

## Artifact Policy

- APK is not included in this PR.
- Android build outputs, Gradle caches, `node_modules`, local signing files, environment files, logs, screenshots, and cache files are not included.
- Formal release APK builds remain maintainer-owned.
