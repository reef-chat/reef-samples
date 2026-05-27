const raw = String(args.text ?? '');
const slug = raw
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
return { ok: true, slug };
