const download = require('download-git-repo');
const path = require('path');

module.exports = (target) => {
    target = path.join(target || '.', 'download-temp');
    return new Promise((resolve, reject) => {
        download('github:SevenUMR/templates', target, { clone: true }, (err) => {
            if (err) console.log(err);
            resolve(target);
        })
    });
}