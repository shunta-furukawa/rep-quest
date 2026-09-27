REP QUEST — Guild artwork, 2026-09-26

Art direction: the user-approved voxel medieval floating-island guild concept.
Palette: midnight navy #07131f, antique gold #e6c38a, cyan #7ce6ee, amber light.

guild-dusk.webp: generated with the built-in image generation tool, then resized
and encoded as WebP. Final prompt:
Create a production background for the REP QUEST mobile RPG. Richly detailed
voxel medieval floating-island adventurers' guild at blue hour, navy sky,
distant floating castle, cyan rune portal, timber and mossy stone guild house
with warm amber lanterns, clear dark courtyard for an animated 3D hero.
Use the user's concept board as art direction. No people, foreground campfire,
text, logos, UI, phone, or border. Cinematic cubic craftsmanship.

wordmark.svg: outlined Nimbus Roman Bold lettering with a custom Q/rune emblem.
Nimbus Roman is part of URW Base 35 (AGPL with font exception); the SVG contains
outlines, not an embedded font. Other SVG artwork is authored for this project.
PWA icons are rasterized from ../icon.svg at 180/192/512 px. The central rune
fits within the maskable icon safe area. No text or external font request.

UI frames use nine-slice SVG border images to preserve corners at any width.
Exercise icons are SVG pictograms, not platform-dependent emoji.


2026-09-26 — Image-generated logo replacement
Both the title and app emblem now use the built-in image generation tool.
Active title: public/art/wordmark-generated.webp (1200 x 282, transparent).
Active PWA assets: public/icon-generated-{180,192,512}.png.
Earlier SVG logo/icon are retained as historical assets, not used by the UI.
Only transparent-margin trimming, resizing and encoding were applied after generation.

Title prompt:
Design a premium medieval fantasy RPG title logo reading exactly REP QUEST,
single horizontal wordmark, genuinely transparent background. Custom sculpted
Roman fantasy lettering, dramatic R and Q, sharply flared serifs, aged warm
gold metal, engraved bevels and bronze edges. Q is a gilded portal ring with
a luminous cyan four-point compass/star/sword rune and sweeping gold tail.
Readable at 280px on a navy mobile header. No other words, scenery or borders.

Icon prompt:
Use the generated title's Q as identity reference. Only the sculpted gold Q
portal ring and luminous cyan star, deep navy square background, no other
letters or borders. Same engraved gold and bronze edges, sweeping tail.
Central emblem with generous maskable padding; readable at 60px.


2026-09-27 — Astra region backgrounds and world map (v0.12 art)
Generated with built-in image_gen; guild-dusk.webp was the style reference.
No app logic, story coordinates, save data, or tuning changed.

REGIONAL BACKGROUNDS — shared prompt:
Use case: stylized-concept. Production environment background for REP QUEST. Reference image is STYLE ONLY: match its intricately crafted small cubic voxel medieval fantasy architecture, cinematic material texture, navy/teal/antique gold palette and amber accents. New scenery in Astra floating archipelago above clouds. Landscape 3:2. Blue hour twilight/predawn coherent across set. Clear flat unobstructed ground at lower center for overlay hero; bottom third darker and low contrast for app controls. Fill canvas. No characters, creatures, people, text, letters, logos, UI, borders, watermark. No foreground objects obstructing central stage.

forest.webp — scene prompt:
Moss-covered forest island below a guild's old stone steps. Ancient cubic trees and ferns frame a luminous cyan rune spring in middle distance; beside spring a small ancient beacon tower flickers weakly. Cool emerald accents, dim amber lamps along edges, clear dark stone clearing lower center, distant floating islands between trees.

highland.webp — scene prompt:
Windswept grassy highland floating island, rippling tall grass, hanging rope bridges linking distant islands, small weathered stone beacon on hill at upper right. Verdigris green grass, navy blue clouds, tiny warm lamps at bridge anchors. Broad flat dark grassy stone path in lower center.

