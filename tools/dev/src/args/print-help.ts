export function printHelp(): never {
  console.log(
    'usage: opencode-dev [--no-apply] [--symlink-root <dir>] [--revert] [--no-dispose] [--dispose-url <url>] <plugin...>',
  );
  console.log('  --no-apply   do not modify opencode.json (print entries instead)');
  console.log('  --revert     restore opencode.json from the last opencode-dev backup and exit');
  console.log('  --no-dispose disable POST /instance/dispose calls');
  console.log('  --dispose-url set custom dispose URL');
  process.exit(0);
}
