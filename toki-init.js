#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const download = require('./toki-download');
const rm = require('rimraf');
const inquirer = require('inquirer');
const generator = require('./generator');

program.usage('<project-name>').parse(process.argv);

let projectName = program.args[0];

if (!projectName) {
    program.help();
    return;
}

const list = glob.sync('*'); // 解析目录文件列表
let rootName = path.basename(process.cwd()); // 获得当前目录名称
let next = void 233;
if (rootName === projectName) {
    next = inquirer.prompt([
        {
          name: 'buildCurrent',
          message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
          type: 'confirm',
          default: true
        }
    ]).then(answer => {
        rootName = answer.buildCurrent ? '.' : projectName;
        return Promise.resolve(rootName) // 可直接创建工程
    })
} else if (list.length) { // 如果目录内有任何文件
    const existArr = list.filter(name => {
        const fileName = path.resolve(process.cwd(), path.join('.', name)); // 组装文件地址
        const isDir = fs.statSync(fileName).isDirectory(); // 只能同步去获取是否为目录
        return name.indexOf(projectName) !== -1 && isDir; // 文件名在所输入的prjectName中，且是个目录，代表输入的文件名已存在
    })
    if (existArr.length) {
        console.log(`项目${projectName}已经存在`); // 不是空数组，说明已存在输入的文件名
        return;
    } else {
        rootName = projectName;
        next = Promise.resolve(rootName)  // 是空数组，将rootName设置为输入的名称
    }   
} else {
    rootName = projectName;
    next = Promise.resolve(rootName) // 目录没有文件且rootName不同与输入的名称，将rootName设为输入的名称
}

const go = () => {
    next.then(projectRoot => {
        if (projectRoot !== '.') {
            fs.mkdirSync(projectRoot);
        }
        return(
            download(projectRoot).then(target => {
                copy(target);
                // rm(path.resolve(process.cwd(), target), err => {
                //     if (err) console.log(err);
                // });
                return {
                    name: projectRoot,
                    root: projectRoot,
                    downloadTemp: target,
                }
            }))
    }).then(dic => {
        return inquirer.prompt([
            {
                name: 'projectName',
                message: '项目的名称是什么？请用英文',
                default: dic.name,
            }, {
                name: 'projectVersion',
                message: '项目的版本号',
                default: '1.0.0',
            }, {
                name: 'projectDescription',
                message: '请输入项目的简介',
                default: `Toki的${dic.name}`
            }
        ]).then(answer => {
            return {
                ...dic,
                metaData: {
                    ...answer,
                }
            }
        })
    }).then(context => {
        return generator(context.metaData, context.root, context.root);
    }).then(context => {
        console.log('创建成功啦')
    }).catch(err => console.log(err));
}

const copy = (filePath, parentPath = '.') => {
    const files = glob.sync(`${filePath}/*`);
    files.map(file => {
        const isDir = fs.statSync(file).isDirectory();
        const srcPath = path.resolve(process.cwd(), file);
        const distPath = path.resolve(path.join(process.cwd(), rootName), path.join(parentPath, '.', path.basename(file)));
        fs.copyFileSync(srcPath, distPath)
        if (isDir) {
            copy(`${filePath}/${path.basename(file)}`, path.join(parentPath, path.basename(file)));
        }
    })
}

next && go();