lake.webp — scene prompt:
Floating island's mirror lake enveloped in milky pale mist, small blue ghost lights WITHOUT faces drift above reflective water around a lakeside beacon. Mossy stepped stone shores, silver-blue and cyan accents, sparse amber lanterns at sides. Dark flat dry stone terrace occupies lower central third, lake and beacon beyond.

ruins.webp — scene prompt:
Ruined ancient city of star readers on a floating island: carved geometric star motifs on stone, collapsed arcaded corridors, antique gold armillary celestial globe, silent beacon amid broken towers. Indigo/violet and cyan accents, small amber lanterns. Clear dark paved plaza in lower center, intricate architecture frames sides and background.

volcano.webp — scene prompt:
Volcanic floating island: basalt terraces, molten lava flowing through distant fissures, ruby crystals embedded in rock, ancient beacon on rim of crater. Deep navy sky, charcoal basalt, controlled crimson and amber glow, cyan glints in old stone beacon. Broad safe flat dark basalt ground lower center, no lava or gems blocking foreground stage.

summit.webp — scene prompt:
Highest mountain floating peak piercing sea of clouds. Monumental ancient great beacon stands in upper middle distance, subtle cyan stellar streams converge toward it from distant islands. Sky just before dawn, navy blue above and a very restrained pale gold horizon, frosted stone and antique gold details. Broad dark flat summit platform lower center, majestic quiet anticipation, no blinding central light.

world-map — prompt:
Use case: stylized-concept. Production game world map illustration, portrait EXACT 3:4 composition. Reference image STYLE ONLY: intricate cubic voxel medieval fantasy, navy blue, teal, antique gold materials, atmospheric clouds. Draw EXACTLY SIX separate small floating islands above a dark navy cloud sea, top-down slightly oblique view, NO horizon. Exact normalized placement is crucial: beacon center coordinates from upper left must be: forest (24%,84%); grassy highland (72%,74%); misty lake (28%,57%); star ruins (74%,42%); ruby volcano (27%,27%); snowy summit (62%,10%). Each island width about 25% canvas, compact shape. Each island's center contains ONE SMALL UNLIT stone beacon tower; tower central lantern chamber must be precisely at coordinate. Forest moss trees and tiny cyan rune spring; highland green windswept grass and short rope bridge within island; lake mirror pool milky mist blue wisps; ruins broken stone arcades and tiny gold armillary sphere; volcano dark crater red lava ruby crystals; summit pale mountain summit with grander but small UNLIT beacon. Only six islands, no extra land masses. All beacon lamps DARK, no glow. Ground and architecture cluster around specified centers. Keep regions 8–12% full image height below each island center dark, quiet, largely empty for later labels. Islands shallow vertically so labels below do not overlap rocks. Soft dark cloud texture background with restrained light, a few warm tiny environmental lamps but no lit beacons. NO lines, NO star streams, NO routes between islands. NO people, characters, text, labels, logos, UI, frame, watermark. Do not copy reference panoramic scene; it is strictly material/style reference.

world-map-edit — prompt:
Edit this world map only layout, preserve exactly its gorgeous six voxel islands, materials and navy clouds. Shrink ALL six islands to roughly 60% of current size so each island width equals 25% of canvas width, not current 45%. Reposition each entire island so CENTER OF DARK LANTERN CHAMBER in its beacon tower lands EXACTLY at these percent coordinates: forest x24 y84; grassland x72 y74; lake x28 y57; ruins x74 y42; volcano x27 y27; snowy summit x62 y10. Coordinates refer to full portrait canvas from upper left. This is essential alignment for live game markers. Keep same 3:4 full canvas. Extend empty dark clouds around islands. No additional islands, text or connecting lines. Beacon chambers unlit. Retain each motif. Keep dark cloud empty space below islands for labels. Small islands generously spaced, no large masses.

