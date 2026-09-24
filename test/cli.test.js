import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const exec = promisify(execFile);

const ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
);

const CLI = path.resolve(
    ROOT,
    "src/cli.js"
);

function createProject(config) {
    const root = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "site-screenshot-"
        )
    );

    fs.writeFileSync(
        path.join(
            root,
            "site-screenshot.config.mjs"
        ),
        `export default ${JSON.stringify(config, null, 4)};`
    );

    return root;
}

function cleanup(project) {
    fs.rmSync(
        project,
        {
            recursive: true,
            force: true
        }
    );
}

async function runCli(project) {
    return exec(
        process.execPath,
        [CLI],
        {
            cwd: project
        }
    );
}

function readPngSize(file) {
    const buffer = fs.readFileSync(file);

    assert.equal(
        buffer.toString("ascii", 1, 4),
        "PNG"
    );

    return {
        width:
            buffer.readUInt32BE(16),

        height:
            buffer.readUInt32BE(20)
    };
}

test(
    "captures portfolio after animation delay",
    async t => {
        const project = createProject({
            target:
                "https://dylanyeowf.pages.dev",

            outputDirectory:
                "screenshots",

            outputs: [
                "portfolio.png",
                "portfolio-copy.png"
            ],

            delay:
                1000,

            viewport: {
                width: 1440,
                height: 900
            }
        });

        t.after(() =>
            cleanup(project)
        );

        await runCli(project);

        const first = path.join(
            project,
            "screenshots/portfolio.png"
        );

        const second = path.join(
            project,
            "screenshots/portfolio-copy.png"
        );

        assert.ok(
            fs.existsSync(first),
            "portfolio screenshot should exist"
        );

        assert.ok(
            fs.existsSync(second),
            "second output should exist"
        );

        assert.ok(
            fs.statSync(first).size > 1000,
            "screenshot should contain image data"
        );

        assert.deepEqual(
            fs.readFileSync(first),
            fs.readFileSync(second),
            "multiple outputs should contain the same screenshot"
        );

        assert.deepEqual(
            readPngSize(first),
            {
                width: 1440,
                height: 900
            }
        );
    }
);

test(
    "respects screenshot delay",
    async t => {
        const project = createProject({
            target:
                "data:text/html,<html><body>Test</body></html>",

            outputDirectory:
                "screenshots",

            outputs: [
                "delay.png"
            ],

            delay:
                1000
        });

        t.after(() =>
            cleanup(project)
        );

        const started =
            performance.now();

        await runCli(project);

        const duration =
            performance.now() -
            started;

        assert.ok(
            duration >= 1000,
            `expected at least 1000ms, got ${Math.round(duration)}ms`
        );

        assert.ok(
            fs.existsSync(
                path.join(
                    project,
                    "screenshots/delay.png"
                )
            )
        );
    }
);

test(
    "creates nested output directories",
    async t => {
        const project = createProject({
            target:
                "data:text/html,<html><body>Test</body></html>",

            outputDirectory:
                "public/images",

            outputs: [
                "projects/portfolio.png"
            ]
        });

        t.after(() =>
            cleanup(project)
        );

        await runCli(project);

        assert.ok(
            fs.existsSync(
                path.join(
                    project,
                    "public/images/projects/portfolio.png"
                )
            )
        );
    }
);

test(
    "rejects unknown config options",
    async t => {
        const project = createProject({
            target:
                "https://dylanyeowf.pages.dev",

            invalidOption:
                true
        });

        t.after(() =>
            cleanup(project)
        );

        await assert.rejects(
            runCli(project),
            error => {
                assert.match(
                    error.stderr,
                    /Unknown config option: invalidOption/
                );

                return true;
            }
        );
    }
);

test(
    "requires a target website",
    async t => {
        const project = createProject({
            outputs: [
                "test.png"
            ]
        });

        t.after(() =>
            cleanup(project)
        );

        await assert.rejects(
            runCli(project),
            error => {
                assert.match(
                    error.stderr,
                    /config\.target is required/
                );

                return true;
            }
        );
    }
);

test(
    "rejects mixed output formats",
    async t => {
        const project = createProject({
            target:
                "data:text/html,<html><body>Test</body></html>",

            outputs: [
                "first.png",
                "second.webp"
            ]
        });

        t.after(() =>
            cleanup(project)
        );

        await assert.rejects(
            runCli(project),
            error => {
                assert.match(
                    error.stderr,
                    /same image format/
                );

                return true;
            }
        );
    }
);