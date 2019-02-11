#!/usr/bin/env node
'use strict';

var _sourceMapSupport2 = require('source-map-support');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _expandHomeDir = require('expand-home-dir');

var _expandHomeDir2 = _interopRequireDefault(_expandHomeDir);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _sourceMapSupport2.install)();


// import {baseUrl, token} from './config';

// process.on('unhandledRejection', r => console.error(r, r.stack));

// r('/courses/30230/folders').then(console.log)

function downloadFile(requester, file, path) {
  _winston2.default.info('File %s out of date, updating', file.filename);
  requester(file.url).pipe((0, _fsExtra.createWriteStream)(path)).on('error', e => {
    _winston2.default.error('Error downloading file %s into %s', file, path, e);
  });
}

async function updateCourse(dest, r, courseId) {
  _winston2.default.info('Updating course %d into %s', courseId, dest);
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
      _winston2.default.error('Error creating folder %s', path.toString(), e);
      throw e;
    }
  }

  const files = await r(`courses/${courseId}/files`);
  for (let file of files) {
    console.log(file);
    const path = (0, _path.join)(dest, folderPaths[file.folder_id], file.filename);
    const exists = await (0, _fsExtra.pathExists)(path.toString());
    const remoteModified = Date.parse(file.updated_at);

    if (!exists) {
      _winston2.default.info("File %s DNE, creating", file.filenmae);
      downloadFile(rFile, file, path);
      filesCreated += 1;
    } else {
      const stats = await (0, _fsExtra.stat)(path);
      if (remoteModified > stats.mtime.getTime()) {
        _winston2.default.info("File %s out of date, updating", file.filename);
        downloadFile(rFile, file, path);
      }
      filesModified += 1;
    }
  }

  _winston2.default.info('Course %d sync complete, %d updated, %d created', courseId, filesModified, filesCreated);
  return { filesCreated, filesModified };
}