world-map-final — prompt:
Create final world map using image1 as STRICT layout template, image2 as art reference. Replace each ellipse with a small detailed voxel floating island of SAME WIDTH and SAME CENTER, terrain upper surface at ellipse position. Place a tiny UNLIT beacon tower with its DARK chamber exactly on each white cross. Preserve guide coordinates with pixel precision. Map canvas 3:4, 1200x1600 composition. Do not move or enlarge islands. Forest cross24%84%, grass highland72%74%, lake28%57%, star ruins74%42%, ruby volcano27%27%, snowy summit62%10%. Each width25% fullcanvas. High overhead oblique view means shallow vertical islands, no long roots! Dark navy low contrast clouds surround islands. Keep bottom half of each island dark and low detail for names overlaid later. SIX islands only, six unlit beacons only. No lines connecting islands. Image2 style and motif detail ONLY, not positions. Remove ALL guide circles, crosses and text from final image; no text labels symbols borders watermark or characters. Detailed cubic medieval stone, antique gold accents, teal, tiny warm lamps, coolblue nighttime. Exactly follow image1 layout.

map-cutouts — prompt:
Extract the SIX voxel islands from this image as isolated transparent cutouts, preserving their exact appearance and six separate positions in this portrait canvas. Remove ALL blue clouds and background; genuinely transparent alpha, including gaps between branches and rocks. All beacon lantern chambers dark/unlit. Keep forest, highland, lake, ruins, volcano, snowy summit; no added features, no text, no shadows outside islands. Six islands fully separate with generous transparent margins, no overlap. This is a sprite atlas for deterministic placement at exact game map coordinates.

map-clouds — prompt:
Production background layer for fantasy floating-island world map, portrait 3:4. ONLY a sea of dark midnight navy blue clouds viewed almost overhead, slightly oblique. Fine richly rendered atmospheric cubic-fantasy cloud texture, gentle teal blue hints, soft diffuse blue-hour lighting. Very low contrast, mostly dark #071526 navy, no bright white cloud patches. Uniform subdued visual weight, no horizon. NO islands, NO buildings, NO land, NO lights, NO stars, NO lines, NO objects, NO people, NO text, NO border. Empty map backdrop onto which separately generated island sprites will be placed.

PROCESSING:
- Regions: resize generated 1536x1024 PNGs to 1400x933, Lanczos3, encode
  WebP with sharp effort 6. Quality: forest/ruins 81; others 84. All <350,000 bytes.
- A single generated map could not reliably hit MAP_POINTS. Final map uses
  image-generated transparent island cutouts over an image-generated cloud layer.
  No procedural substitute artwork; only atlas separation, resize and placement.
- Transparent atlas: 1086x1448. Separate six large alpha-connected components
  (alpha >100); assign faint edge pixels to the nearest component, retaining alpha.
  Trim transparent margins. Resize each trimmed sprite to 300px wide (25% map width).
- Beacon chamber anchors in the source atlas (x,y):
  forest (298,1169), highland (784,1035), lake (345,752),
  ruins (796,556), volcano (313,330), summit (732,78).
- Place each anchor at the exact 1200x1600 MAP_POINTS pixel:
  forest (288,1344), highland (864,1184), lake (336,912),
  ruins (888,672), volcano (324,432), summit (744,160).
  Position = round(target - trimmed-anchor * 300 / trimmed-width).
  At most 0.5 source-output pixel rounding; no application coordinate changes.
- Cloud layer resize 1200x1600; alpha-composite the six resized sprites;
  encode WebP quality 84, effort 6. No connecting lines, labels or live lights
  baked in. Dark cloud space below islands is reserved for app overlays.
- Final files: regions/{forest,highland,lake,ruins,volcano,summit}.webp,
  world-map.webp. World map <450,000 bytes.

VERIFICATION:
- npm test: 45 tests passed. npm run build passed.
- Browser review: actual app in a single resizable iframe at 375x812 and
  320x568; home hero, journey strip and quest buttons remain legible.
- Map art loaded (has-art), six beacon markers match the six anchored towers.
  Existing map-label CSS starts about 4.2% map-height below each marker,
  so names overlap the lower island surfaces instead of the requested 8-12%
  cloud band. Application CSS was intentionally left unchanged.
- Review harness exists only on codex/art-viewport-review-v12, not main.
