#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const download = require('./toki-download');

program.usage('<project-name>').parse(process.argv);

let projectName = program.args[0];

if (!projectName) {
    program.help();
    return;
}

const list = glob.sync('*'); // 解析目录文件列表
let rootName =  path.basename(process.cwd()); // 获得当前目录名称
if (rootName === projectName) {
    rootName = '.'; // 可直接创建工程
} else if (list.length) { // 如果目录内有任何文件
    const existArr = list.filter(name => {
        const fileName = path.resolve(process.cwd(), path.join('.', name)); // 组装文件地址
        const isDir = fs.statSync(fileName).isDirectory(); // 只能同步去获取是否为目录
        return name.indexOf(projectName) !== -1 && isDir; // 文件名在所输入的prjectName中，且是个目录，代表输入的文件名已存在
    })
    if (existArr.length) {
        console.log(`项目${projectName}已经存在`); // 不是空数组，说明已存在输入的文件名
        return;
    } else if (rootName === projectName) {
        rootName = projectName; // 是空数组，将rootName设置为输入的名称
    }   
} else {
    rootName = projectName; // 目录没有文件且rootName不同与输入的名称，将rootName设为输入的名称
}
const go = () => {
    download(rootName).then(target => {
        const files = glob.sync(`${target}/*`);
        console.log(files);
        files.map(file => {
            fs.copyFile(path.resolve(process.cwd(), file), path.resolve(process.cwd(), path.join(rootName, '.', file)), (err) => {
                if (err) console.log(err);
            });
        })
    }).catch(err => console.log(err))
}

go();