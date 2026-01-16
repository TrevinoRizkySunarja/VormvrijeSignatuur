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
                index: resolve(__dirname, "public/index.html"),
                intro: resolve(__dirname, "public/intro.html"),
                hub: resolve(__dirname, "public/hub.html"),
                notes: resolve(__dirname, "public/notes.html"),
                deadlines: resolve(__dirname, "public/deadlines.html"),
                research: resolve(__dirname, "public/research.html"),
                testing: resolve(__dirname, "public/testing.html"),
                feedback: resolve(__dirname, "public/feedback.html"),
                results: resolve(__dirname, "public/results.html"),
            },
        },
    },
});
