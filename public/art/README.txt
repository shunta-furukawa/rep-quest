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


2026-09-27 — Exercise setup illustrations and quest medallions
Built-in image_gen used for all eight images (transparent alpha).
Character: same neutral adult in cream/navy training clothes and navy cloth cap.
Style reference: sword.webp JRPG sprite sheet; palette follows guild-dusk.webp.

guide/pushup.webp prompt:
Use case: stylized-concept. ONE transparent square exercise instruction sprite for REP QUEST. Use reference as EXACT SAME PERSON AND PIXEL-ART STYLE: neutral adult, all hair covered by navy close-fitting cloth cap, fitted antique-cream short-sleeve training shirt with restrained old gold seams, navy trousers, soft navy shoes, no weapons/armor/cape/class symbols. Detailed 2D JRPG crisp pixel clusters. True side profile facing RIGHT, full body anatomically correct, one pose only. Smartphone clearly visible, dark screen with pale cyan glowing rim; phone location is essential. Genuine transparent alpha, no ground shadow, floor plane, scenery, words,numbers,arrows,logo,border,watermark. Center subject+phone in square with10%margin. Designed for220px display.
Pose: Bottom of a PUSH-UP. Straight body held just above invisible floor, toes and palms support body. Elbows deeply bent backwards, chest lowered to hand level. Neck neutral, chin barely above smartphone screen: phone lies flat screen UP under upper chest/chin, directly beneath chin's projected vertical line so chin can touch near edge when lowered a little more. Phone must be visible beyond near palm, not hidden by body. NOT a forearm plank: palms on floor, elbows suspended off floor, forearms diagonally oriented. Full extended legs.

guide/squat.webp prompt:
Use case: stylized-concept. ONE transparent square exercise instruction sprite for REP QUEST. Use reference as EXACT SAME PERSON AND PIXEL-ART STYLE: neutral adult, all hair covered by navy close-fitting cloth cap, fitted antique-cream short-sleeve training shirt with restrained old gold seams, navy trousers, soft navy shoes, no weapons/armor/cape/class symbols. Detailed 2D JRPG crisp pixel clusters. True side profile facing RIGHT, full body anatomically correct, one pose only. Smartphone clearly visible, dark screen with pale cyan glowing rim; phone location is essential. Genuine transparent alpha, no ground shadow, floor plane, scenery, words,numbers,arrows,logo,border,watermark. Center subject+phone in square with10%margin. Designed for220px display.
Pose: Standing UPRIGHT in ready position BEFORE a squat, knees straight, feet shoulder width. Both hands hold smartphone at sternum/chest height close to body, screen faces person (left), glowing cyan edge visible in true side view. Head looks slightly toward phone. Both arms bent elbows beside ribs. Full body from head to soles centered. Feet slight stagger in profile reveals far foot but shoulders remain exact side profile. No crouching.

guide/plank.webp prompt:
Use case: stylized-concept. Create ONE transparent square exercise instruction sprite for fantasy RPG REP QUEST. Style reference sprite sheet: detailed 2D JRPG pixel art, tall natural adult proportions, crisp deliberate pixel clusters, not voxel 3D. ONE neutral adult adventurer in fitted muted antique-cream short-sleeve training shirt with tiny old-gold seams, navy straight training trousers and simple soft navy shoes. Close-fitting navy cloth skullcap covers ALL hair; neutral face, no beard, no weapons, armor, cape or class insignia. Exact true SIDE PROFILE facing RIGHT. FOREARM PLANK: elbows on invisible floor directly vertically under shoulders, forearms extend right and hands rest on floor; straight neutral head-neck-back-hips-knees-heels line, belly lifted, toes on floor. Both arms anatomically correct, far arm partly visible. Head looking down, no bent hips. Smartphone unmistakably visible on floor in front of face to right of hands, screen facing UP, pale cyan glowing outline around dark cyan screen, moderate oversized for legibility. A subtle thin antique-gold alignment cue along straight back is allowed but no arrows. Entire figure and phone centered within square with at least10% empty margins; long body spans80%width, vertical middle, do NOT fill with scenery. TRUE transparent alpha background. No floor plane, cast ground shadow, text, numbers, logos, frame, watermark, extra poses. Designed to read at220px wide.

