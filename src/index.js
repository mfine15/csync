#!/usr/bin/env node

import Promise from "bluebird";
import {
  ensureDir,
  createWriteStream,
  pathExists,
  stat,
  readFile
} from "fs-extra";
import { join } from "path";
import request from "request-promise";
import winston from "winston";
import tilde from "expand-home-dir";

// import {baseUrl, token} from './config';

// process.on('unhandledRejection', r => console.error(r, r.stack));

// r('/courses/30230/folders').then(console.log)

function downloadFile(requester, file, path) {
  winston.info("File %s out of date, updating", file.display_name);
  requester(file.url)
    .pipe(createWriteStream(path))
    .on("error", e => {
      winston.error("Error downloading file %s into %s", file, path, e);
    });
}

async function updateCourse(dest, r, courseId) {
  winston.info("Updating course %d into %s", courseId, dest);
  // Create requestor for files, which have different url prefix
  const rFile = r.defaults({ baseUrl: null });

  let filesModified = 0;
  let filesCreated = 0;

  let folderPaths = {};

  const folders = await r(`courses/${courseId}/folders`);
  for (let folder of folders) {
    const path = join(dest, folder.full_name);
    folderPaths[folder.id] = folder.full_name;
    try {
      await ensureDir(path.toString());
    } catch (e) {
      winston.error("Error creating folder %s", path.toString(), e);
      throw e;
    }
  }

  const files = await r(`courses/${courseId}/files`);
  for (let file of files) {
    console.log(file);
    const fPath =
      dest + "/" + folderPaths[file.folder_id] + "/" + file.display_name;
    const exists = await pathExists(fPath);
    const remoteModified = Date.parse(file.updated_at);

    if (!exists) {
      winston.info("File %s DNE, creating", file.filenmae);
      downloadFile(rFile, file, fPath);
      filesCreated += 1;
    } else {
      const stats = await stat(fPath);
      if (remoteModified > stats.mtime.getTime()) {
        winston.info("File %s out of date, updating", file.display_name);
        downloadFile(rFile, file, fPath);
      }
      filesModified += 1;
    }
  }

  winston.info(
    "Course %d sync complete, %d updated, %d created",
    courseId,
    filesModified,
    filesCreated
  );
  return { filesCreated, filesModified };
}

async function run() {
  winston.info("Launching canvas sync");
  let config;
  try {
    config = JSON.parse(await readFile(tilde("~/.csyncrc")));
  } catch (e) {
    winston.error(
      "Fatal: Error reading config file at %s",
      tilde("~/.csyncrc"),
      e
    );
    throw e;
  }
  const r = request.defaults({
    baseUrl: config.canvasUrl + "/api/v1/",
    headers: {
      Authorization: `Bearer ${config.accessToken}`
    },
    json: true
  });

  let modified = 0;
  let created = 0;

  for (let courseId of Object.keys(config.courses)) {
    const path = tilde(config.courses[courseId]);
    let { filesCreated, filesModified } = await updateCourse(path, r, courseId);
    modified += filesModified;
    created += filesCreated;
  }
  winston.info("Canvas sync complete", { created, modified });
  return { created, modified };
}
run().then();
// update(30230, './data/cs121').then();
