// 副作用を起こすコードにしないとtreeshakeされてしまうので意図的に副作用が起こるコードにする
// eslint-disable-next-line prefer-const
let _stack = [];

// eslint-disable-next-line import/no-anonymous-default-export
export default function () {
  // NOTE: post_build.sh でこの文字列が含まれているかチェックするための目印
  _stack.push('######DEVELOPMENT ONLY CODES######');
}
