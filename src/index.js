// import _ from 'lodash';
// import Promise from 'bluebird';
import {ensureDir, createWriteStream, pathExists, stat} from 'fs-extra';
import {join} from 'path';
import request from 'request-promise';
import winston from 'winston';

// import {baseUrl, token} from './config';

// process.on('unhandledRejection', r => console.error(r, r.stack));

const r = request.defaults({
  baseUrl: 'https://canvas.harvard.edu/api/v1/',
  headers: {
    'Authorization': 'Bearer 1875~aUXKCzRHdK3vjlcm379H48QUB9WXznfekW70T8HhNpzN1elGYIvlZswloz5UcXIO'
  },
  json: true
});

// Create requestor for files, which have different url prefix
const rFile = r.defaults({ baseUrl: null });

// r('/courses/30230/folders').then(console.log)

function downloadFile(file, path){
  winston.info('File %s out of date, updating', file.filename);
  rFile(file.url).pipe(createWriteStream(path));
}

async function update(courseId, dest){
  let folderPaths = {};
  winston.info('Updating course %d into path %d', courseId, dest);
  const folders = await r(`courses/${courseId}/folders`);
  for (let folder of folders){
    winston.info('(Potentially) creating folder: %s', folder.full_name);
    const path = join(dest, folder.full_name);
    folderPaths[folder.id] = folder.full_name;
    await ensureDir(path.toString());
  }
  const files = await r(`courses/${courseId}/files`);
  for (let file of files){
    const path = join(dest, folderPaths[file.folder_id], file.filename);
    const exists = await pathExists(path.toString());
    const remoteModified = Date.parse(file.updated_at);
    if (!exists){
      winston.info("File %s DNE, creating", file.filenmae);
      downloadFile(file,path);
    }
    else {
      const stats = await stat(path);
      if(remoteModified > stats.mtime.getTime()){
        winston.info("File %s out of date, updating", file.filename, {
          remoteModified,
          localModified: stats.mtime.getTime()
        });
        downloadFile(file,path);
      }
      else{
        winston.info("File %s up to date, ignoring", file.filename, {
          exists,
          remoteModified,
          localModified: stats.mtime.getTime()
        })
      }
    }
  }
  winston.info('Course %d sync complete', courseId);
}
update(30230, './data/cs121').then();
