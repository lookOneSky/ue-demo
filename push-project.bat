@chcp 65001 >nul & python -x "%~f0" %* && exit /b 0 || exit /b 1
from __future__ import annotations

import shutil
import subprocess
import sys
import time
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
PLUGIN_ROOT = PROJECT_ROOT / "PixelStreamingInfrastructure" / "Frontend" / "ui-library"
PLUGIN_DIST = PLUGIN_ROOT / "dist"
RUNTIME_DIST = (
    PROJECT_ROOT
    / "node_modules"
    / "@epicgames-ps"
    / "lib-pixelstreamingfrontend-ui-ue5.3"
    / "dist"
)
TRACKED_PATHS = (
    "src/components/sence.vue",
    "build-nginx.bat",
    "scripts/build-nginx.js",
    "push-project.bat",
)


def executable(name: str) -> str:
    result = shutil.which(name)
    if not result:
        raise RuntimeError(f"未找到命令：{name}")
    return result


def run(
    command: list[str],
    *,
    cwd: Path = PROJECT_ROOT,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    print(f"> {' '.join(command)}")
    return subprocess.run(command, cwd=cwd, check=check, text=True)


def output(command: list[str]) -> str:
    return subprocess.check_output(command, cwd=PROJECT_ROOT, text=True).strip()


def build_plugin(npm: str) -> None:
    run([npm, "run", "build"], cwd=PLUGIN_ROOT)
    RUNTIME_DIST.mkdir(parents=True, exist_ok=True)
    for file_name in (
        "lib-pixelstreamingfrontend-ui.esm.js",
        "lib-pixelstreamingfrontend-ui.js",
    ):
        shutil.copy2(PLUGIN_DIST / file_name, RUNTIME_DIST / file_name)


def push_with_retry(git: str, branch: str) -> None:
    command = [
        git,
        "push",
        "--set-upstream",
        "origin",
        branch,
    ]
    for attempt, delay in enumerate((0, 5, 15), start=1):
        if delay:
            print(f"推送失败，{delay} 秒后重试（{attempt}/3）...")
            time.sleep(delay)
        if run(command, check=False).returncode == 0:
            return
    raise RuntimeError("Git 推送连续失败 3 次")


def main() -> int:
    if sys.version_info < (3, 10):
        raise RuntimeError("需要 Python 3.10 或更高版本")

    git = executable("git")
    npx = executable("npx.cmd")

    if output([git, "rev-parse", "--is-inside-work-tree"]) != "true":
        raise RuntimeError("当前目录不是 Git 工作区")

    branch = output([git, "branch", "--show-current"])
    if not branch:
        raise RuntimeError("当前处于 detached HEAD，无法自动推送")

    if (PLUGIN_ROOT / "package.json").is_file():
        build_plugin(executable("npm.cmd"))
    run([npx, "vite", "build"])
    run([git, "add", "-u", "--", *TRACKED_PATHS])

    has_staged_changes = run(
        [git, "diff", "--cached", "--quiet"],
        check=False,
    ).returncode != 0
    if has_staged_changes:
        commit_message = (
            " ".join(sys.argv[1:]).strip()
            or "配置非本机像素流送地址并增加一键推送脚本"
        )
        run([git, "commit", "-m", commit_message])
    else:
        print("没有新的目标文件需要提交，继续推送现有提交。")

    push_with_retry(git, branch)
    print(f"完成：origin/{branch}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"失败：{error}", file=sys.stderr)
        raise SystemExit(1)
