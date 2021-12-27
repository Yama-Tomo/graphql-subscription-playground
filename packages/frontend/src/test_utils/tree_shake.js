// eslint-disable-next-line @typescript-eslint/no-empty-function
// console.__noop = () => {};
// function noop(arg) {}

module.exports = function () {
  // NOTE: post_build.sh でこの文字列が含まれているかチェックするための目印
  return '######DEVELOPMENT ONLY CODES######';
};
