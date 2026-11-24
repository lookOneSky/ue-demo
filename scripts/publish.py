"""Run the local demo and optionally share its preview through a Quick Tunnel."""

import argparse
import json
import msvcrt
import shutil
import subprocess
import sys
import time
from contextlib import contextmanager, nullcontext
from pathlib import Path
from uuid import uuid4

from quick_tunnel import quick_tunnel


ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / ".publish"
STATE = RUNTIME / "session.json"


@contextmanager
def publish_lock():
    RUNTIME.mkdir(exist_ok=True)
    with (RUNTIME / "publish.lock").open("a+b") as lock:
        lock.seek(0)
        try:
            msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
        except OSError:
            yield False
        else:
            yield True  # Closing the handle releases the Windows byte-range lock.


def save_state(session, **fields):
    session.update(fields)
    temporary = STATE.with_suffix(".tmp")
    temporary.write_text(json.dumps(session, ensure_ascii=False), encoding="utf-8")
    # A simultaneous Windows status read can briefly prevent replacement.
    deadline = time.monotonic() + 2
    while True:
        try:
            temporary.replace(STATE)
            return
        except PermissionError:
            if time.monotonic() >= deadline:
                raise
            time.sleep(0.05)


def current_session():
    with publish_lock() as idle:
        if idle:
            return None
        try:
            return json.loads(STATE.read_text(encoding="utf-8"))
        except FileNotFoundError:
            return {"phase": "正在启动"}


@contextmanager
def preview_server():
    node = shutil.which("node")
    if not node or not (ROOT / "node_modules/vite/package.json").is_file():
        raise RuntimeError("请安装 Node.js，并在项目根目录运行 npm install。")
    process = subprocess.Popen(
        [node, str(ROOT / "scripts/publish-preview.mjs")],
        cwd=ROOT, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
        text=True, encoding="utf-8", errors="replace",
    )
    try:
        for line in process.stdout:
            try:
                message = json.loads(line)
            except ValueError:
                print(line, end="", file=sys.stderr)
                continue
            if message.get("event") == "ready":
                yield process, message
                return
        raise RuntimeError("本机网页未启动，请查看上方构建信息。")
    finally:
        process.stdin.close()
        try:
            process.wait(timeout=15)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
        process.stdout.close()


def publish(local_only):
    with publish_lock() as acquired:
        if not acquired:
            raise RuntimeError("已有发布窗口。运行“发布到公网.bat status”可查看地址。")
        session = {"id": uuid4().hex, "phase": "正在构建"}
        stop_file = RUNTIME / ("stop-" + session["id"])

        def check_stop():
            if stop_file.exists():
                raise KeyboardInterrupt

        try:
            save_state(session)
            print("正在构建 APIDemo …", flush=True)
            with preview_server() as (process, preview):
                check_stop()
                print("本机地址", preview["url"], flush=True)
                phase = "仅本机预览" if local_only else "正在连接公网"
                save_state(session, local=preview["url"], phase=phase)
                if not local_only:
                    print("正在连接 Cloudflare …", flush=True)
                tunnel_context = nullcontext() if local_only else quick_tunnel(
                    preview["port"], RUNTIME, check_stop=check_stop,
                )
                with tunnel_context as tunnel:
                    if tunnel:
                        save_state(session, public=tunnel.url, phase="公网发布中")
                        print("公网地址", tunnel.url, flush=True)
                    print("保持此窗口开启，按 Ctrl+C 停止。", flush=True)
                    while process.poll() is None:
                        check_stop()
                        if tunnel:
                            tunnel.check_running()
                        time.sleep(0.25)
                    raise RuntimeError("本机网页服务已退出。")
        finally:
            STATE.unlink(missing_ok=True)
            stop_file.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description="构建 APIDemo 并从本机发布临时 HTTPS 网站")
    parser.add_argument("action", nargs="?", default="up", choices=["up", "status", "stop"])
    parser.add_argument("--local-only", action="store_true", help="仅在本机预览")
    args = parser.parse_args()
    if args.action == "up":
        publish(args.local_only)
        return
    session = current_session()
    if session is None:
        print("当前没有发布。")
    elif args.action == "status":
        print(session["phase"])
        for field in ("local", "public"):
            if session.get(field):
                print(session[field])
    elif "id" in session:
        (RUNTIME / ("stop-" + session["id"])).touch()
        print("正在停止发布 …", flush=True)
        deadline = time.monotonic() + 120
        while time.monotonic() < deadline:
            active = current_session()
            if not active or active.get("id") != session["id"]:
                print("发布已停止。")
                return
            time.sleep(0.25)
        raise RuntimeError("停止请求已保留，发布窗口仍在处理当前步骤。")
    else:
        raise RuntimeError("发布窗口正在初始化，请稍后再试。")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("发布已停止。")
    except (OSError, RuntimeError, ValueError) as error:
        print(error, file=sys.stderr)
        sys.exit(1)
