const download = require('download-git-repo');
const path = require('path');
const ora = require('ora');

module.exports = (target) => {
    target = path.join(target || '.', 'download-temp');
    const spinner = ora(`正在下载项目模板，请稍后...`);
    spinner.start();
    return new Promise((resolve, reject) => {
        download('github:SevenUMR/templates', target, { clone: true }, (err) => {
            if (err) {
                spinner.fail();
                console.log(err);
            } else {
                spinner.succeed()
                resolve(target);
            }
        })
    });
}