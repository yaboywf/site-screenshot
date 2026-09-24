// @ts-check

import { defineConfig } from "@yaboywf/site-screenshot";

export default defineConfig({
    target: "https://timothyho.pages.dev",

    outputDirectory: "public/images",

    outputs: [
        "apple-touch-icon.png",
        "projects/portfolio.png"
    ],

    delay: 3000,
    timeout: 10000,

    viewport: {
        width: 1440,
        height: 900
    },
});