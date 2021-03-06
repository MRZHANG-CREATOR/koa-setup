#!/usr/bin/env node

// 1. 在当前目录下创建文件夹
// 2. 安装插件 - koa koa-router koa-static koa-views
//    1. 可交互选择安装
// 3. index.js 这个文件的模板
//    1. 需要基于安装的插件动态生成
const chalk = require("chalk");
const log = console.log;
const getOptions = require("./options");
const path = require("path");
const MiddlewareTask = require("./middleware-task");
const createEntryPointCode = require("./create-entry-point");
const { FileTask, FolderTask, CommandTask, TaskManager } = require("./task");
let options;

(async () => {
  options = await getOptions();

  console.log(options);
  const taskManager = new TaskManager();
  // 创建项目文件夹
  taskManager.add(createPackageTask());

  // 创建入口文件 index.js
  const code = await createEntryPointCode(options);
  taskManager.add(createEntryPointFileTask(code));

  // 创建 npm package.json
  taskManager.add(initNpmTask());

  // 添加中间件的任务
  taskManager.add(MiddlewareTask(options.middleware, getRoot()));

  taskManager.add(installKoa());

  await taskManager.execute();

  // 安装结束
  log(chalk.hex("#7FFF00").bold(`cd ./${options.packageName} && nodemon index.js`));
  log(chalk.hex("#DEADED").bold("happy every day -_-#"));
})();

function getRoot() {
  return path.resolve(process.cwd(), options.packageName);
}

function createPackageTask() {
  return new FolderTask({
    name: "create package folder",
    path: getRoot(),
  });
}

function installKoa() {
  return new CommandTask({
    command: `cd ${getRoot()} && npm i koa`,
    name: "npm i koa",
  });
}

function initNpmTask() {
  return new CommandTask({
    command: `cd ${getRoot()} && npm init -y`,
    name: "npm init -y",
  });
}

function createEntryPointFileTask(content) {
  return new FileTask({
    content,
    name: "create entry point index.js",
    filename: "index.js",
    path: getRoot(),
  });
}
