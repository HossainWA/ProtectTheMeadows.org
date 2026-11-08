# protectthemeadows.org: how our website works

This folder IS the website. You can change it, add pages, and publish it.
You do not need to install anything. A browser and a text editor are enough.

## What is in the folder

| File or folder | What it is |
|---|---|
| `index.html` | The home page (the meadow you can step on) |
| `meadowguard.html` | How MeadowGuard works |
| `team.html` | Meet the team |
| `template.html` | A blank page to copy when you start a new page |
| `styleguide.html` | A menu of blocks (cards, photos, code boxes...) with code you can copy |
| `images/` | Put every photo here |
| `css/style.css` | The look of the whole site (colors, fonts). You almost never need to touch it |
| `js/site.js` | The menu at the top. This is where you add new pages to the menu |

## Look at the site on your computer

Double-click `index.html`. It opens in your browser. Change a file, save it, press refresh.
(You need to be online so the fonts load.)

## Add a new page in 5 steps

1. **Copy** `template.html` and name the copy something like `research.html`. Use small letters, no spaces.
2. **Open** your new file in a text editor (Notepad works. VS Code is nicer).
3. **Fill in the yellow spots.** (Photo descriptions that start with `alt="TODO:` are spots too. Replace the whole description.) Every `<span class="todo">...</span>` is a spot to write your own words. Delete the `<span class="todo">` and `</span>` parts when you are done so the yellow goes away. Also change the `<title>` near the top.
4. **Add it to the menu.** Open `js/site.js`, copy one line in the `PAGES` list, and change the title and file name:
   ```js
   { title: "Research", href: "research.html" }
   ```
   (Put a comma at the end of the line above it.)
5. **Look at it.** Open the page in your browser. Check it on a phone, too.

Need a different block? Open `styleguide.html`, copy the code under the block you like, and paste it into your page between the `<main>` lines.

## Add a photo

1. Save the picture in the `images` folder. Use a short name with small letters, like `meadow-trip.jpg`.
2. In your page, use it like this: `<img src="images/meadow-trip.jpg" alt="Kids looking at flowers from the trail">`
3. Always write the `alt` words. They describe the photo for people who cannot see it.
4. Keep photos under about 500 KB so the page loads fast. Phone photos are often much bigger. Free sites like squoosh.app can shrink them.

## Ask Claude to help

Paste `template.html` and `styleguide.html` into Claude and say something like:

> I'm on the NovaBots FLL team. Here is my template.html and styleguide.html. Make me a new page called "Research" with a title, a short intro, three cards (what we read, who we asked, what we found) and a spot for a photo. Use only the blocks from the styleguide. Keep the words simple. Wrap anything you don't know in `<span class="todo">` so I can fill it in.

Then read what it wrote. If something is not true, fix it. Claude can be wrong.

## Rules for our website

- **Ask a grown-up before you post a photo or a name of any kid.** First names only. No last names, no school, no address.
- **Only write true things.** If you use a number, say where it came from and add a link.
- **Fill in every yellow spot** before you publish. Search for `todo` to find the ones you missed.
- **Check on a phone** before you publish.

## Publish it (a grown-up sets this up once)

**Option A: simplest.** Go to Netlify's drag-and-drop page, sign in, and drop this whole folder in. To update the site later, drop the folder again. Then add `www.protectthemeadows.org` under the site's domain settings and follow the DNS steps it shows.

**Option B: best for a team.** Put the folder on GitHub, then connect it to a free host (Cloudflare Pages or GitHub Pages). After that, every time a kid uploads a changed file on github.com ("Add file", then "Upload files"), the website updates by itself. GitHub also remembers every older version, so a mistake is easy to undo.

Menu names on these sites change now and then. If a step looks different, search for the host's current "deploy a static site" guide.

**Make `www` work.** The printed sign points to `https://www.protectthemeadows.org`. Set `www` as the main address and make the plain `protectthemeadows.org` forward to it.

## If something looks broken

- **The menu is missing:** check that `js/site.js` still has a comma after every line in `PAGES` except the last, and that your page has `<div id="site-header"></div>`.
- **A photo does not show:** check the file name and that it is in `images/`. Capital letters matter.
- **A page looks plain:** check the `<link rel="stylesheet" href="css/style.css">` line at the top.