guide/superman.webp prompt:
Use case: stylized-concept. ONE transparent square exercise instruction sprite for REP QUEST. Use reference as EXACT SAME PERSON AND PIXEL-ART STYLE: neutral adult, all hair covered by navy close-fitting cloth cap, fitted antique-cream short-sleeve training shirt with restrained old gold seams, navy trousers, soft navy shoes, no weapons/armor/cape/class symbols. Detailed 2D JRPG crisp pixel clusters. True side profile facing RIGHT, full body anatomically correct, one pose only. Smartphone clearly visible, dark screen with pale cyan glowing rim; phone location is essential. Genuine transparent alpha, no ground shadow, floor plane, scenery, words,numbers,arrows,logo,border,watermark. Center subject+phone in square with10%margin. Designed for220px display.
Pose: SUPERMAN floor hold, true side view facing right, NOT kneeling and NOT pushup. Lie prone with LOWER ABDOMEN and pelvis visibly resting on invisible floor, chest only slightly raised. BOTH arms extended straight forward to RIGHT past head, hands hover just a LITTLE above floor. BOTH legs extended straight to LEFT, knees straight, feet hover just a LITTLE above floor. Gaze straight down, neck neutral, not looking forward. Mild shallow arch, not extreme backbend. Smartphone lies screen UP on floor below face, between head and forward hands, clearly separate from hands. No hand/foot touching ground; abdomen supports pose.

quest/pushup.webp prompt:
Create ONE quest medallion using reference icon as exact style, rim, colors, dimensions and layout template. Preserve same circular antique-gold plain chunky rim and midnight navy disk, transparent outside, square canvas,3%margin. Replace ONLY central cyan posture pictogram. Pose: BOTTOM OF PUSH-UP side profile facing right, body horizontal low to floor, head low, palms planted below chest, elbows sharply bent UP and backwards and suspended off ground. Thick angular folded arm forms visible navy triangular gap, NOT an L-shaped forearm on floor. Long straight legs, toes on floor. Low horizontal silhouette. Make broad thick solid cyan silhouette very legible at28px, crisp chunky pixel-art edge. Same neutral adult person as reference, round simple head. No thin lines, fine details, phones, arrows, words, numbers, logos, decorations, extra figures, watermark. Center the silhouette inside disk with clear negative space.

quest/squat.webp prompt:
Create ONE quest medallion using reference icon as exact style, rim, colors, dimensions and layout template. Preserve same circular antique-gold plain chunky rim and midnight navy disk, transparent outside, square canvas,3%margin. Replace ONLY central cyan posture pictogram. Pose: Standing upright side-profile facing right BEFORE squat, torso vertical, legs straight, feet shoulder width slightly staggered visible as two feet, both elbows bent with hands held together at chest level. NO smartphone drawn. Clearly vertical standing silhouette, not crouched. Make broad thick solid cyan silhouette very legible at28px, crisp chunky pixel-art edge. Same neutral adult person as reference, round simple head. No thin lines, fine details, phones, arrows, words, numbers, logos, decorations, extra figures, watermark. Center the silhouette inside disk with clear negative space.

quest/plank.webp prompt:
Create ONE square RPG quest icon, exactly one circular medallion on genuine transparent background. Medallion fills94%canvas, centered3%margin. Simple thick antique-gold circular rim, solid midnight navy interior. Inside: ONE VERY BOLD FLAT CYAN silhouette of an adult doing FOREARM PLANK true side view facing RIGHT: straight head-to-heel body angled slightly up to right, elbow under shoulder contacting baseline, forearm projects right horizontally. Round plain head, no facial details, no hair. Deliberately simplify body and limbs with substantial thickness. Distinct open navy negative space under belly and around elbow. Large silhouette nearly fills medallion interior. Pixel-art-influenced crisp chunky edges matching JRPG UI, NOT ornate engraving. Must read at28px. Gold rim plain continuous ring, no thin decorations. NO smartphone, text, letters,numbers, logos, crest symbols, weapons, background outside circle, watermark. Entire circle visible, no square panel.

