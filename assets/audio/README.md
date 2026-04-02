# Audio Files for Charity: Water Game

This folder contains the sound effects for the game.

## Files Needed

1. **move.mp3** or **move.wav** - Sound effect for player movement (footstep)
2. **bucket.mp3** or **bucket.wav** - Sound effect for pushing buckets (optional, integrated as same sound now)
3. **cheer.mp3** or **cheer.wav** - Short cheer sound effect when level is completed (plays only first 2 seconds)

## How to Add Sound Effects

### Option 1: Use Freesound.org (Recommended - Free & Legal)

1. Go to https://freesound.org
2. Search for:
   - **"footstep"** or **"wooden_step_quiet"** for player movement
   - **"bucket_push"**, **"metal_drag"**, or **"box_slide"** for bucket sound
3. Download the MP3 or WAV file
4. Place the file in this folder and rename to `move.mp3`/`move.wav` or `bucket.mp3`/`bucket.wav`

### Option 2: Use Zapsplat.com (Free, No Attribution)

- https://www.zapsplat.com/music/sound-effects/
- Search for footstep and bucket/metal sounds

### Option 3: Use Pixabay Sounds (Free, No Attribution)

- https://pixabay.com/sound-effects/
- Search for footstep and push/drag sounds

## File Format

- Supported formats: MP3 (preferred) or WAV
- Name files exactly as: `move.mp3` and `bucket.mp3`
- The HTML will look for both MP3 and WAV formats as fallbacks

## Once Downloaded

1. Download your chosen sound effect (keep it < 2 seconds for UI responsiveness)
2. Save as `move.mp3` or `bucket.mp3` in this folder
3. Refresh your browser - the sounds should play when you:
   - Move the player → triggers `move.mp3`
   - Push a bucket → triggers `bucket.mp3`

## Testing

- Open the game in your browser
- Move the player around (should hear footstep sound)
- Push a bucket onto soil (should hear bucket sound)
- Check browser console (F12) for any audio errors

## Recommended Sound Effects

### Player Move

- Short (0.3-0.5 seconds) footstep or gentle thud sound
- Mid-range frequencies
- Not too loud (should not startle player)

### Bucket Push

- Short (0.4-0.7 seconds) metallic drag or sliding sound
- Distinctive from move sound
- Satisfying "push" feel

## Troubleshooting

If sounds don't play:

1. Check browser console (F12 → Console tab) for errors
2. Ensure files are named exactly: `move.mp3` and `bucket.mp3`
3. Check that audio files are in this `assets/audio/` folder
4. Try different file format (MP3 vs WAV)
5. Check browser volume isn't muted
