// 副作用を起こすコードにしないとtreeshakeされてしまうので意図的に副作用が起こるコードにする
let _stack = [];

export default function () {
  // NOTE: post_build.sh でこの文字列が含まれているかチェックするための目印
  _stack.push('######DEVELOPMENT ONLY CODES######');
}
