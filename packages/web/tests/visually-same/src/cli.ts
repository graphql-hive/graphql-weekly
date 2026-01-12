#!/usr/bin/env bun
import { render } from "ink";
import meow from "meow";
import React from "react";

import App from "./app.js";

const cli = meow(
  dedent(`
    Usage
      $ visually-same <command>

    Commands
      compare              Take screenshots and compare against baseline
      update-baseline     Take screenshots and save as new baseline
      screenshot-production Take screenshots from production site

    Examples
      $ visually-same compare
      $ visually-same update-baseline
      $ visually-same screenshot-production
  `),
  {
    flags: {},
    importMeta: import.meta,
  },
);

const command = cli.input[0] as
  | "compare"
  | "screenshot-production"
  | "update-baseline";

if (
  !command ||
  !["compare", "screenshot-production", "update-baseline"].includes(command)
) {
  process.stderr.write("Invalid command.");
  process.stderr.write(cli.help);
  process.exit(1);
}

render(React.createElement(App, { command }));

function dedent(str: string): string {
  return str.replace(/^\s+/, "");
}
