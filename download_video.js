const fs = require('fs');
const https = require('https');
const path = require('path');

const fileId = '1tsLQ-zuEXF2fXA3PJmXkttXMe25zGlUE';
// Use absolute path or relative to script execution location
const dest = path.resolve(__dirname, 'booking-engine/client/public/hero-video.mp4');
const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

console.log(`Downloading to ${dest}...`);

const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);
  const request = https.get(url, (response) => {
    // Handle redirects
    if (response.statusCode === 302 || response.statusCode === 303) {
      console.log(`Redirecting to ${response.headers.location}...`);
      download(response.headers.location, dest, cb);
      return;
    }

    if (response.statusCode !== 200) {
      console.error(`Failed to download: ${response.statusCode}`);
      if (cb) cb(new Error(`Status code ${response.statusCode}`));
      return;
    }

    response.pipe(file);
    file.on('finish', () => {
      file.close(cb);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    if (cb) cb(err);
  });
};

download(url, dest, (err) => {
  if (err) {
    console.error('Download failed:', err);
  } else {
    console.log('Download completed successfully!');
  }
});

