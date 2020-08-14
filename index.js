#!/usr/bin/env node
const chokidar = require("chokidar");
const debounce = require("lodash.debounce");
const program = require("caporal");
const fs = require("fs");
const { spawn } = require("child_process");

program
  .version("0.0.1")
  .argument("[filename]", "name of the file to execute")
  .action(async ({ filename }) => {
    const name = filename || "index.js";
    try {
      await fs.promises.access(name);
    } catch (err) {
      throw new Error(`could not find the file ${name}`);
    }
    let proc;
    const startFn = debounce(() => {
      if (proc) {
        proc.kill();
      }
      proc = spawn("node", [name], { stdio: "inherit" });
    }, 100);

    chokidar
      .watch(".")
      .on("add", startFn)
      .on("change", startFn)
      .on("unlink", startFn);
  });

program.parse(process.argv);
