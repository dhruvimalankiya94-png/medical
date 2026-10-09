/**
 * Resolve the image to show for a user.
 *
 * Uploaded avatars are stored as a server-relative path such as
 * `/uploads/avatars/<id>-<ts>.png`, which Express serves and the Vite dev server
 * proxies. When the user has not uploaded a photo we generate an initials tile
 * as an inline SVG data URI, so the fallback needs no network request and no
 * stock photograph of an unrelated person.
 */

const BG = '#0f172a';
const FG = '#10b981';

const initialsOf = (name) => {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const avatarUrl = (user) => {
  if (user?.avatar) return user.avatar;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">` +
    `<rect width="150" height="150" fill="${BG}"/>` +
    `<text x="75" y="75" dy="0.35em" text-anchor="middle" ` +
    `font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" ` +
    `font-size="58" font-weight="700" fill="${FG}">${initialsOf(user?.name)}</text>` +
    `</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export default avatarUrl;
