const generateSlug = (name) => {
  const clean = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return clean + "-" + Math.random().toString(36).slice(2, 7);
};

module.exports = generateSlug;