quest/superman.webp prompt:
Create ONE quest medallion using reference icon as exact style, rim, colors, dimensions and layout template. Preserve same circular antique-gold plain chunky rim and midnight navy disk, transparent outside, square canvas,3%margin. Replace ONLY central cyan posture pictogram. Pose: Prone SUPERMAN hold facing right. Abdomen is lowest support point; both straight legs extend LEFT and float slightly upward; arms fully extended FORWARD to RIGHT above floor past head. Head faces down. Long shallow curved silhouette with outstretched arms, flying-like but shallow arch, no bent elbows, no knees on ground. Make broad thick solid cyan silhouette very legible at28px, crisp chunky pixel-art edge. Same neutral adult person as reference, round simple head. No thin lines, fine details, phones, arrows, words, numbers, logos, decorations, extra figures, watermark. Center the silhouette inside disk with clear negative space.

Processing:
- Source PNG alpha retained; bound subject using alpha >8 to ignore near-invisible edge noise.
- Crop transparent margins; resize without distortion with Lanczos3.
- Guide: fit subject and phone inside 640x640, center on transparent 800x800.
  At least 80px (10%) padding on each edge; naturally more above horizontal poses.
- Quest: fit medallion inside 240x240, center on transparent 256x256 (8px padding).
- Encode WebP quality90, alphaQuality100, effort6 using sharp.
- No redrawing or background removal outside image_gen. Only crop, resize, centering and encoding.


2026-09-27 — v16 movement pairs and readable quest medallions
Generated with the built-in image_gen tool (transparent alpha). The existing plank guide was used as the neutral adventurer/style reference. Start poses were generated first; each end pose was edited from its own start pose on the same 1280px square canvas. Existing quest plank was a palette/rim reference only.

GUIDE squat
Use case: stylized-concept. Create one exercise guide animation frame for REP QUEST. Reference image is STYLE AND CHARACTER reference only. Same neutral adult adventurer: navy cloth cap concealing hair, cream short sleeved training shirt with tiny old gold seams, navy trousers and soft navy shoes, no armor/weapons. Detailed 2D JRPG pixel illustration on actual transparent background, full body strict right-facing side view. SQUAT START frame: standing upright, both feet planted shoulder width apart (side view shows near shoe fully and far shoe offset slightly), holding a small slim smartphone in BOTH hands at chest height, screen facing own face, very visible pale cyan luminous rim. Square canvas 1024x1024. Lock floor contact line to y=870. Near shoe sole from x=450 to x=590, far shoe x=475 to x=615; head top approx y=135. Use normal adult 7-head anatomy. Full body height approx 735. No floor line, shadow, lettering, arrows, furniture, background, or extra elements. Leave room on LEFT for the hips to move backward in the next crouched frame. This is the first frame of a two-frame animation so proportions, shoe footprints, and camera must be precisely reusable.

GUIDE squat-2
Use case: precise-object-edit. Edit this exact sprite as frame 2 of an exercise animation. SAME 1280x1280 transparent canvas, SAME character, clothing, camera, scale, head size and limb lengths. Change ONLY articulated pose above shoes to a PARALLEL SQUAT: hips move backwards LEFT and down, thighs horizontal parallel with ground, shins slope forwards moderately, heels planted, back straight and gently tilted forward, chest holding SAME cyan edged phone with both hands. Head and torso move DOWN together; do not enlarge crouching character to fill canvas. CRITICAL: both shoes must remain pixel-for-pixel fixed at exact same coordinates (near shoe from approx x=578..752 y=1060..1138, far shoe x=655..795 y=1040..1103). No translation of feet, no added floor shadow. Shoes' shape and orientation same as reference. Knee approx x=805 y=860, hip approx x=520 y=840, shoulders approx x=615 y=530, head approx x=650 y=420. Entire pose remains at same original scale. Phone travels down with chest. True side view. No text, no floor, no arrows, no ghost figure; exactly ONE crouched character, actual alpha transparency.

