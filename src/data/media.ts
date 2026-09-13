/**
 * Pexels serves resized derivatives from query params, so a tile never pulls a
 * multi-megabyte original.
 */
export const photoUrl = (id: number, width: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

export const posterUrl = (id: number, width: number) =>
  `https://images.pexels.com/videos/${id}/pictures/preview-0.jpg?auto=compress&cs=tinysrgb&w=${width}`;

/**
 * Pexels' /download/ endpoint always hands back the largest rendition, which
 * for these clips is 4K and 55-135 MB. Where a lighter rendition exists we
 * point straight at it; the comments record the measured file sizes.
 */
const VIDEO_FILES: Record<number, string> = {
  37375289:
    "https://videos.pexels.com/video-files/37375289/15829639_1920_1080_30fps.mp4", // 11 MB, 1080p
  5198949:
    "https://videos.pexels.com/video-files/5198949/5198949-hd_1366_720_25fps.mp4", // 5 MB, 720p
  5198919:
    "https://videos.pexels.com/video-files/5198919/5198919-hd_1366_720_25fps.mp4", // 5 MB, 720p
  39144571: "https://www.pexels.com/download/video/39144571/", // 135 MB, no lighter rendition published
};

export const videoUrl = (id: number) =>
  VIDEO_FILES[id] ?? `https://www.pexels.com/download/video/${id}/`;

/** Riders heading out together on the highway. 720p, ~5 MB, safe to autoplay. */
export const HERO_VIDEO = videoUrl(5198949);
export const HERO_POSTER = posterUrl(5198949, 1800);
