#!/usr/bin/env node
"use strict";var _sourceMapSupport2 = require("source-map-support");

var _bluebird = require("bluebird");var _bluebird2 = _interopRequireDefault(_bluebird);
var _fsExtra = require("fs-extra");






var _path = require("path");
var _requestPromise = require("request-promise");var _requestPromise2 = _interopRequireDefault(_requestPromise);
var _winston = require("winston");var _winston2 = _interopRequireDefault(_winston);
var _expandHomeDir = require("expand-home-dir");var _expandHomeDir2 = _interopRequireDefault(_expandHomeDir);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}(0, _sourceMapSupport2.install)();

// import {baseUrl, token} from './config';

// process.on('unhandledRejection', r => console.error(r, r.stack));

// r('/courses/30230/folders').then(console.log)

function downloadFile(requester, file, path) {
  _winston2.default.info("File %s out of date, updating", file.display_name);
  requester(file.url).
  pipe((0, _fsExtra.createWriteStream)(path)).
  on("error", e => {
    _winston2.default.error("Error downloading file %s into %s", file, path, e);
  });
}

async function updateCourse(dest, r, courseId) {
  _winston2.default.info("Updating course %d into %s", courseId, dest);
  // Create requestor for files, which have different url prefix
  const rFile = r.defaults({ baseUrl: null });

  let filesModified = 0;
  let filesCreated = 0;

  let folderPaths = {};

  const folders = await r(`courses/${courseId}/folders`);
  for (let folder of folders) {
    const path = (0, _path.join)(dest, folder.full_name);
    folderPaths[folder.id] = folder.full_name;
    try {
      await (0, _fsExtra.ensureDir)(path.toString());
    } catch (e) {
      _winston2.default.error("Error creating folder %s", path.toString(), e);
      throw e;
    }
  }

  const files = await r(`courses/${courseId}/files`);
  for (let file of files) {
    console.log(file);
    const fPath =
    dest + "/" + folderPaths[file.folder_id] + "/" + file.display_name;
    const exists = await (0, _fsExtra.pathExists)(fPath);
    const remoteModified = Date.parse(file.updated_at);

    if (!exists) {
      _winston2.default.info("File %s DNE, creating", file.filenmae);
      downloadFile(rFile, file, fPath);
      filesCreated += 1;
    } else {
      const stats = await (0, _fsExtra.stat)(fPath);
      if (remoteModified > stats.mtime.getTime()) {
        _winston2.default.info("File %s out of date, updating", file.display_name);
        downloadFile(rFile, file, fPath);
      }
      filesModified += 1;
    }
  }

  _winston2.default.info(
  "Course %d sync complete, %d updated, %d created",
  courseId,
  filesModified,
  filesCreated);

  return { filesCreated, filesModified };
}

