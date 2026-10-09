# SchoolFees design guidelines

Current visual direction, implemented on October 9, 2026. The latest user brief replaces the earlier narrow workspace-first/no-illustration direction. Historical audit screenshots retain their dates and are not evidence of this redesign.

## Product and hierarchy

The public landing page explains the fee record before asking for a wallet. Its primary action, **Pay a fee**, opens the payer workspace; **Create a fee** opens the school form. **Open workspace** starts with read-only lookup. Task navigation lives in the workspace, and the brand button returns home. No fake totals, partners, testimonials or usage statistics appear.

The compact **TESTNET - no real money** notice remains visible on every screen, including invalid configuration. It describes the practice network and reset risk. The footer and prototype section distinguish the deployed synthetic contract demonstration from signed browser-flow evidence, an audit and a real pilot.

## Visual system

- Palette: existing blue `#1d4ed8`, strong blue `#1e40af`, ink `#17233b`, supporting slate `#475467`, white `#ffffff`, cool neutral `#f6f8fb`. Status tones retain their existing meanings and visible text.
- Fonts: existing local system sans stack; no remote font request or added font dependency. Exact-copy addresses and hashes retain monospace.
- Type: desktop landing display `clamp(40px, 5.3vw, 76px)` at 1.04 line-height; mobile display `clamp(40px, 9vw, 60px)`; section title 32px/1.15; workspace title 36px/1.15 (32px on mobile); body 16px/1.6; landing description 18px/1.65 (16px mobile); supporting text 14px/1.55; field labels 15px.
- Layout: landing maximum 1200px; workspace maximum 960px with a 720px form/read column. Desktop section rhythm 80px, mobile 48px. Spacing uses an 8px foundation; 1px borders, fluid typography, optical artwork coordinates and pill radii are deliberate exceptions.
- Shapes: role/prototype surfaces 24px radius, fields 10px, controls pill-shaped. Forms use restrained borders and no repeated drop shadows. Artwork supplies the soft studio light.
- Original local artwork: `public/schoolfees-studio.svg` depicts a wooden book/record sculpture with foliage. It is decorative, has empty alternative text and is hidden from assistive technology. No stock artwork, third-party scripts or remote assets are introduced.

## Workspace and transaction presentation

Create groups asset/reference separately from amount/timing, keeping the original validation and disabled fieldset. The signing note explains the next wallet review without changing preparation or signing. The fee summary emphasizes **Still owed** but continues to show every original field, raw-unit warning and full status explanation. Existing payment/refund refresh, error wording, wallet lifecycle, network refusal and explorer links are preserved.

The landing-page disclosure explains public data, raw units, reset risk and unsupported capabilities. This is a native keyboard-operable `details`/`summary`, not a custom modal. It does not hide the visible testnet banner or current prototype scope.

## Interaction and verification

Controls retain a 44px minimum touch height; inputs are 52px. Blue focus outlines remain visible, main receives focus after page changes, and initial page loading does not automatically draw a focus frame. Color transitions last 180ms with ease; no decorative animation. Reduced-motion disables transitions and animations, including pseudo-elements.

Browser checks cover 320, 390, 768 and 1440px, expanded disclosure, disconnected and mocked-connected workspaces, loaded fee summaries, keyboard skip/focus, CSS 200% zoom simulation and reduced motion. Rendered text contrast is measured after transitions settle, with ancestor alpha compositing. Axe checks are automated evidence, not an accessibility audit or screen-reader sign-off. No funded browser action is part of design verification; the final dated results are recorded in `TESTING.md` and the workspace submission report.
