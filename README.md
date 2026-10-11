# EPOS Companion website

A single-page marketing site for the EPOS Companion Windows till and iPhone app.

## Files

```
index.html        Page content and section order
css/styles.css    All styling. Colours and fonts are tokens at the top of the file
js/main.js        3D hero, live till demo, till screen viewer, iPhone app tour and 3D logo
screens/          Screenshots: pc-*.webp are the Windows till, the .jpg files are the iPhone app
```

## Previewing

Open the folder in VS Code and run it with the **Live Server** extension (right-click `index.html` → Open with Live Server).

You can also double-click `index.html`, but browsers block images inside WebGL when a page is opened straight from disk. The 3D till and phone then show drawn placeholders instead of your real screens. Everything else works the same.

The page loads three.js and Google Fonts from the internet, so preview it while online.

## Common changes

| To change | Where |
| --- | --- |
| Headlines, paragraphs, FAQ answers | `index.html` |
| Brand colours (navy, cream, orange) | `css/styles.css`, the `--paper`, `--ink`, `--tear` and `--night` tokens at the top. Dark mode values are in the two blocks just below |
| The till's colours used in the demo | `css/styles.css`, the `--t-*` tokens |
| The iPhone app's colours | `css/styles.css`, the `--a-*` tokens |
| Demo products, prices and VAT rates | `js/main.js`, the `P` object under `DEMO TILL` |
| Starting dashboard figures in the demo | `js/main.js`, the `S` object just below `P` |
| Till screen titles and descriptions | `js/main.js`, the `PC` array under `THE PC TILL` |
| Which till screens the 3D monitor cycles through | `js/main.js`, `TILL_SHOTS` |
| iPhone tour titles and descriptions | `js/main.js`, the `SCREENS` array under `APP TOUR` |
| The printed receipt layout | `js/main.js`, `receiptText()` for the demo and `drawReceipt()` for the 3D printer |

## Swapping a till screenshot

Till screens are 3840 × 2064 (a 1920 × 1032 window rendered at 2× for sharp high-DPI displays). A real 1080p screenshot of the maximized till, without the taskbar, also fits: save it as lossless WebP or PNG over the matching `screens/pc-*.webp` file. If you use PNG, update the extension in `PC` and `TILL_SHOTS` in `js/main.js`.
