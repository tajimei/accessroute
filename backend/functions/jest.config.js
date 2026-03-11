/** @type {import('jest').Config} */
module.exports = {
  // TypeScript を ts-jest で変換
  preset: "ts-jest",
  testEnvironment: "node",

  // テストファイルのパターン
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],

  // カバレッジ設定
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/__tests__/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],

  // モジュール解決
  moduleFileExtensions: ["ts", "js", "json"],
};
