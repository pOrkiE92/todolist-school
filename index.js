"use strict";

if (process.argv[2] === "dev") {
  require("./dev");
} else {
  require("./start");
}
