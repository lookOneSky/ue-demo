# 定制像素流送依赖

`@epicgames-ps` 下保存本项目定制的 UE 5.3 像素流送库。四个 `dist/*.js` 文件逐字节迁移自仓库原有的 `node_modules/@epicgames-ps` 快照，未替换成 npm 上的标准版本。

根目录 `package.json` 通过 `file:vendor/...` 声明依赖，`.npmrc` 的 `install-links=true` 让 npm 正常打包并安装本地包及其运行时依赖。新克隆和重新安装都只需执行 `npm install`，不再需要手工恢复 `node_modules`，也不依赖 Git 或子模块参与 npm 安装。

需要调整定制库时修改这里的快照，增加对应本地包 `package.json` 的 `version`，再执行 `npm install` 并一并保存更新后的锁文件，确保安装副本得到刷新；不要直接修改 `node_modules`。本地包只保留运行时元数据和打包文件，不包含上游的开发工具依赖。
