#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 进入生成的文件夹
cd ./dist

git init
git add -A
git commit -m 'deploy'

# # 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:cloud-prg/easy-record.git master:gh-pages

cd -
echo ">>> 项目根目录 $(pwd)"