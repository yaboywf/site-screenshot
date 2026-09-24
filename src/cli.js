#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const ROOT = process.cwd();

const CONFIG_FILES = [
    "site-screenshot.config.mjs",
    "site-screenshot.config.js"
];

const DEFAULT_CONFIG = {
    target: null,

    outputDirectory: "public/images",

    outputs: ["screenshot.png"],

    delay: 0,

    viewport: {
        width: 1440,
        height: 900
    },

    fullPage: false,

    waitUntil: "load",

    waitFor: null,

    timeout: 30000,

    animations: "allow"
};

function getConfigPath() {
    const equalsArg = process.argv.find(arg => arg.startsWith("--config="));

    if (equalsArg) {
        return path.resolve(ROOT, equalsArg.slice(9));
    }

    const index = process.argv.indexOf("--config");

    if (index !== -1 && process.argv[index + 1]) {
        return path.resolve(ROOT, process.argv[index + 1]);
    }

    const filename =
        CONFIG_FILES.find(file =>
            fs.existsSync(
                path.resolve(ROOT, file)
            )
        );

    if (!filename) throw new Error("Screenshot config not found");

    return path.resolve(ROOT, filename);
}

async function loadConfig() {
    const configPath = getConfigPath();

    const userConfig = (await import(pathToFileURL(configPath).href)).default ?? {};

    const unknownKeys = Object.keys(userConfig).filter(key => !(key in DEFAULT_CONFIG));

    if (unknownKeys.length) {
        throw new TypeError(`Unknown config option${unknownKeys.length > 1 ? "s" : ""}: ${unknownKeys.join(", ")}`);
    }

    const config = {
        ...DEFAULT_CONFIG,
        ...userConfig,

        viewport: {
            ...DEFAULT_CONFIG.viewport,
            ...userConfig.viewport
        }
    };

    if (typeof config.target !== "string" || !config.target) {
        throw new TypeError("config.target is required");
    }

    if (!Array.isArray(config.outputs) || config.outputs.length === 0) {
        throw new TypeError("config.outputs must contain at least one file");
    }

    if (!Number.isFinite(config.delay) || config.delay < 0) {
        throw new TypeError("config.delay must be a non-negative number");
    }

    return config;
}

function getScreenshotType(outputs) {
    const types =
        new Set(
            outputs.map(output => {
                const extension = path.extname(output).slice(1).toLowerCase();
                return extension === "jpg" ? "jpeg" : extension;
            })
        );

    if (types.size !== 1) {
        throw new TypeError("All output files must use the same image format");
    }

    const [type] = types;

    if (!["png", "jpeg", "webp"].includes(type)) {
        throw new TypeError(`Unsupported image format: ${type}`);
    }

    return type;
}

async function main() {
    const config = await loadConfig();
    const type = getScreenshotType(config.outputs);
    const browser = await chromium.launch({ headless: true });

    try {
        const context = await browser.newContext({ viewport: config.viewport });

        const page = await context.newPage();

        const response =
            await page.goto(
                config.target,
                {
                    waitUntil: config.waitUntil,
                    timeout: config.timeout
                }
            );

        if (response && !response.ok()) {
            throw new Error(`Target returned HTTP ${response.status()}`);
        }

        if (config.waitFor) {
            await page
                .locator(config.waitFor)
                .waitFor({
                    state: "visible",
                    timeout: config.timeout
                });
        }

        if (config.delay > 0) {
            await sleep(config.delay);
        }

        const screenshot =
            await page.screenshot({
                type,
                fullPage: config.fullPage,
                animations: config.animations
            });

        for (const filename of config.outputs) {
            const output = path.resolve(ROOT, config.outputDirectory, filename);

            fs.mkdirSync(
                path.dirname(output),
                { recursive: true }
            );

            fs.writeFileSync(output, screenshot);

            console.log(`Saved: ${output}`);
        }
    } finally {
        await browser.close();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});