async function run() {
  _winston2.default.info("Launching canvas sync");
  let config;
  try {
    config = JSON.parse((await (0, _fsExtra.readFile)((0, _expandHomeDir2.default)("~/.csyncrc"))));
  } catch (e) {
    _winston2.default.error(
    "Fatal: Error reading config file at %s",
    (0, _expandHomeDir2.default)("~/.csyncrc"),
    e);

    throw e;
  }
  const r = _requestPromise2.default.defaults({
    baseUrl: config.canvasUrl + "/api/v1/",
    headers: {
      Authorization: `Bearer ${config.accessToken}` },

    json: true });


  let modified = 0;
  let created = 0;

  for (let courseId of Object.keys(config.courses)) {
    const path = (0, _expandHomeDir2.default)(config.courses[courseId]);
    let { filesCreated, filesModified } = await updateCourse(path, r, courseId);
    modified += filesModified;
    created += filesCreated;
  }
  _winston2.default.info("Canvas sync complete", { created, modified });
  return { created, modified };
}
run().then();
// update(30230, './data/cs121').then();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkb3dubG9hZEZpbGUiLCJyZXF1ZXN0ZXIiLCJmaWxlIiwicGF0aCIsImluZm8iLCJkaXNwbGF5X25hbWUiLCJ1cmwiLCJwaXBlIiwib24iLCJlIiwiZXJyb3IiLCJ1cGRhdGVDb3Vyc2UiLCJkZXN0IiwiciIsImNvdXJzZUlkIiwickZpbGUiLCJkZWZhdWx0cyIsImJhc2VVcmwiLCJmaWxlc01vZGlmaWVkIiwiZmlsZXNDcmVhdGVkIiwiZm9sZGVyUGF0aHMiLCJmb2xkZXJzIiwiZm9sZGVyIiwiZnVsbF9uYW1lIiwiaWQiLCJ0b1N0cmluZyIsImZpbGVzIiwiY29uc29sZSIsImxvZyIsImZQYXRoIiwiZm9sZGVyX2lkIiwiZXhpc3RzIiwicmVtb3RlTW9kaWZpZWQiLCJEYXRlIiwicGFyc2UiLCJ1cGRhdGVkX2F0IiwiZmlsZW5tYWUiLCJzdGF0cyIsIm10aW1lIiwiZ2V0VGltZSIsInJ1biIsImNvbmZpZyIsIkpTT04iLCJjYW52YXNVcmwiLCJoZWFkZXJzIiwiQXV0aG9yaXphdGlvbiIsImFjY2Vzc1Rva2VuIiwianNvbiIsIm1vZGlmaWVkIiwiY3JlYXRlZCIsIk9iamVjdCIsImtleXMiLCJjb3Vyc2VzIiwidGhlbiJdLCJtYXBwaW5ncyI6Ijs7QUFFQSxvQztBQUNBOzs7Ozs7O0FBT0E7QUFDQSxpRDtBQUNBLGtDO0FBQ0EsZ0Q7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsU0FBU0EsWUFBVCxDQUFzQkMsU0FBdEIsRUFBaUNDLElBQWpDLEVBQXVDQyxJQUF2QyxFQUE2QztBQUMzQyxvQkFBUUMsSUFBUixDQUFhLCtCQUFiLEVBQThDRixLQUFLRyxZQUFuRDtBQUNBSixZQUFVQyxLQUFLSSxHQUFmO0FBQ0dDLE1BREgsQ0FDUSxnQ0FBa0JKLElBQWxCLENBRFI7QUFFR0ssSUFGSCxDQUVNLE9BRk4sRUFFZUMsS0FBSztBQUNoQixzQkFBUUMsS0FBUixDQUFjLG1DQUFkLEVBQW1EUixJQUFuRCxFQUF5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QixVQUFTSixPQUFPSyxXQUFZLEVBRHJDLEVBRmdCOztBQUt6QkMsVUFBTSxJQUxtQixFQUFqQixDQUFWOzs7QUFRQSxNQUFJQyxXQUFXLENBQWY7QUFDQSxNQUFJQyxVQUFVLENBQWQ7O0FBRUEsT0FBSyxJQUFJbkMsUUFBVCxJQUFxQm9DLE9BQU9DLElBQVAsQ0FBWVYsT0FBT1csT0FBbkIsQ0FBckIsRUFBa0Q7QUFDaEQsVUFBTWpELE9BQU8sNkJBQU1zQyxPQUFPVyxPQUFQLENBQWV0QyxRQUFmLENBQU4sQ0FBYjtBQUNBLFFBQUksRUFBRUssWUFBRixFQUFnQkQsYUFBaEIsS0FBa0MsTUFBTVAsYUFBYVIsSUFBYixFQUFtQlUsQ0FBbkIsRUFBc0JDLFFBQXRCLENBQTVDO0FBQ0FrQyxnQkFBWTlCLGFBQVo7QUFDQStCLGVBQVc5QixZQUFYO0FBQ0Q7QUFDRCxvQkFBUWYsSUFBUixDQUFhLHNCQUFiLEVBQXFDLEVBQUU2QyxPQUFGLEVBQVdELFFBQVgsRUFBckM7QUFDQSxTQUFPLEVBQUVDLE9BQUYsRUFBV0QsUUFBWCxFQUFQO0FBQ0Q7QUFDRFIsTUFBTWEsSUFBTjtBQUNBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbmltcG9ydCBQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuaW1wb3J0IHtcbiAgZW5zdXJlRGlyLFxuICBjcmVhdGVXcml0ZVN0cmVhbSxcbiAgcGF0aEV4aXN0cyxcbiAgc3RhdCxcbiAgcmVhZEZpbGVcbn0gZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCByZXF1ZXN0IGZyb20gXCJyZXF1ZXN0LXByb21pc2VcIjtcbmltcG9ydCB3aW5zdG9uIGZyb20gXCJ3aW5zdG9uXCI7XG5pbXBvcnQgdGlsZGUgZnJvbSBcImV4cGFuZC1ob21lLWRpclwiO1xuXG4vLyBpbXBvcnQge2Jhc2VVcmwsIHRva2VufSBmcm9tICcuL2NvbmZpZyc7XG5cbi8vIHByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIHIgPT4gY29uc29sZS5lcnJvcihyLCByLnN0YWNrKSk7XG5cbi8vIHIoJy9jb3Vyc2VzLzMwMjMwL2ZvbGRlcnMnKS50aGVuKGNvbnNvbGUubG9nKVxuXG5mdW5jdGlvbiBkb3dubG9hZEZpbGUocmVxdWVzdGVyLCBmaWxlLCBwYXRoKSB7XG4gIHdpbnN0b24uaW5mbyhcIkZpbGUgJXMgb3V0IG9mIGRhdGUsIHVwZGF0aW5nXCIsIGZpbGUuZGlzcGxheV9uYW1lKTtcbiAgcmVxdWVzdGVyKGZpbGUudXJsKVxuICAgIC5waXBlKGNyZWF0ZVdyaXRlU3RyZWFtKHBhdGgpKVxuICAgIC5vbihcImVycm9yXCIsIGUgPT4ge1xuICAgICAgd2luc3Rvbi5lcnJvcihcIkVycm9yIGRvd25sb2FkaW5nIGZpbGUgJXMgaW50byAlc1wiLCBmaWxlLCBwYXRoLCBlKTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlQ291cnNlKGRlc3QsIHIsIGNvdXJzZUlkKSB7XG4gIHdpbnN0b24uaW5mbyhcIlVwZGF0aW5nIGNvdXJzZSAlZCBpbnRvICVzXCIsIGNvdXJzZUlkLCBkZXN0KTtcbiAgLy8gQ3JlYXRlIHJlcXVlc3RvciBmb3IgZmlsZXMsIHdoaWNoIGhhdmUgZGlmZmVyZW50IHVybCBwcmVmaXhcbiAgY29uc3QgckZpbGUgPSByLmRlZmF1bHRzKHsgYmFzZVVybDogbnVsbCB9KTtcblxuICBsZXQgZmlsZXNNb2RpZmllZCA9IDA7XG4gIGxldCBmaWxlc0NyZWF0ZWQgPSAwO1xuXG4gIGxldCBmb2xkZXJQYXRocyA9IHt9O1xuXG4gIGNvbnN0IGZvbGRlcnMgPSBhd2FpdCByKGBjb3Vyc2VzLyR7Y291cnNlSWR9L2ZvbGRlcnNgKTtcbiAgZm9yIChsZXQgZm9sZGVyIG9mIGZvbGRlcnMpIHtcbiAgICBjb25zdCBwYXRoID0gam9pbihkZXN0LCBmb2xkZXIuZnVsbF9uYW1lKTtcbiAgICBmb2xkZXJQYXRoc1tmb2xkZXIuaWRdID0gZm9sZGVyLmZ1bGxfbmFtZTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZW5zdXJlRGlyKHBhdGgudG9TdHJpbmcoKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2luc3Rvbi5lcnJvcihcIkVycm9yIGNyZWF0aW5nIGZvbGRlciAlc1wiLCBwYXRoLnRvU3RyaW5nKCksIGUpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBmaWxlcyA9IGF3YWl0IHIoYGNvdXJzZXMvJHtjb3Vyc2VJZH0vZmlsZXNgKTtcbiAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgIGNvbnNvbGUubG9nKGZpbGUpO1xuICAgIGNvbnN0IGZQYXRoID1cbiAgICAgIGRlc3QgKyBcIi9cIiArIGZvbGRlclBhdGhzW2ZpbGUuZm9sZGVyX2lkXSArIFwiL1wiICsgZmlsZS5kaXNwbGF5X25hbWU7XG4gICAgY29uc3QgZXhpc3RzID0gYXdhaXQgcGF0aEV4aXN0cyhmUGF0aCk7XG4gICAgY29uc3QgcmVtb3RlTW9kaWZpZWQgPSBEYXRlLnBhcnNlKGZpbGUudXBkYXRlZF9hdCk7XG5cbiAgICBpZiAoIWV4aXN0cykge1xuICAgICAgd2luc3Rvbi5pbmZvKFwiRmlsZSAlcyBETkUsIGNyZWF0aW5nXCIsIGZpbGUuZmlsZW5tYWUpO1xuICAgICAgZG93bmxvYWRGaWxlKHJGaWxlLCBmaWxlLCBmUGF0aCk7XG4gICAgICBmaWxlc0NyZWF0ZWQgKz0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBzdGF0KGZQYXRoKTtcbiAgICAgIGlmIChyZW1vdGVNb2RpZmllZCA+IHN0YXRzLm10aW1lLmdldFRpbWUoKSkge1xuICAgICAgICB3aW5zdG9uLmluZm8oXCJGaWxlICVzIG91dCBvZiBkYXRlLCB1cGRhdGluZ1wiLCBmaWxlLmRpc3BsYXlfbmFtZSk7XG4gICAgICAgIGRvd25sb2FkRmlsZShyRmlsZSwgZmlsZSwgZlBhdGgpO1xuICAgICAgfVxuICAgICAgZmlsZXNNb2RpZmllZCArPSAxO1xuICAgIH1cbiAgfVxuXG4gIHdpbnN0b24uaW5mbyhcbiAgICBcIkNvdXJzZSAlZCBzeW5jIGNvbXBsZXRlLCAlZCB1cGRhdGVkLCAlZCBjcmVhdGVkXCIsXG4gICAgY291cnNlSWQsXG4gICAgZmlsZXNNb2RpZmllZCxcbiAgICBmaWxlc0NyZWF0ZWRcbiAgKTtcbiAgcmV0dXJuIHsgZmlsZXNDcmVhdGVkLCBmaWxlc01vZGlmaWVkIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bigpIHtcbiAgd2luc3Rvbi5pbmZvKFwiTGF1bmNoaW5nIGNhbnZhcyBzeW5jXCIpO1xuICBsZXQgY29uZmlnO1xuICB0cnkge1xuICAgIGNvbmZpZyA9IEpTT04ucGFyc2UoYXdhaXQgcmVhZEZpbGUodGlsZGUoXCJ+Ly5jc3luY3JjXCIpKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB3aW5zdG9uLmVycm9yKFxuICAgICAgXCJGYXRhbDogRXJyb3IgcmVhZGluZyBjb25maWcgZmlsZSBhdCAlc1wiLFxuICAgICAgdGlsZGUoXCJ+Ly5jc3luY3JjXCIpLFxuICAgICAgZVxuICAgICk7XG4gICAgdGhyb3cgZTtcbiAgfVxuICBjb25zdCByID0gcmVxdWVzdC5kZWZhdWx0cyh7XG4gICAgYmFzZVVybDogY29uZmlnLmNhbnZhc1VybCArIFwiL2FwaS92MS9cIixcbiAgICBoZWFkZXJzOiB7XG4gICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7Y29uZmlnLmFjY2Vzc1Rva2VufWBcbiAgICB9LFxuICAgIGpzb246IHRydWVcbiAgfSk7XG5cbiAgbGV0IG1vZGlmaWVkID0gMDtcbiAgbGV0IGNyZWF0ZWQgPSAwO1xuXG4gIGZvciAobGV0IGNvdXJzZUlkIG9mIE9iamVjdC5rZXlzKGNvbmZpZy5jb3Vyc2VzKSkge1xuICAgIGNvbnN0IHBhdGggPSB0aWxkZShjb25maWcuY291cnNlc1tjb3Vyc2VJZF0pO1xuICAgIGxldCB7IGZpbGVzQ3JlYXRlZCwgZmlsZXNNb2RpZmllZCB9ID0gYXdhaXQgdXBkYXRlQ291cnNlKHBhdGgsIHIsIGNvdXJzZUlkKTtcbiAgICBtb2RpZmllZCArPSBmaWxlc01vZGlmaWVkO1xuICAgIGNyZWF0ZWQgKz0gZmlsZXNDcmVhdGVkO1xuICB9XG4gIHdpbnN0b24uaW5mbyhcIkNhbnZhcyBzeW5jIGNvbXBsZXRlXCIsIHsgY3JlYXRlZCwgbW9kaWZpZWQgfSk7XG4gIHJldHVybiB7IGNyZWF0ZWQsIG1vZGlmaWVkIH07XG59XG5ydW4oKS50aGVuKCk7XG4vLyB1cGRhdGUoMzAyMzAsICcuL2RhdGEvY3MxMjEnKS50aGVuKCk7XG4iXX0=