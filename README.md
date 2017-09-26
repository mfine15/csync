# csync-canvas

> rsync for Canvas

csync-canvas (or csync for short) is a node package to reguarly download and sync files uploaded through [Canvas LMS](https://www.canvaslms.com/) by Instructure with your local filesystem. I got tired of manually downloading and updating the litany of files my classes hosted in canvas, so I wrote this instead.

After installing and configuring csync, simply by running `node csync-canvas` (or by having cron regularly do so), you'll be able to place every course file for each course in a directory, gracefully handling modifications, conflicts, and deletion.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To run csync, node version > 8.14 must be installed. Furthermore, while csync can work as a one off utility, it's designed to  sync a directory regularly. As such, it is useful to have a cron-like service installed, but csync is agnostic as to which one.

### Installing

To install csynv, run `npm install -g csync-canvas`. Csync requires a `.csyncrc` config file to be stored at `~/.csyncrc`. This file should contain a json string with the following keys and sample values.

```json
{
  "logFile": "~/.csync_logs",
  "canvasUrl": "https://canvas.harvard.edu",
  "accessToken": {{TOKEN}},
  "courses": {
    "30230": "~/data/cs121",
    "29128": "~/data/ES50",
    "30724": "~/data/Gov1510",
    "31265": "~/data/Ling83"
  }
}
```

### csyncrc options

#### logFile

The location of the file which csync outputs logs and error logs. If not present, logs will be swallowed.

#### canvasUrl

The root url of the canvas website you access. Csync assumes the api is accesible at `${canvasUrl}/api/v1`

#### accessToken

To use the canvas api you'll need to provide an accessToken giving `csync` access to your canvas account. To obtain a token, go to your canvas homepage and click on `account` on the sidebar on the left, then click `settings` (alternatively, simply navigate to `${canvasUrl}/profile/settings`. Near the bottom of the page, click the "+ New Access Token" button. In the purpose field enter "csync", and leave the expiration field blank. Click Generate Token, and copy the token that appears in the token field (which should look something like `1842~OpPmQPcEzr7qWYeasd7343F5k2Y…`). Paste this token in your `.csyncrc` file.

#### courses

The courses json object tells csync which courses to download files from (because canvas often lists inactive or prior courses in a user profile), and what directory to download such course files to. For each specified courseId, csync will create a folder (if it does not already exist) `course files` in the corresponding directory, and csync will make that folder an exact replica of the course files on canvas. 

To obtain the courseId for a course, go to the canvas page for said course, and the ID can be found in the url, which should have format similar to `https://canvas.harvard.edu/courses/${courseId}`

## Running csync on schedule

After following these instructions, csync should be configured and ready to go. But if you don't want to have to manually type `node csync-canvas` to keep your local course files in sync, you might want to configure csync to run on a schedule. This can be done with a number of utilities depending on platform, from `cron` to Mac's `launchcd`. 

Csync is agnostic to such schedulers, but will happily work through one. Docs for launchcd can be found [here](http://www.launchd.info/), and a cron intro [here](http://www.unixgeeks.org/security/newbie/unix/cron-1.html).

## Contributing

Csync targets node 8.14, compiled via babel. 

### Setup

```bash
$ git clone https://github.com/mfine15/csync
$ cd csync
$ npm i 
```

Then, csync can be run once with

```bash
$ npm run
```

Or can be rebuilt on change by running

```bash
$ npm watch 
```

This places all compiled node files into `dist/`, to be run with `node dist/index.js`.

### Style

Csync style should conform to the `.eslintrc`, which is loosely based around `eslint:recommended`.

## Authors

* **Michael Fine** 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone who's code was used
* rsync, for enabling such derivative naming patterns
* Instructure, for creating an open and well documented API for their platform
