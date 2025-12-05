const { names, offsetFromRoot, generateFiles, formatFiles } = require('@nx/devkit');
const path = require('path');

function normalizeOptions(tree, options) {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory || 'packages';
  const projectName = `opencode-${name}`;
  const projectRoot = `${projectDirectory}/${projectName}`;
  const parsedTags = [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree, options) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
    npmScope: 'pantheon-org',
  };

  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

module.exports = async function (tree, options) {
  const normalizedOptions = normalizeOptions(tree, options);
  
  addFiles(tree, normalizedOptions);
  
  await formatFiles(tree);
  
  return () => {
    console.log(`
✨ Successfully created plugin: ${normalizedOptions.projectName}

Next steps:
  1. Navigate to the plugin directory:
     cd ${normalizedOptions.projectRoot}

  2. Build the plugin:
     nx build ${normalizedOptions.projectName}

  3. Pack the plugin:
     nx pack ${normalizedOptions.projectName}

  4. Start developing your plugin in:
     ${normalizedOptions.projectRoot}/src/index.ts
`);
  };
};

module.exports.schema = require('./schema.json');
