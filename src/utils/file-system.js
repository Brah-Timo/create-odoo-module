'use strict';

const fs   = require('fs-extra');
const path = require('path');
const ejs  = require('ejs');

/**
 * Write a file, creating parent directories automatically.
 */
async function writeFile(filePath, content) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * Render an EJS template string and write the output file.
 *
 * @param {string}  templatePath  Absolute path to .ejs template
 * @param {string}  outputPath    Destination file path
 * @param {object}  data          Template variables
 */
async function renderTemplate(templatePath, outputPath, data) {
  const template = await fs.readFile(templatePath, 'utf8');
  const rendered = ejs.render(template, data, {
    filename: templatePath, // allows <%- include() %>
    rmWhitespace: false,
  });
  await writeFile(outputPath, rendered);
}

/**
 * Copy a static (non-EJS) file.
 */
async function copyFile(src, dest) {
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest);
}

/**
 * Copy an entire directory.
 */
async function copyDir(src, dest) {
  await fs.copy(src, dest, { overwrite: true });
}

/**
 * Create directory (recursive).
 */
async function mkdirp(dirPath) {
  await fs.ensureDir(dirPath);
}

/**
 * Check if a path exists.
 */
async function exists(p) {
  return fs.pathExists(p);
}

/**
 * Remove a path (file or dir).
 */
async function remove(p) {
  return fs.remove(p);
}

module.exports = { writeFile, renderTemplate, copyFile, copyDir, mkdirp, exists, remove };
