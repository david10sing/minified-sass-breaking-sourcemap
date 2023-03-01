const { dirname, parse, resolve, sep } = require("path");
const fs = require("fs");
const sass = require("sass");
const { fileURLToPath, pathToFileURL } = require("url");
const chalk = require("chalk");
const { createSpinner } = require("nanospinner");
const autoprefixer = require("autoprefixer");
const postcss = require("postcss");

// These can be thought of like a pack in webpacker
// If you need to add a new css file create it under the `app/javascript/css` folder
// and reference it here
//
// Note: we application.scss will be compiled to main.css to avoid clashing
// with the application.css when processing the Javascript
const manifestations = {
  "index.scss": "index.css",
};

const minify = true;
const sourcemap = true;

/**
 * Compile sass
 *
 * @param {*} source
 * @param {*} output
 */
async function processSass(source, output) {
  const spinner = createSpinner(chalk.blue(`Processing ${source}`)).start();

  spinner.update({
    text: `Compiling Sass ${source}`,
  });

  /**
   * This is where the sass compilation happens
   */
  const result = sass.compile(source, {
    style: minify ? "compressed" : "expanded",
    sourceMap: sourcemap,
    sourceMapIncludeSources: true,
  });

  /** Building the output path of where the css file lives */
  const outputPath = resolve("./dist", output);

  /** Run postcss transformations here */
  const postCssResult = await postcss([autoprefixer]).process(result.css, {
    from: source,
    map: sourcemap && {
      prev: result.sourceMap, // passing sourcemaps from sass so it still works
    },
  });

  /** Write the postcss css to the output file */
  fs.writeFileSync(
    outputPath,
    `${postCssResult.css}\n\n /*# sourceMappingURL=index.css.map */`
  );
  spinner.success({
    text: chalk.green(`Wrote ${outputPath}`),
  });

  if (sourcemap) {
    fs.writeFileSync(
      `${outputPath}.map`,
      JSON.stringify(postCssResult.map, null, 2)
    );
    spinner.success({
      text: chalk.green(`Wrote ${outputPath}.map`),
    });
  }
}

/**
 * Main
 */
function buildSass() {
  for (const [source, output] of Object.entries(manifestations)) {
    processSass(resolve("./", source), output);
  }
}

buildSass();
