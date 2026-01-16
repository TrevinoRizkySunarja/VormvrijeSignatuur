import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    root: "public",
    base: "./",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, "docs/index.html"),
                intro: resolve(__dirname, "docs/intro.html"),
                hub: resolve(__dirname, "docs/hub.html"),
                notes: resolve(__dirname, "docs/notes.html"),
                deadlines: resolve(__dirname, "docs/deadlines.html"),
                research: resolve(__dirname, "docs/research.html"),
                testing: resolve(__dirname, "docs/testing.html"),
                feedback: resolve(__dirname, "docs/feedback.html"),
                results: resolve(__dirname, "docs/results.html"),
            },
        },
    },
});
