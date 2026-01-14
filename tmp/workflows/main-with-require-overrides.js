
/**
 * IMPORTANT: Do not modify this file.
 * This file allows the app to run without bundling in workspace libraries.
 * Must be contained in the ".nx" folder inside the output path.
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');
const originalResolveFilename = Module._resolveFilename;
const distPath = __dirname;
const manifest = [{"module":"@pantheon-org/opencode-warcraft-notifications-plugin","exactMatch":"packages/opencode-warcraft-notifications-plugin/src/index.js","pattern":"packages/opencode-warcraft-notifications-plugin/src/index.ts"},{"module":"@pantheon-org/opencode-demo-plugin","exactMatch":"packages/opencode-demo-plugin/src/index.js","pattern":"packages/opencode-demo-plugin/src/index.ts"},{"module":"@pantheon-org/opencode-test-deps","exactMatch":"packages/opencode-test-deps/src/index.js","pattern":"packages/opencode-test-deps/src/index.ts"},{"module":"@pantheon-org/opencode-test-final","exactMatch":"packages/opencode-test-final/src/index.js","pattern":"packages/opencode-test-final/src/index.ts"},{"module":"@pantheon-org/opencode-warcraft-notifications","exactMatch":"packages/opencode-warcraft-notifications/src/index.js","pattern":"packages/opencode-warcraft-notifications/src/index.ts"},{"module":"@pantheon-org/opencode-augmented-plugin","exactMatch":"packages/opencode-augmented-plugin/src/index.js","pattern":"packages/opencode-augmented-plugin/src/index.ts"},{"module":"warcraft-notifications","exactMatch":"warcraft-notifications/src/index.js","pattern":"warcraft-notifications/src/index.ts"}];

Module._resolveFilename = function(request, parent) {
  let found;
  for (const entry of manifest) {
    if (request === entry.module && entry.exactMatch) {
      const entry = manifest.find((x) => request === x.module || request.startsWith(x.module + "/"));
      const candidate = path.join(distPath, entry.exactMatch);
      if (isFile(candidate)) {
        found = candidate;
        break;
      }
    } else {
      const re = new RegExp(entry.module.replace(/\*$/, "(?<rest>.*)"));
      const match = request.match(re);

      if (match?.groups) {
        const candidate = path.join(distPath, entry.pattern.replace("*", ""), match.groups.rest);
        if (isFile(candidate)) {
          found = candidate;
        }
      }

    }
  }
  if (found) {
    const modifiedArguments = [found, ...[].slice.call(arguments, 1)];
    return originalResolveFilename.apply(this, modifiedArguments);
  } else {
    return originalResolveFilename.apply(this, arguments);
  }
};

function isFile(s) {
  try {
    require.resolve(s);
    return true;
  } catch (_e) {
    return false;
  }
}

// Call the user-defined main.
module.exports = require('./apps/workflows/src/main.js');