GUIDE pushup
Use case: stylized-concept. Create one exercise guide animation frame for REP QUEST. Reference image is STYLE AND CHARACTER reference only. Same neutral adult adventurer: navy cloth cap concealing hair, cream short sleeved training shirt with tiny old gold seams, navy trousers and soft navy shoes. Detailed 2D JRPG pixel illustration on actual transparent background, full body strict right-facing side view. PUSHUP START TOP POSITION: hands flat on invisible floor, elbows fully STRAIGHT, arms vertical beneath shoulders, straight body slopes upward from toes at left to shoulders at right, head in line looking down. Put small slim smartphone screen up on floor directly under upper chest/chin, conspicuous cyan rim. Square 1024x1024 canvas; subject occupies x=100 to x=900. Lock contact floor y=720. Toe tip contact at (125,720); near palm heel (805,720), fingers extend right to (870,720); far palm slightly offset behind, same floor. Phone center (892,707), separate from palms and directly below head. Shoulder approx (800,390), hips (455,540), head near(865,430). Keep straight natural adult anatomy. Full figure and phone, no floor, no shadow, no lines, lettering, arrows, furniture, background or extra elements. This is animation frame 1: preserve phone and hand/toe contact positions for next lowered frame.

GUIDE pushup-2
Use case: precise-object-edit. Edit this exact sprite as frame 2 of an exercise animation. SAME 1280x1280 transparent canvas, SAME character, clothing, camera, scale, head size, limb lengths. Change ONLY articulated body to PUSHUP BOTTOM: elbows bent backwards LEFT at about90degrees, upper body lowered, head chest hips and legs form long nearly horizontal straight line, chin immediately above cyan smartphone, chest just above ground. CRITICAL fixed contact anchors: keep toe and whole left shoe EXACTLY pixel-for-pixel at current x80..190,y775..905; keep both hands flat EXACTLY at x975..1117,y858..905; keep cyan smartphone EXACTLY pixel-for-pixel at x1118..1228,y860..914. Do not translate, resize, rotate or redraw these contact parts. Bend elbows back toward left, shoulders move forward/right and downward naturally, shoulder around(1070,690), elbows(920,790), head(1160,790), chin at (1180,864), pelvis(650,750). It must look like descent from starting pushup with same foot/palm anchors, no sliding. Same strict right-facing profile. No floor, no shadow, no text, no arrows, no ghosting, exactly ONE lowered person, actual transparent alpha.

QUEST squat
Use case: logo-brand. Redesign ONE tiny REP QUEST exercise medallion icon. Reference image for palette and circular gold ring ONLY; replace its pictogram. Perfect circular medallion fills94% of square canvas, thin simple OLD GOLD rim of uniform thickness, solid DARK NAVY interior, actual transparent outside. One bold solid luminous CYAN human pictogram. Flat minimal very thick smooth pixel-friendly silhouettes, NO detailed person/clothes/hair, no gradients within figure, NO phone, NO ground line, no letters/numbers, no decorations. Designed to remain obvious at28x28px: silhouette limbs minimum width9% of disk diameter, head diameter17%. Maximize figure within ring with navy gap around it. Right-facing side view. DEEP SQUAT silhouette: head upper right, torso upright in center; butt low at centerleft, THIGHS HORIZONTAL projecting right, bent knees and lower legs descend LEFT to flat feet. Folded zigzag legs, compact crouched shape; both arms extend forwards horizontally at shoulder height. Make a large unmistakable deep crouch, not standing, not sitting on a chair.

QUEST pushup
Use case: logo-brand. Redesign ONE tiny REP QUEST exercise medallion icon. Reference image for palette and circular gold ring ONLY; replace its pictogram. Perfect circular medallion fills94% of square canvas, thin simple OLD GOLD rim of uniform thickness, solid DARK NAVY interior, actual transparent outside. One bold solid luminous CYAN human pictogram. Flat minimal very thick smooth pixel-friendly silhouettes, NO detailed person/clothes/hair, no gradients within figure, NO phone, NO ground line, no letters/numbers, no decorations. Designed to remain obvious at28x28px: silhouette limbs minimum width9% of disk diameter, head diameter17%. Maximize figure within ring with navy gap around it. Right-facing side view. TOP PUSHUP silhouette: head at upper right, straight torso slants steeply upward RIGHT from toes at lower left. STRAIGHT LONG VERTICAL ARM drops from shoulder to lower-right palm. Strong open navy triangular space beneath torso between left toes and right vertical arm: the triangle must survive at28px. Clearly a lifted straight-arm pushup, NOT low plank. Use substantial silhouette width.

