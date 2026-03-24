const generateSlug = (name) => {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      // Replace non-alphanumeric characters with hyphens
      .replace(/\s+/g, "-")
      // Replace spaces with hyphens
      .replace(/-+/g, "-")

  // Replace multiple hyphens with a single hyphen
  +"-" + Math.random().toString(36).slice(2, 7);
  // Append a random string to ensure uniqueness
};
