#!/usr/bin/env python3
"""Start and stop the verification server process group.

Usage:
  proc.py start <pidfile> <logfile> <cwd> -- <command>...
  proc.py stop <pid>
  proc.py listeners <port> <root-pid>
"""

from __future__ import annotations

import os
import signal
import socket
import subprocess
import sys
import time


def start(pidfile: str, logfile: str, cwd: str, command: list[str]) -> None:
    log = open(logfile, "w", encoding="utf-8")
    proc = subprocess.Popen(
        command,
        cwd=cwd,
        stdout=log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    with open(pidfile, "w", encoding="utf-8") as handle:
        handle.write(f"{proc.pid}\n")
    print(proc.pid)


def _alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True


def stop(pid: int) -> None:
    if not _alive(pid):
        print(f"already-stopped {pid}")
        return
    try:
        os.killpg(pid, signal.SIGTERM)
    except ProcessLookupError:
        print(f"already-stopped {pid}")
        return
    for _ in range(50):
        if not _alive(pid):
            print(f"stopped {pid}")
            return
        time.sleep(0.1)
    try:
        os.killpg(pid, signal.SIGKILL)
    except ProcessLookupError:
        print(f"stopped {pid}")
        return
    time.sleep(0.2)
    print(f"killed {pid}")


def _process_tree(root: int) -> set[int]:
    children: dict[int, list[int]] = {}
    for entry in os.listdir("/proc"):
        if not entry.isdigit():
            continue
        pid = int(entry)
        try:
            with open(f"/proc/{pid}/status", encoding="utf-8") as handle:
                ppid = None
                for line in handle:
                    if line.startswith("PPid:"):
                        ppid = int(line.split()[1])
                        break
        except (FileNotFoundError, ProcessLookupError, ValueError):
            continue
        if ppid is None:
            continue
        children.setdefault(ppid, []).append(pid)
    seen: set[int] = set()
    stack = [root]
    while stack:
        pid = stack.pop()
        if pid in seen:
            continue
        seen.add(pid)
        stack.extend(children.get(pid, []))
    return seen


def _socket_inodes(pid: int) -> set[str]:
    inodes: set[str] = set()
    fd_dir = f"/proc/{pid}/fd"
    try:
        names = os.listdir(fd_dir)
    except (FileNotFoundError, PermissionError, OSError):
        return inodes
    for name in names:
        try:
            target = os.readlink(f"{fd_dir}/{name}")
        except OSError:
            continue
        if target.startswith("socket:[") and target.endswith("]"):
            inodes.add(target[len("socket:[") : -1])
    return inodes


def _listen_sockets(port: int) -> list[tuple[str, str]]:
    """Return (inode, bind) for TCP listeners on this port."""
    found: list[tuple[str, str]] = []
    hex_port = f"{port:04X}"
    for family, path in (("v4", "/proc/net/tcp"), ("v6", "/proc/net/tcp6")):
        try:
            lines = open(path, encoding="utf-8").read().splitlines()
        except FileNotFoundError:
            continue
        for line in lines[1:]:
            parts = line.split()
            if len(parts) < 10:
                continue
            local, state, inode = parts[1], parts[3], parts[9]
            if state != "0A":
                continue
            address, _, local_port = local.partition(":")
            if local_port.upper() != hex_port:
                continue
            if family == "v4":
                raw = bytes.fromhex(address)
                ip = ".".join(str(byte) for byte in raw[::-1])
                bind = f"{ip}:{port}"
            else:
                raw = bytes.fromhex(address)
                words = [raw[index : index + 4][::-1] for index in range(0, 16, 4)]
                ip = socket.inet_ntop(socket.AF_INET6, b"".join(words))
                bind = f"[{ip}]:{port}"
            found.append((inode, bind))
    return found


def listeners(port: str, root: int) -> None:
    sockets = _listen_sockets(int(port))
    if root == 0:
        if sockets:
            for _inode, bind in sockets:
                print(f"busy bind={bind}")
        else:
            print("none")
        return
    tree = _process_tree(root)
    owned_inodes: set[str] = set()
    for pid in tree:
        owned_inodes.update(_socket_inodes(pid))
    owned = False
    foreign = False
    for inode, bind in sockets:
        local = bind.startswith("127.0.0.1:") or bind.startswith("[::1]:")
        if inode in owned_inodes and local:
            owned = True
            print(f"owned pid={root} bind={bind}")
        else:
            foreign = True
            print(f"foreign bind={bind}")
    if not owned and not foreign:
        print("none")


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: proc.py start|stop|listeners ...", file=sys.stderr)
        sys.exit(2)
    action = sys.argv[1]
    if action == "start":
        if "--" not in sys.argv:
            print("start requires -- before the command", file=sys.stderr)
            sys.exit(2)
        split = sys.argv.index("--")
        pidfile, logfile, cwd = sys.argv[2:split]
        start(pidfile, logfile, cwd, sys.argv[split + 1 :])
        return
    if action == "stop":
        stop(int(sys.argv[2]))
        return
    if action == "listeners":
        listeners(sys.argv[2], int(sys.argv[3]))
        return
    print(f"unknown action {action}", file=sys.stderr)
    sys.exit(2)


if __name__ == "__main__":
    main()
