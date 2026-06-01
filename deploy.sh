#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

echo ">>>> 当前目录 $(pwd)"
# 进入生成的文件夹
cd ./dist
echo ">>> dist目录 $(pwd)"

git init
git add -A
# 无变更时 git commit 会失败；set -e 会中止脚本，导致无法 push
if ! git diff --staged --quiet; then
  git commit -m 'deploy'
else
  echo ">>> dist 相对上次提交无变更，跳过 commit"
fi

# 发布到 https://<USERNAME>.github.io/<REPO>（须与仓库名一致）
git push -f git@github.com:cloud-prg/simple-resume.git HEAD:gh-pages

cd -
echo ">>> 项目根目录 $(pwd)"