async function run() {
  _winston2.default.info('Launching canvas sync');
  let config;
  try {
    config = JSON.parse((await (0, _fsExtra.readFile)((0, _expandHomeDir2.default)('~/.csyncrc'))));
  } catch (e) {
    _winston2.default.error('Fatal: Error reading config file at %s', (0, _expandHomeDir2.default)('~/.csyncrc'), e);
    throw e;
  }
  const r = _requestPromise2.default.defaults({
    baseUrl: config.canvasUrl + '/api/v1/',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`
    },
    json: true
  });

  let modified = 0;
  let created = 0;

  for (let courseId of Object.keys(config.courses)) {
    const path = (0, _expandHomeDir2.default)(config.courses[courseId]);
    let { filesCreated, filesModified } = await updateCourse(path, r, courseId);
    modified += filesModified;
    created += filesCreated;
  }
  _winston2.default.info('Canvas sync complete', { created, modified });
  return { created, modified };
}
run().then();
// update(30230, './data/cs121').then();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkb3dubG9hZEZpbGUiLCJyZXF1ZXN0ZXIiLCJmaWxlIiwicGF0aCIsImluZm8iLCJmaWxlbmFtZSIsInVybCIsInBpcGUiLCJvbiIsImUiLCJlcnJvciIsInVwZGF0ZUNvdXJzZSIsImRlc3QiLCJyIiwiY291cnNlSWQiLCJyRmlsZSIsImRlZmF1bHRzIiwiYmFzZVVybCIsImZpbGVzTW9kaWZpZWQiLCJmaWxlc0NyZWF0ZWQiLCJmb2xkZXJQYXRocyIsImZvbGRlcnMiLCJmb2xkZXIiLCJmdWxsX25hbWUiLCJpZCIsInRvU3RyaW5nIiwiZmlsZXMiLCJjb25zb2xlIiwibG9nIiwiZm9sZGVyX2lkIiwiZXhpc3RzIiwicmVtb3RlTW9kaWZpZWQiLCJEYXRlIiwicGFyc2UiLCJ1cGRhdGVkX2F0IiwiZmlsZW5tYWUiLCJzdGF0cyIsIm10aW1lIiwiZ2V0VGltZSIsInJ1biIsImNvbmZpZyIsIkpTT04iLCJjYW52YXNVcmwiLCJoZWFkZXJzIiwiYWNjZXNzVG9rZW4iLCJqc29uIiwibW9kaWZpZWQiLCJjcmVhdGVkIiwiT2JqZWN0Iiwia2V5cyIsImNvdXJzZXMiLCJ0aGVuIl0sIm1hcHBpbmdzIjoiOzs7O0FBRUE7Ozs7QUFDQTs7QUFPQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7OztBQUVBOztBQUVBOztBQUVBOztBQUVBLFNBQVNBLFlBQVQsQ0FBc0JDLFNBQXRCLEVBQWlDQyxJQUFqQyxFQUF1Q0MsSUFBdkMsRUFBNEM7QUFDMUMsb0JBQVFDLElBQVIsQ0FBYSwrQkFBYixFQUE4Q0YsS0FBS0csUUFBbkQ7QUFDQUosWUFBVUMsS0FBS0ksR0FBZixFQUNHQyxJQURILENBQ1EsZ0NBQWtCSixJQUFsQixDQURSLEVBRUdLLEVBRkgsQ0FFTSxPQUZOLEVBRWVDLEtBQUs7QUFDaEIsc0JBQVFDLEtBQVIsQ0FBYyxtQ0FBZCxFQUFtRFIsSUFBbkQsRUFBeURDLElBQXpELEVBQStETSxDQUEvRDtBQUNELEdBSkg7QUFLRDs7QUFFRCxlQUFlRSxZQUFmLENBQTRCQyxJQUE1QixFQUFrQ0MsQ0FBbEMsRUFBcUNDLFFBQXJDLEVBQThDO0FBQzVDLG9CQUFRVixJQUFSLENBQWEsNEJBQWIsRUFBMkNVLFFBQTNDLEVBQXFERixJQUFyRDtBQUNBO0FBQ0EsUUFBTUcsUUFBUUYsRUFBRUcsUUFBRixDQUFXLEVBQUVDLFNBQVMsSUFBWCxFQUFYLENBQWQ7O0FBRUEsTUFBSUMsZ0JBQWdCLENBQXBCO0FBQ0EsTUFBSUMsZUFBZSxDQUFuQjs7QUFFQSxNQUFJQyxjQUFjLEVBQWxCOztBQUVBLFFBQU1DLFVBQVUsTUFBTVIsRUFBRyxXQUFVQyxRQUFTLFVBQXRCLENBQXRCO0FBQ0EsT0FBSyxJQUFJUSxNQUFULElBQW1CRCxPQUFuQixFQUEyQjtBQUN6QixVQUFNbEIsT0FBTyxnQkFBS1MsSUFBTCxFQUFXVSxPQUFPQyxTQUFsQixDQUFiO0FBQ0FILGdCQUFZRSxPQUFPRSxFQUFuQixJQUF5QkYsT0FBT0MsU0FBaEM7QUFDQSxRQUFHO0FBQ0QsWUFBTSx3QkFBVXBCLEtBQUtzQixRQUFMLEVBQVYsQ0FBTjtBQUNELEtBRkQsQ0FHQSxPQUFPaEIsQ0FBUCxFQUFTO0FBQ1Asd0JBQVFDLEtBQVIsQ0FBYywwQkFBZCxFQUEwQ1AsS0FBS3NCLFFBQUwsRUFBMUMsRUFBMkRoQixDQUEzRDtBQUNBLFlBQU1BLENBQU47QUFDRDtBQUNGOztBQUVELFFBQU1pQixRQUFRLE1BQU1iLEVBQUcsV0FBVUMsUUFBUyxRQUF0QixDQUFwQjtBQUNBLE9BQUssSUFBSVosSUFBVCxJQUFpQndCLEtBQWpCLEVBQXVCO0FBQ3JCQyxZQUFRQyxHQUFSLENBQVkxQixJQUFaO0FBQ0EsVUFBTUMsT0FBTyxnQkFBS1MsSUFBTCxFQUFXUSxZQUFZbEIsS0FBSzJCLFNBQWpCLENBQVgsRUFBd0MzQixLQUFLRyxRQUE3QyxDQUFiO0FBQ0EsVUFBTXlCLFNBQVMsTUFBTSx5QkFBVzNCLEtBQUtzQixRQUFMLEVBQVgsQ0FBckI7QUFDQSxVQUFNTSxpQkFBaUJDLEtBQUtDLEtBQUwsQ0FBVy9CLEtBQUtnQyxVQUFoQixDQUF2Qjs7QUFFQSxRQUFJLENBQUNKLE1BQUwsRUFBWTtBQUNWLHdCQUFRMUIsSUFBUixDQUFhLHVCQUFiLEVBQXNDRixLQUFLaUMsUUFBM0M7QUFDQW5DLG1CQUFhZSxLQUFiLEVBQW9CYixJQUFwQixFQUF5QkMsSUFBekI7QUFDQWdCLHNCQUFjLENBQWQ7QUFDRCxLQUpELE1BS0s7QUFDSCxZQUFNaUIsUUFBUSxNQUFNLG1CQUFLakMsSUFBTCxDQUFwQjtBQUNBLFVBQUc0QixpQkFBaUJLLE1BQU1DLEtBQU4sQ0FBWUMsT0FBWixFQUFwQixFQUEwQztBQUN4QywwQkFBUWxDLElBQVIsQ0FBYSwrQkFBYixFQUE4Q0YsS0FBS0csUUFBbkQ7QUFDQUwscUJBQWFlLEtBQWIsRUFBb0JiLElBQXBCLEVBQXlCQyxJQUF6QjtBQUNEO0FBQ0RlLHVCQUFlLENBQWY7QUFDRDtBQUNGOztBQUVELG9CQUFRZCxJQUFSLENBQ0UsaURBREYsRUFFRVUsUUFGRixFQUVZSSxhQUZaLEVBRTJCQyxZQUYzQjtBQUlBLFNBQU8sRUFBQ0EsWUFBRCxFQUFlRCxhQUFmLEVBQVA7QUFDRDs7QUFFRCxlQUFlcUIsR0FBZixHQUFvQjtBQUNsQixvQkFBUW5DLElBQVIsQ0FBYSx1QkFBYjtBQUNBLE1BQUlvQyxNQUFKO0FBQ0EsTUFBRztBQUNEQSxhQUFTQyxLQUFLUixLQUFMLEVBQVcsTUFBTSx1QkFBUyw2QkFBTSxZQUFOLENBQVQsQ0FBakIsRUFBVDtBQUNELEdBRkQsQ0FHQSxPQUFPeEIsQ0FBUCxFQUFVO0FBQ1Isc0JBQVFDLEtBQVIsQ0FBYyx3Q0FBZCxFQUF3RCw2QkFBTSxZQUFOLENBQXhELEVBQTZFRCxDQUE3RTtBQUNBLFVBQU1BLENBQU47QUFDRDtBQUNELFFBQU1JLElBQUkseUJBQVFHLFFBQVIsQ0FBaUI7QUFDekJDLGFBQVN1QixPQUFPRSxTQUFQLEdBQW1CLFVBREg7QUFFekJDLGFBQVM7QUFDUCx1QkFBa0IsVUFBU0gsT0FBT0ksV0FBZTtBQUQxQyxLQUZnQjtBQUt6QkMsVUFBTTtBQUxtQixHQUFqQixDQUFWOztBQVFBLE1BQUlDLFdBQVcsQ0FBZjtBQUNBLE1BQUlDLFVBQVUsQ0FBZDs7QUFFQSxPQUFLLElBQUlqQyxRQUFULElBQXFCa0MsT0FBT0MsSUFBUCxDQUFZVCxPQUFPVSxPQUFuQixDQUFyQixFQUFpRDtBQUMvQyxVQUFNL0MsT0FBTyw2QkFBTXFDLE9BQU9VLE9BQVAsQ0FBZXBDLFFBQWYsQ0FBTixDQUFiO0FBQ0EsUUFBSSxFQUFDSyxZQUFELEVBQWVELGFBQWYsS0FBZ0MsTUFBTVAsYUFBYVIsSUFBYixFQUFtQlUsQ0FBbkIsRUFBc0JDLFFBQXRCLENBQTFDO0FBQ0FnQyxnQkFBWTVCLGFBQVo7QUFDQTZCLGVBQVc1QixZQUFYO0FBQ0Q7QUFDRCxvQkFBUWYsSUFBUixDQUFhLHNCQUFiLEVBQXFDLEVBQUMyQyxPQUFELEVBQVVELFFBQVYsRUFBckM7QUFDQSxTQUFPLEVBQUNDLE9BQUQsRUFBVUQsUUFBVixFQUFQO0FBQ0Q7QUFDRFAsTUFBTVksSUFBTjtBQUNBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7XG4gIGVuc3VyZURpcixcbiAgY3JlYXRlV3JpdGVTdHJlYW0sXG4gIHBhdGhFeGlzdHMsXG4gIHN0YXQsXG4gIHJlYWRGaWxlXG59IGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0LXByb21pc2UnO1xuaW1wb3J0IHdpbnN0b24gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgdGlsZGUgZnJvbSAnZXhwYW5kLWhvbWUtZGlyJztcblxuLy8gaW1wb3J0IHtiYXNlVXJsLCB0b2tlbn0gZnJvbSAnLi9jb25maWcnO1xuXG4vLyBwcm9jZXNzLm9uKCd1bmhhbmRsZWRSZWplY3Rpb24nLCByID0+IGNvbnNvbGUuZXJyb3Iociwgci5zdGFjaykpO1xuXG4vLyByKCcvY291cnNlcy8zMDIzMC9mb2xkZXJzJykudGhlbihjb25zb2xlLmxvZylcblxuZnVuY3Rpb24gZG93bmxvYWRGaWxlKHJlcXVlc3RlciwgZmlsZSwgcGF0aCl7XG4gIHdpbnN0b24uaW5mbygnRmlsZSAlcyBvdXQgb2YgZGF0ZSwgdXBkYXRpbmcnLCBmaWxlLmZpbGVuYW1lKTtcbiAgcmVxdWVzdGVyKGZpbGUudXJsKVxuICAgIC5waXBlKGNyZWF0ZVdyaXRlU3RyZWFtKHBhdGgpKVxuICAgIC5vbignZXJyb3InLCBlID0+IHtcbiAgICAgIHdpbnN0b24uZXJyb3IoJ0Vycm9yIGRvd25sb2FkaW5nIGZpbGUgJXMgaW50byAlcycsIGZpbGUsIHBhdGgsIGUpO1xuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVDb3Vyc2UoZGVzdCwgciwgY291cnNlSWQpe1xuICB3aW5zdG9uLmluZm8oJ1VwZGF0aW5nIGNvdXJzZSAlZCBpbnRvICVzJywgY291cnNlSWQsIGRlc3QpO1xuICAvLyBDcmVhdGUgcmVxdWVzdG9yIGZvciBmaWxlcywgd2hpY2ggaGF2ZSBkaWZmZXJlbnQgdXJsIHByZWZpeFxuICBjb25zdCByRmlsZSA9IHIuZGVmYXVsdHMoeyBiYXNlVXJsOiBudWxsIH0pO1xuXG4gIGxldCBmaWxlc01vZGlmaWVkID0gMDtcbiAgbGV0IGZpbGVzQ3JlYXRlZCA9IDA7XG5cbiAgbGV0IGZvbGRlclBhdGhzID0ge307XG5cbiAgY29uc3QgZm9sZGVycyA9IGF3YWl0IHIoYGNvdXJzZXMvJHtjb3Vyc2VJZH0vZm9sZGVyc2ApO1xuICBmb3IgKGxldCBmb2xkZXIgb2YgZm9sZGVycyl7XG4gICAgY29uc3QgcGF0aCA9IGpvaW4oZGVzdCwgZm9sZGVyLmZ1bGxfbmFtZSk7XG4gICAgZm9sZGVyUGF0aHNbZm9sZGVyLmlkXSA9IGZvbGRlci5mdWxsX25hbWU7XG4gICAgdHJ5e1xuICAgICAgYXdhaXQgZW5zdXJlRGlyKHBhdGgudG9TdHJpbmcoKSk7XG4gICAgfVxuICAgIGNhdGNoIChlKXtcbiAgICAgIHdpbnN0b24uZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGZvbGRlciAlcycsIHBhdGgudG9TdHJpbmcoKSwgZSk7XG4gICAgICB0aHJvdyhlKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBmaWxlcyA9IGF3YWl0IHIoYGNvdXJzZXMvJHtjb3Vyc2VJZH0vZmlsZXNgKTtcbiAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcyl7XG4gICAgY29uc29sZS5sb2coZmlsZSk7XG4gICAgY29uc3QgcGF0aCA9IGpvaW4oZGVzdCwgZm9sZGVyUGF0aHNbZmlsZS5mb2xkZXJfaWRdLCBmaWxlLmZpbGVuYW1lKTtcbiAgICBjb25zdCBleGlzdHMgPSBhd2FpdCBwYXRoRXhpc3RzKHBhdGgudG9TdHJpbmcoKSk7XG4gICAgY29uc3QgcmVtb3RlTW9kaWZpZWQgPSBEYXRlLnBhcnNlKGZpbGUudXBkYXRlZF9hdCk7XG5cbiAgICBpZiAoIWV4aXN0cyl7XG4gICAgICB3aW5zdG9uLmluZm8oXCJGaWxlICVzIERORSwgY3JlYXRpbmdcIiwgZmlsZS5maWxlbm1hZSk7XG4gICAgICBkb3dubG9hZEZpbGUockZpbGUsIGZpbGUscGF0aCk7XG4gICAgICBmaWxlc0NyZWF0ZWQrPTE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBzdGF0KHBhdGgpO1xuICAgICAgaWYocmVtb3RlTW9kaWZpZWQgPiBzdGF0cy5tdGltZS5nZXRUaW1lKCkpe1xuICAgICAgICB3aW5zdG9uLmluZm8oXCJGaWxlICVzIG91dCBvZiBkYXRlLCB1cGRhdGluZ1wiLCBmaWxlLmZpbGVuYW1lKTtcbiAgICAgICAgZG93bmxvYWRGaWxlKHJGaWxlLCBmaWxlLHBhdGgpO1xuICAgICAgfVxuICAgICAgZmlsZXNNb2RpZmllZCs9MTtcbiAgICB9XG4gIH1cblxuICB3aW5zdG9uLmluZm8oXG4gICAgJ0NvdXJzZSAlZCBzeW5jIGNvbXBsZXRlLCAlZCB1cGRhdGVkLCAlZCBjcmVhdGVkJyxcbiAgICBjb3Vyc2VJZCwgZmlsZXNNb2RpZmllZCwgZmlsZXNDcmVhdGVkXG4gICk7XG4gIHJldHVybiB7ZmlsZXNDcmVhdGVkLCBmaWxlc01vZGlmaWVkfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuKCl7XG4gIHdpbnN0b24uaW5mbygnTGF1bmNoaW5nIGNhbnZhcyBzeW5jJyk7XG4gIGxldCBjb25maWc7XG4gIHRyeXtcbiAgICBjb25maWcgPSBKU09OLnBhcnNlKGF3YWl0IHJlYWRGaWxlKHRpbGRlKCd+Ly5jc3luY3JjJykpKTtcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIHdpbnN0b24uZXJyb3IoJ0ZhdGFsOiBFcnJvciByZWFkaW5nIGNvbmZpZyBmaWxlIGF0ICVzJywgdGlsZGUoJ34vLmNzeW5jcmMnKSwgZSk7XG4gICAgdGhyb3coZSk7XG4gIH1cbiAgY29uc3QgciA9IHJlcXVlc3QuZGVmYXVsdHMoe1xuICAgIGJhc2VVcmw6IGNvbmZpZy5jYW52YXNVcmwgKyAnL2FwaS92MS8nLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke2NvbmZpZy5hY2Nlc3NUb2tlbiAgIH1gXG4gICAgfSxcbiAgICBqc29uOiB0cnVlXG4gIH0pO1xuXG4gIGxldCBtb2RpZmllZCA9IDA7XG4gIGxldCBjcmVhdGVkID0gMDtcblxuICBmb3IgKGxldCBjb3Vyc2VJZCBvZiBPYmplY3Qua2V5cyhjb25maWcuY291cnNlcykpe1xuICAgIGNvbnN0IHBhdGggPSB0aWxkZShjb25maWcuY291cnNlc1tjb3Vyc2VJZF0pO1xuICAgIGxldCB7ZmlsZXNDcmVhdGVkLCBmaWxlc01vZGlmaWVkfSA9IGF3YWl0IHVwZGF0ZUNvdXJzZShwYXRoLCByLCBjb3Vyc2VJZCk7XG4gICAgbW9kaWZpZWQgKz0gZmlsZXNNb2RpZmllZDtcbiAgICBjcmVhdGVkICs9IGZpbGVzQ3JlYXRlZDtcbiAgfVxuICB3aW5zdG9uLmluZm8oJ0NhbnZhcyBzeW5jIGNvbXBsZXRlJywge2NyZWF0ZWQsIG1vZGlmaWVkfSk7XG4gIHJldHVybiB7Y3JlYXRlZCwgbW9kaWZpZWR9O1xufVxucnVuKCkudGhlbigpO1xuLy8gdXBkYXRlKDMwMjMwLCAnLi9kYXRhL2NzMTIxJykudGhlbigpO1xuIl19