REP QUEST pixel adventurers
Generated with the built-in image generation tool, based on the approved class progression concept.
Each class atlas: 1152x1040, six columns x five rows. Cell: 192x208.
Columns: idle / alternate idle / windup / strike / victory / recovery.
Rows: five growth stages, from apprentice to hero. Baseline y190.
Sprite extraction uses connected-component isolation to discard adjacent character fragments,
nearest-neighbor resizing and baseline alignment. Hair-only masks preserve customization.
Mage alternate idle is excluded from runtime because it did not retain the staff.

Prompt direction: adult chestnut-haired male, 5.5 heads tall, crisp detailed 2D JRPG pixel art,
navy/teal/antique gold palette, same face and costume per row, transparent background,
full-body 6x5 atlas, no labels or scenery. Five ranks progress from plain cloth to leather,
partial armor/ornate robes, advanced navy-gold equipment and cyan rune weapons.
Six poses per rank: idle, breathing, attack preparation, follow-through, proud victory,
and recovery. Sword: longsword/shield/cape; mage: crystal staff/robes; rogue: twin daggers/cloak.
Original atlas sources are generated images in the conversation. This folder contains game-ready
extracted derivatives rather than the prior concept board. No 3D dependency required.

Mage display normalization: stage scales 1.34/1.35/1.32/1.27/1.24, centered on x96 and anchored at foot baseline y190. Applied after hair compositing in the shared portrait/animation renderer. All six poses fit the canvas after scaling.


v0.9 enemy families — built-in image_gen (six separate generations, transparent_background=true).
Artwork: mushroom / wolf / skeleton / wisp / mimic / dragon, all facing left.
Primary teal color allows palette swaps while preserving pixel shading.
Processing: Sharp trim({threshold:10}) on original alpha, then fit inside 156x186 using
nearest-neighbor (no smoothing). Composite centered into a 160px-wide transparent canvas,
height = resized sprite height + 4. Top/bottom padding 2px, baseline = height - 2.
Export lossless WebP preserving alpha. No background removal, recoloring or generative edits
were performed in the conversion. Shapes and outlines were visually checked at game size.
Dimensions: mushroom 160x148, wolf 160x101, skeleton 160x190, wisp 160x159,
mimic 160x152, dragon 160x125. Existing three sprite files are unchanged.
Region colors are CSS filters in motivation.js, with separate values per family.
Visual review page: /monster-preview.html (uses the same renderBestiary as the app).

Exact generation prompts:

mushroom.webp
Use case: stylized-concept. Production REP QUEST enemy sprite matching refined 2D JRPG pixel art: crisp pixel clusters, rich but limited colors, dark navy outlines, tiny antique gold accents. Exactly ONE whole creature, facing LEFT toward the hero, idle battle pose. Transparent background. No text, no scenery, no floor, no ground shadow, no other creatures. Full body and all extremities visible with clear transparent margins. One strong dominant TEAL hue on the main body/costume so CSS hue-rotate variants are readable. Hand-crafted pixel art rather than smooth painting or voxel 3D. Readable after nearest-neighbor downscale to 160px wide. The bottom-most feet/body establish a common contact baseline.
Subject: A walking mushroom monster. Broad teal cap with pale spots, short cream stem body with a stern left-facing face, two tiny root feet and root arms. Squat, strong mushroom silhouette.

wolf.webp
Use case: stylized-concept. Production REP QUEST enemy sprite matching refined 2D JRPG pixel art: crisp pixel clusters, rich but limited colors, dark navy outlines, tiny antique gold accents. Exactly ONE whole creature, facing LEFT toward the hero, idle battle pose. Transparent background. No text, no scenery, no floor, no ground shadow, no other creatures. Full body and all extremities visible with clear transparent margins. One strong dominant TEAL hue on the main body/costume so CSS hue-rotate variants are readable. Hand-crafted pixel art rather than smooth painting or voxel 3D. Readable after nearest-neighbor downscale to 160px wide. The bottom-most feet/body establish a common contact baseline.
Subject: A lean fantasy wolf, on four paws, profile LEFT, long snout with visible nose on LEFT, swept tail on RIGHT, teal fur, pale chest and muzzle, navy shading. Alert but not howling.

