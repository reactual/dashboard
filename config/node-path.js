'use strict';

const glob = require('glob');
const path = require('path');
const paths = require('./paths');

function addToNodePath(dirs) {
  process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .concat(dirs)
    .join(path.delimiter);
}

function includeAllPackages() {
  const rawPackages = require(paths.lernaConfigJson).packages;
  const packages = ['node_modules'];

  rawPackages.forEach(pkg => {
    glob.sync(pkg).forEach(pkgDir => {
      packages.push(`${pkgDir}/node_modules`)
    });
  });

  addToNodePath(packages);
}

function includeRunningPackage() {
  addToNodePath([
    'node_modules',
    `${paths.appDirectory}/node_modules`
  ]);
}

module.exports = {
  includeRunningPackage: includeRunningPackage,
  includeAllPackages: includeAllPackages
}
