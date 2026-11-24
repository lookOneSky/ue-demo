"""Publish one loopback HTTP service with the local cloudflared installation."""

import os
import re
import shutil
import subprocess
import tempfile
import time
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path


DEFAULT_PROXY = "http://127.0.0.1:10808"
PUBLIC_URL = re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com\b")


def find_cloudflared(configured: str | Path | None = None) -> Path:
    if configured:
        path = Path(configured)
        if path.is_file():
            return path.resolve()
        raise RuntimeError(f"配置的 cloudflared 文件不存在：{path}")
    shared = Path("I:/CodeAll/QuickTunnel/cloudflared.exe")
    if shared.is_file():
        return shared
    installed = shutil.which("cloudflared")
    if installed:
        return Path(installed).resolve()
    raise RuntimeError("找不到 cloudflared，请配置其可执行文件路径，或将其加入 PATH。")


def _tunnel_environment(proxy: str) -> dict[str, str]:
    proxy_keys = {"HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "NO_PROXY"}
    env = {
        key: value for key, value in os.environ.items()
        if key.upper() not in proxy_keys and not key.upper().startswith("TUNNEL_")
    }
    if proxy:
        env.update(HTTP_PROXY=proxy, HTTPS_PROXY=proxy)
    env["NO_PROXY"] = "localhost,127.0.0.1,::1"
    return env


@dataclass(frozen=True)
class QuickTunnel:
    url: str
    log_path: Path
    process: subprocess.Popen

    def check_running(self) -> None:
        _check_running(self.process, self.log_path)


def _check_running(process: subprocess.Popen, log_path: Path) -> None:
    code = process.poll()
    if code is not None:
        raise RuntimeError(f"cloudflared 已退出（退出码 {code}），日志位于 {log_path}")


@contextmanager
def quick_tunnel(
    port: int,
    runtime_dir: Path,
    *,
    proxy: str = DEFAULT_PROXY,
    cloudflared_path: str | Path | None = None,
    timeout: float = 120,
    check_stop: Callable[[], None] | None = None,
) -> Iterator[QuickTunnel]:
    """Yield after registration. A raising check_stop callback cancels startup."""
    if not 1 <= port <= 65535 or timeout <= 0:
        raise ValueError("隧道端口必须在 1 至 65535 之间，等待时间须大于零。")
    executable = find_cloudflared(cloudflared_path)
    runtime_dir = Path(runtime_dir).resolve()
    runtime_dir.mkdir(parents=True, exist_ok=True)
    # Keep logs after exit, and isolate concurrent tunnels and their empty configs.
    run_dir = Path(tempfile.mkdtemp(prefix=f"tunnel-{port}-", dir=runtime_dir))
    config_path = run_dir / "quick-tunnel.yml"
    config_path.write_text("{}\n", encoding="utf-8")
    log_path = run_dir / "cloudflared.log"
    command = [
        str(executable), "tunnel", "--config", str(config_path), "--no-autoupdate",
        "--protocol", "http2", "--http-host-header", "127.0.0.1",
        "--url", f"http://127.0.0.1:{port}",
    ]
    with log_path.open("wb") as log:
        # Inherit the publishing console so closing its window also ends cloudflared.
        process = subprocess.Popen(
            command, env=_tunnel_environment(proxy), stdout=log, stderr=subprocess.STDOUT,
        )
        try:
            deadline = time.monotonic() + timeout
            while True:
                if check_stop is not None:
                    check_stop()
                _check_running(process, log_path)
                output = log_path.read_text(encoding="utf-8", errors="replace")
                match = PUBLIC_URL.search(output)
                if match and "Registered tunnel connection" in output:
                    yield QuickTunnel(match.group(), log_path, process)
                    return
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise RuntimeError(
                        f"等待公网隧道连接超时（{timeout:g} 秒）。"
                        f"请检查 TCP 7844 出站连接和日志 {log_path}"
                    )
                time.sleep(min(0.25, remaining))
        finally:
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