skeleton.webp
Use case: stylized-concept. Production REP QUEST enemy sprite matching refined 2D JRPG pixel art: crisp pixel clusters, rich but limited colors, dark navy outlines, tiny antique gold accents. Exactly ONE whole creature, facing LEFT toward the hero, idle battle pose. Transparent background. No text, no scenery, no floor, no ground shadow, no other creatures. Full body and all extremities visible with clear transparent margins. One strong dominant TEAL hue on the main body/costume so CSS hue-rotate variants are readable. Hand-crafted pixel art rather than smooth painting or voxel 3D. Readable after nearest-neighbor downscale to 160px wide. The bottom-most feet/body establish a common contact baseline.
Subject: A skeleton soldier facing LEFT, ivory bones wearing a dominant teal tattered tabard and helmet with teal plume, small antique bronze round shield and short chipped sword, full visible boots/feet. Tall narrow biped silhouette.

wisp.webp
Use case: stylized-concept. Production REP QUEST enemy sprite matching refined 2D JRPG pixel art: crisp pixel clusters, rich but limited colors, dark navy outlines, tiny antique gold accents. Exactly ONE whole creature, facing LEFT toward the hero, idle battle pose. Transparent background. No text, no scenery, no floor, no ground shadow, no other creatures. Full body and all extremities visible with clear transparent margins. One strong dominant TEAL hue on the main body/costume so CSS hue-rotate variants are readable. Hand-crafted pixel art rather than smooth painting or voxel 3D. Readable after nearest-neighbor downscale to 160px wide. The bottom-most feet/body establish a common contact baseline.
Subject: A single magical will-o-the-wisp, a swirling teal flame spirit with tiny pale eyes looking LEFT, curling flame tail sweeping up to the RIGHT. Distinct asymmetrical teardrop silhouette. Contained hard-edged pixel flame with no large blurred glow cloud, no floating unrelated particles.

mimic.webp
Use case: stylized-concept. Production REP QUEST enemy sprite matching refined 2D JRPG pixel art: crisp pixel clusters, rich but limited colors, dark navy outlines, tiny antique gold accents. Exactly ONE whole creature, facing LEFT toward the hero, idle battle pose. Transparent background. No text, no scenery, no floor, no ground shadow, no other creatures. Full body and all extremities visible with clear transparent margins. One strong dominant TEAL hue on the main body/costume so CSS hue-rotate variants are readable. Hand-crafted pixel art rather than smooth painting or voxel 3D. Readable after nearest-neighbor downscale to 160px wide. The bottom-most feet/body establish a common contact baseline.
Subject: A treasure chest mimic monster facing LEFT, teal-painted wooden chest with navy iron bands and small antique gold lock, lid open as huge toothy mouth facing LEFT, pale teeth and short curled teal tongue, tiny clawed feet underneath. Boxy silhouette.

dragon.webp
Use case: stylized-concept. Production REP QUEST enemy sprite matching refined 2D JRPG pixel art: crisp pixel clusters, rich but limited colors, dark navy outlines, tiny antique gold accents. Exactly ONE whole creature, facing LEFT toward the hero, idle battle pose. Transparent background. No text, no scenery, no floor, no ground shadow, no other creatures. Full body and all extremities visible with clear transparent margins. One strong dominant TEAL hue on the main body/costume so CSS hue-rotate variants are readable. Hand-crafted pixel art rather than smooth painting or voxel 3D. Readable after nearest-neighbor downscale to 160px wide. The bottom-most feet/body establish a common contact baseline.
Subject: A small young dragon facing LEFT in side three-quarter view, teal scales, pale underbelly, two folded batlike wings, small gold horns, snout LEFT and curving tail RIGHT, four little legs with all feet visible. Mature detailed fantasy pixel sprite, not cute chibi. Compact dragon silhouette.

Browser palette review: all seven rows rendered with CSS filters. The old star-region bat
was magenta, so it was adjusted from +30deg to -15deg with saturation 1.15 and brightness 1.2
to match the purple region. New families use individually tuned saturation/brightness values.
The shared bestiary renderer was checked at 320, 375 and 390px outer widths.