QUEST plank
Use case: logo-brand. Redesign ONE tiny REP QUEST exercise medallion icon. Reference image for palette and circular gold ring ONLY; replace its pictogram. Perfect circular medallion fills94% of square canvas, thin simple OLD GOLD rim of uniform thickness, solid DARK NAVY interior, actual transparent outside. One bold solid luminous CYAN human pictogram. Flat minimal very thick smooth pixel-friendly silhouettes, NO detailed person/clothes/hair, no gradients within figure, NO phone, NO ground line, no letters/numbers, no decorations. Designed to remain obvious at28x28px: silhouette limbs minimum width9% of disk diameter, head diameter17%. Maximize figure within ring with navy gap around it. Right-facing side view. FOREARM PLANK silhouette: head at right, body a THICK HORIZONTAL BEAM from left feet to right shoulders. SHORT arm drops VERTICALLY from shoulder to elbow, then SHORT forearm goes right HORIZONTALLY along floor. Clear chunky right angle elbow underneath head. Entire torso perfectly horizontal, not diagonal like top pushup. Need obvious elbow L-shape and small open navy gap underbody.

QUEST superman
Use case: logo-brand. Redesign ONE tiny REP QUEST exercise medallion icon. Reference image for palette and circular gold ring ONLY; replace its pictogram. Perfect circular medallion fills94% of square canvas, thin simple OLD GOLD rim of uniform thickness, solid DARK NAVY interior, actual transparent outside. One bold solid luminous CYAN human pictogram. Flat minimal very thick smooth pixel-friendly silhouettes, NO detailed person/clothes/hair, no gradients within figure, NO phone, NO ground line, no letters/numbers, no decorations. Designed to remain obvious at28x28px: silhouette limbs minimum width9% of disk diameter, head diameter17%. Maximize figure within ring with navy gap around it. Right-facing side view. SUPERMAN prone back-extension silhouette: belly LOWEST in CENTER of disk, legs stretched LEFT and tilted UP, both arms stretched RIGHT and tilted UP; small head near right shoulder with gaze down. Unmistakable broad U / bow-shaped human silhouette, elevated hands and feet, belly dips deeply. NOT horizontal bar, not plank, not an airplane. Exaggerate curvature for28px legibility. Arms remain long forward reaching and legs long backward reaching, no standing support arms.

Processing and registration:
- Guide pairs retain one shared coordinate system. Compute the union of BOTH alpha bounds (alpha > 8), use that SAME crop for both frames, resize with one common scale to fit 640x640, and center in identical 800x800 transparent canvases. Never auto-trim or independently center the second frame.
- Squat source union crop: x496 y97 w423 h1044, rendered 259x640. Pushup source union crop: x74 y408 w1170 h503, rendered 640x275.
- To remove generative sampling drift at stationary contacts, reuse the first generated frame's stationary pixels in frame two before the shared transform. Source rectangles (left,top,right,bottom, exclusive): squat shoes [550,1066,820,1170]; pushup toe contact [60,880,205,930], palm contact [980,887,1117,930], phone [1117,864,1250,930]. No moving joints/body were redrawn in processing. Squat phone moves down with the chest as intended.
- Guides: lossless WebP with alpha, effort 6, all below 200KB. Lossless preserves the common contact pixels.
- Icons: alpha-bound crop, fit inside 240x240, center on transparent 256x256 canvas (about 3% margin). WebP quality 90, alphaQuality 100, effort 6, each below 40KB. Review at 28px and 56px on navy.
- Keep plank/superman guide illustrations unchanged. Register only the two added second-frame paths in service-worker FILES and bump CACHE to rep-quest-v16.
