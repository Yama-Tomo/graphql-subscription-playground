#!/bin/sh

esc=$(printf '\033')
function red() {
  printf "${esc}[31;1m%s${esc}[m\n" "$1"
}

dirname=$(cd $(dirname $0);pwd)
cd ${dirname}/../

test_utils_mark=$(node -e "console.log(require('./src/test_utils/tree_shake')())")
result=$(grep -lr "${test_utils_mark}" .next | grep -v '.next/cache/')

if [ "${result}" != "" ]; then
  red "ERROR: test_utilsのコードがバンドルされています";
  exit 1
fi
