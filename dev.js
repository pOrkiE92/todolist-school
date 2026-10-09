"use strict";

const { spawn } = require("child_process");
const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

if (process.execArgv.includes("--watch")) {
  require("./server");
} else {
  const serverPath = path.join(__dirname, "server.js");
  const forwardArgs = process.argv.slice(2).filter((arg) => arg !== "dev");
  const child = spawn(
    process.execPath,
    ["--watch", serverPath, ...forwardArgs],
    {
      stdio: "inherit",
      env: process.env,
    }
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });

  process.on("SIGINT", () => child.kill("SIGINT"));
  process.on("SIGTERM", () => child.kill("SIGTERM"));
}
