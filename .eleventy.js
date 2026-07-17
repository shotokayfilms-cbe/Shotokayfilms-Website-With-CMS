export default function (eleventyConfig) {
  // Copy static folders directly to the built website
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

  // Automatically collect every Markdown file inside /projects
  eleventyConfig.addCollection("portfolioProjects", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./projects/*.md")
      .sort((a, b) => {
        const orderA = Number(a.data.order || 0);
        const orderB = Number(b.data.order || 0);

        return orderB - orderA;
      });
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
}
