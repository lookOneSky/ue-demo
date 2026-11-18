#!/usr/bin/env python3
"""Disable the Git HTTP/HTTPS proxy for this repository."""

from __future__ import annotations

import os
from pathlib import Path
import subprocess
import sys


PROXY_KEYS = ("http.proxy", "https.proxy")


def run_git(repository: Path, *arguments: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-C", str(repository), *arguments],
        capture_output=True,
        text=True,
        check=False,
    )


def same_path(left: Path, right: Path) -> bool:
    return os.path.normcase(os.path.realpath(left)) == os.path.normcase(
        os.path.realpath(right)
    )


def main() -> int:
    repository = Path(__file__).resolve().parent

    try:
        top_level = run_git(repository, "rev-parse", "--show-toplevel")
    except FileNotFoundError:
        print("未找到 git 命令，请先安装 Git 并将其加入 PATH。", file=sys.stderr)
        return 1

    if top_level.returncode != 0:
        detail = top_level.stderr.strip() or "无法识别 Git 仓库。"
        print(f"检查仓库失败：{detail}", file=sys.stderr)
        return top_level.returncode

    detected_repository = Path(top_level.stdout.strip())
    if not same_path(repository, detected_repository):
        print(f"脚本不在仓库根目录：{repository}", file=sys.stderr)
        return 1

    for key in PROXY_KEYS:
        result = run_git(repository, "config", "--local", "--replace-all", key, "")
        if result.returncode != 0:
            detail = result.stderr.strip() or f"无法写入 {key}。"
            print(f"取消代理失败：{detail}", file=sys.stderr)
            return result.returncode

    for key in PROXY_KEYS:
        result = run_git(repository, "config", "--local", "--get", key)
        if result.returncode != 0 or result.stdout.rstrip("\r\n") != "":
            print(f"验证失败：{key} 未被设置为空。", file=sys.stderr)
            return 1

    print(f"已取消 {repository} 的 Git HTTP/HTTPS 网络代理。")
    print("仅修改该仓库的本地配置，未修改全局 Git 配置。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
