import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    base: "/VormvrijeSignatuur/",
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                intro: resolve(__dirname, "intro.html"),
                hub: resolve(__dirname, "hub.html"),
                notes: resolve(__dirname, "notes.html"),
                deadlines: resolve(__dirname, "deadlines.html"),
                research: resolve(__dirname, "research.html"),
                testing: resolve(__dirname, "testing.html"),
                feedback: resolve(__dirname, "feedback.html"),
                results: resolve(__dirname, "results.html"),
            },
        },
    },
});
