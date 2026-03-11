"""APIキー露出検査テスト。

コードベース全体をスキャンし、APIキーやシークレットが
ハードコードされていないことを検証する。
"""

import os
import re
from pathlib import Path
from typing import Generator

import pytest

# プロジェクトルートディレクトリ
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# スキャン対象の拡張子
SCAN_EXTENSIONS = {
    ".py", ".ts", ".js", ".swift", ".yaml", ".yml",
    ".json", ".plist", ".xml", ".sh", ".env",
    ".toml", ".cfg", ".ini", ".md",
}

# スキャン除外ディレクトリ
EXCLUDE_DIRS = {
    "node_modules", ".git", "__pycache__", "venv", ".venv",
    "build", "dist", "htmlcov", ".mypy_cache", ".ruff_cache",
    "DerivedData", "Pods",
}

# スキャン除外ファイル名（テストファイル自身など）
EXCLUDE_FILES = {
    "test_api_key_exposure.py",
    "package-lock.json",
}

# APIキー・シークレットを検出する正規表現パターン
# 誤検知を減らすため、一般的なキー形式に限定
API_KEY_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    # Google API キー（AIza で始まる39文字）
    ("Google API Key", re.compile(r'AIza[0-9A-Za-z\-_]{35}')),
    # Firebase Web API キー
    ("Firebase API Key", re.compile(r'(?i)firebase[_\-]?api[_\-]?key\s*[:=]\s*["\']([^"\']{10,})["\']')),
    # 汎用的なAPIキーのハードコード（変数代入形式）
    ("Hardcoded API Key", re.compile(r'(?i)(?:api[_\-]?key|apikey|secret[_\-]?key|access[_\-]?token)\s*[:=]\s*["\']([A-Za-z0-9\-_]{20,})["\']')),
    # AWS アクセスキー（AKIA で始まる）
    ("AWS Access Key", re.compile(r'AKIA[0-9A-Z]{16}')),
    # 秘密鍵ファイルの埋め込み
    ("Private Key", re.compile(r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----')),
    # Bearer トークンのハードコード
    ("Hardcoded Bearer Token", re.compile(r'(?i)bearer\s+[A-Za-z0-9\-_\.]{20,}')),
    # パスワードのハードコード
    ("Hardcoded Password", re.compile(r'(?i)(?:password|passwd|pwd)\s*[:=]\s*["\'](?![\s"\']*(?:\{|%|mock|test|dummy|example|placeholder))[^"\']{8,}["\']')),
]

# テスト・モック用として許可するパターン（誤検知除外）
ALLOWLIST_PATTERNS = [
    re.compile(r'(?i)mock|test|dummy|example|placeholder|your[_\-]?api[_\-]?key'),
    re.compile(r'(?i)process\.env|os\.getenv|os\.environ|defineString'),
    re.compile(r'(?i)secrets?\.|SECRETS?\['),
    re.compile(r'(?i)\$\{\{?\s*secrets'),  # GitHub Actions シークレット参照
]


def _iter_source_files() -> Generator[Path, None, None]:
    """スキャン対象のソースファイルを列挙する。"""
    for root, dirs, files in os.walk(PROJECT_ROOT):
        # 除外ディレクトリをスキップ
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for filename in files:
            if filename in EXCLUDE_FILES:
                continue
            filepath = Path(root) / filename
            if filepath.suffix in SCAN_EXTENSIONS:
                yield filepath


def _is_allowlisted(line: str) -> bool:
    """許可リストに該当する行かどうかを判定する。"""
    return any(pattern.search(line) for pattern in ALLOWLIST_PATTERNS)


def _scan_file_for_keys(filepath: Path) -> list[tuple[str, int, str, str]]:
    """ファイル内のAPIキー露出を検出する。

    Returns:
        (パターン名, 行番号, ファイルパス, マッチした行) のリスト
    """
    violations: list[tuple[str, int, str, str]] = []

    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
    except (OSError, UnicodeDecodeError):
        return violations

    for line_num, line in enumerate(content.splitlines(), start=1):
        # コメント行やテスト用のモック値はスキップ
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith("//"):
            continue

        if _is_allowlisted(line):
            continue

        for pattern_name, pattern in API_KEY_PATTERNS:
            if pattern.search(line):
                rel_path = str(filepath.relative_to(PROJECT_ROOT))
                violations.append((pattern_name, line_num, rel_path, stripped))

    return violations


class TestApiKeyExposure:
    """APIキー露出テスト。"""

    def test_no_api_keys_in_source_code(self) -> None:
        """ソースコード内にAPIキーがハードコードされていないことを検証する。"""
        all_violations: list[tuple[str, int, str, str]] = []

        for filepath in _iter_source_files():
            violations = _scan_file_for_keys(filepath)
            all_violations.extend(violations)

        if all_violations:
            report_lines = ["APIキーのハードコードが検出されました:\n"]
            for pattern_name, line_num, filepath, line in all_violations:
                report_lines.append(
                    f"  [{pattern_name}] {filepath}:{line_num}"
                )
                # セキュリティのため行内容は先頭80文字まで表示
                truncated = line[:80] + "..." if len(line) > 80 else line
                report_lines.append(f"    {truncated}\n")

            pytest.fail("\n".join(report_lines))

    def test_no_env_files_committed(self) -> None:
        """本番用 .env ファイルがコミットされていないことを検証する。"""
        dangerous_env_files = [
            ".env",
            ".env.production",
            ".env.local",
            "backend/.env",
            "ai-server/.env",
            "ios/.env",
        ]

        found: list[str] = []
        for env_file in dangerous_env_files:
            env_path = PROJECT_ROOT / env_file
            if env_path.exists():
                # .env.example や .env.template は許可
                if "example" in env_file or "template" in env_file:
                    continue
                found.append(env_file)

        if found:
            pytest.fail(
                f".envファイルがリポジトリに含まれています: {', '.join(found)}\n"
                "本番シークレットをリポジトリにコミットしないでください。"
            )

    def test_gitignore_includes_env_files(self) -> None:
        """gitignore に .env ファイルの除外設定があることを検証する。"""
        gitignore_path = PROJECT_ROOT / ".gitignore"
        if not gitignore_path.exists():
            pytest.skip(".gitignore ファイルが存在しません")

        content = gitignore_path.read_text(encoding="utf-8")

        # .env が gitignore に含まれているか確認
        env_patterns = [".env", "*.env", ".env.*", ".env.local"]
        has_env_ignore = any(
            pattern in content for pattern in env_patterns
        )

        assert has_env_ignore, (
            ".gitignore に .env ファイルの除外パターンが設定されていません。\n"
            "秘密情報の漏洩を防ぐため、.env を .gitignore に追加してください。"
        )

    def test_no_credentials_json_committed(self) -> None:
        """Firebase/GCPの認証情報ファイルがコミットされていないことを検証する。"""
        credential_patterns = [
            "**/service-account*.json",
            "**/credentials*.json",
            "**/firebase-adminsdk*.json",
            "**/*-key.json",
        ]

        found_files: list[str] = []
        for pattern in credential_patterns:
            for filepath in PROJECT_ROOT.glob(pattern):
                # テストデータや例ファイルは除外
                if "test" in filepath.name.lower() or "example" in filepath.name.lower():
                    continue
                rel_path = str(filepath.relative_to(PROJECT_ROOT))
                found_files.append(rel_path)

        if found_files:
            pytest.fail(
                f"認証情報ファイルがリポジトリに含まれています:\n"
                + "\n".join(f"  - {f}" for f in found_files)
            )
