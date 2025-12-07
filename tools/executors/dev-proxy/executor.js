import path from 'path';
// Use require-style imports for nx devkit functions to keep runtime compatibility
const tryRequireNx = () => {
    try {
        return require('@nx/devkit');
    }
    catch (e) {
        return null;
    }
};
/**
 *
 */
export default async function runExecutor(options, context) {
    const workspaceRoot = context.root;
    const requestedPlugins = options.plugins && options.plugins.length > 0 ? options.plugins : context.projectName ? [context.projectName] : [];
    if (requestedPlugins.length === 0) {
        console.error('No project specified for dev-proxy (provide --plugins or run from a project context)');
        return { success: false };
    }
    const devkit = tryRequireNx();
    // Resolve projects using devkit when available
    const resolved = [];
    for (const name of requestedPlugins) {
        if (name.includes(path.sep) || name.startsWith('.')) {
            resolved.push({ name });
            continue;
        }
        let info = null;
        if (devkit) {
            try {
                // getProjects may return a Map-like object
                if (typeof devkit.getProjects === 'function') {
                    const projects = devkit.getProjects();
                    if (projects) {
                        if (typeof projects.get === 'function') {
                            const p = projects.get(name);
                            if (p)
                                info = { name, root: p.root || p.sourceRoot, config: p };
                        }
                        else if (projects[name]) {
                            const p = projects[name];
                            info = { name, root: p.root || p.sourceRoot, config: p };
                        }
                    }
                }
                // try readProjectConfiguration if available
                if (!info && typeof devkit.readProjectConfiguration === 'function') {
                    try {
                        const cfg = devkit.readProjectConfiguration(context, name);
                        if (cfg)
                            info = { name, root: cfg.root || cfg.sourceRoot, config: cfg };
                    }
                    catch { }
                }
            }
            catch { }
        }
        if (info)
            resolved.push(info);
        else
            resolved.push({ name });
    }
    // Start watchers using runExecutor async iterables when possible, otherwise fallback to CLI
    const stopFns = [];
    // choose runExecutor implementation: allow injection for tests
    const runExecutorImpl = options.__runExecutor ?? (devkit && devkit.runExecutor) ?? null;
    const spawnSyncImpl = options.__spawnSync ??
        ((cmd, args, opts) => {
            // lazy require child_process.spawnSync to avoid bundler issues
            const child = require('child_process');
            return child.spawnSync(cmd, args, opts);
        });
    console.log('dev-proxy: workspaceRoot=', workspaceRoot);
    for (const r of resolved) {
        if (r.root)
            console.log(`dev-proxy: resolved project ${r.name} -> ${r.root}`);
        else
            console.log(`dev-proxy: project ${r.name} not found in workspace via devkit; falling back to plugin resolution`);
        const projName = r.name;
        let started = false;
        if (runExecutorImpl) {
            try {
                const maybe = runExecutorImpl({ project: projName, target: 'build', configuration: undefined, overrides: { watch: true } }, context);
                const iterator = await Promise.resolve(maybe);
                if (iterator && Symbol.asyncIterator in iterator) {
                    (async () => {
                        try {
                            for await (const out of iterator) {
                                if (!out || !out.success)
                                    console.error(`Build for ${projName} reported failure`);
                            }
                        }
                        catch (err) {
                            console.error(`runExecutor iterator error for ${projName}:`, err);
                        }
                    })();
                    stopFns.push(async () => {
                        try {
                            if (typeof iterator.return === 'function')
                                await iterator.return();
                        }
                        catch { }
                    });
                    console.log(`Started build target for ${projName} via @nx/devkit.runExecutor`);
                    started = true;
                }
            }
            catch (err) {
                console.warn(`runExecutor failed for ${projName}:`, String(err));
            }
        }
        if (!started) {
            try {
                console.log(`Falling back to CLI watcher for ${projName}`);
                // use spawnSyncImpl to start a background process; we start it detached so it doesn't block
                // but spawnSync is synchronous; instead we use spawn via child_process to start background.
                // For simplicity, use child_process.spawn here and push a stop function.
                const child = require('child_process').spawn('bunx', ['nx', 'run', `${projName}:build`, '--watch'], {
                    stdio: 'inherit',
                    cwd: workspaceRoot,
                });
                stopFns.push(async () => {
                    try {
                        child.kill();
                    }
                    catch { }
                });
            }
            catch (err) {
                console.warn(`Failed to start CLI watcher for ${projName}:`, String(err));
            }
        }
    }
    // Spawn the runtime dev script (it will set up symlinks and run opencode)
    const script = path.join(workspaceRoot, 'tools', 'dev', 'opencode-dev.ts');
    const args = [];
    if (options.symlinkRoot)
        args.push('--symlink-root', options.symlinkRoot);
    if (options.apply === false)
        args.push('--no-apply');
    args.push(...requestedPlugins);
    console.log('Running dev proxy runtime:', ['bunx', 'tsx', script, ...args].join(' '));
    // Ensure cleanup on SIGINT
    let exiting = false;
    process.on('SIGINT', async () => {
        if (exiting)
            return;
        exiting = true;
        console.log('\nInterrupted. Stopping build watchers and exiting...');
        for (const fn of stopFns) {
            try {
                await fn();
            }
            catch { }
        }
        process.exit(0);
    });
    // Run runtime script synchronously (using spawnSyncImpl)
    const res = spawnSyncImpl('bunx', ['tsx', script, ...args], { stdio: 'inherit', cwd: workspaceRoot });
    // Ensure watchers are terminated when runtime exits
    for (const fn of stopFns) {
        try {
            // don't await for shutdown
            fn();
        }
        catch { }
    }
    if (res && res.error) {
        console.error('Failed to run dev proxy runtime', res.error);
        return { success: false };
    }
    return { success: res && res.status === 0 };
}
