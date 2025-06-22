const fs = require("fs");
const path = require("path");

console.log(
  "Running custom build script to inject assets into service worker..."
);

const buildDir = path.join(__dirname, "build");
const manifestPath = path.join(buildDir, "asset-manifest.json");
const swPath = path.join(buildDir, "service-worker.js");
const placeholder = "/* sw-injection-point */";

// 1. Read the asset-manifest.json
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch (err) {
  console.error(
    "Failed to read asset-manifest.json. Ensure the standard build has run successfully first.",
    err
  );
  process.exit(1);
}

// 2. Get the list of file paths to cache, filtering out source maps.
const filesToCache = Object.values(manifest.files).filter(
  (file) => !file.endsWith(".map")
);

// 3. Format the file list for injection.
// The output should be a comma-separated list of strings, e.g., "'/file1.js', '/file2.css'"
const formattedFileList = filesToCache.map((file) => `'${file}'`).join(", ");

// 4. Read the service worker file
let swContent;
try {
  swContent = fs.readFileSync(swPath, "utf8");
} catch (err) {
  console.error(
    "Failed to read service-worker.js from the build directory.",
    err
  );
  process.exit(1);
}

// 5. Replace the placeholder with the formatted file list
const finalSwContent = swContent.replace(placeholder, formattedFileList);

// 6. Write the modified content back to the service worker file
try {
  fs.writeFileSync(swPath, finalSwContent);
  console.log("Successfully injected asset manifest into service worker.");
} catch (err) {
  console.error("Failed to write modified service worker file.", err);
  process.exit(1);
}
