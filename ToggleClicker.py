"""
File Name: ToggleClicker.py
Author: Stanley Chen
Date Created: June 12, 2024
Description: F6 to activate, hold LMB when activated to autoclick
"""

import ctypes
from ctypes import wintypes
import threading
import time
from pynput import mouse, keyboard

user32 = ctypes.windll.user32

WH_MOUSE_LL = 14
WM_LBUTTONDOWN = 0x0201
WM_LBUTTONUP = 0x0202
LLMHF_INJECTED = 0x00000001

if ctypes.sizeof(ctypes.c_void_p) == 8:
    LRESULT = ctypes.c_longlong
    ULONG_PTR = ctypes.c_ulonglong
else:
    LRESULT = ctypes.c_long
    ULONG_PTR = ctypes.c_ulong

LowLevelMouseProc = ctypes.WINFUNCTYPE(
    LRESULT,
    ctypes.c_int,
    wintypes.WPARAM,
    wintypes.LPARAM
)


class POINT(ctypes.Structure):
    _fields_ = [
        ("x", wintypes.LONG),
        ("y", wintypes.LONG)
    ]


class MSLLHOOKSTRUCT(ctypes.Structure):
    _fields_ = [
        ("pt", POINT),
        ("mouseData", wintypes.DWORD),
        ("flags", wintypes.DWORD),
        ("time", wintypes.DWORD),
        ("dwExtraInfo", ULONG_PTR)
    ]


is_holding = False
clicking = False

mouse_controller = mouse.Controller()

hook_proc_ptr = None
hook_handle = None


def hook_proc(nCode, wParam, lParam):
    global is_holding

    if nCode == 0:
        info = ctypes.cast(lParam, ctypes.POINTER(MSLLHOOKSTRUCT)).contents
        if not (info.flags & LLMHF_INJECTED):
            if wParam == WM_LBUTTONDOWN:
                is_holding = True
            elif wParam == WM_LBUTTONUP:
                is_holding = False

    return user32.CallNextHookEx(hook_handle, nCode, wParam, lParam)


def hook_thread():
    global hook_proc_ptr, hook_handle

    hook_proc_ptr = LowLevelMouseProc(hook_proc)

    hook_handle = user32.SetWindowsHookExW(
        WH_MOUSE_LL,
        hook_proc_ptr,
        None,
        0
    )

    if not hook_handle:
        raise ctypes.WinError()

    msg = wintypes.MSG()

    while True:
        result = user32.GetMessageW(ctypes.byref(msg), None, 0, 0)
        if result == 0 or result == -1:
            break
        user32.TranslateMessage(ctypes.byref(msg))
        user32.DispatchMessageW(ctypes.byref(msg))


def clicker_thread():
    while True:
        if clicking and is_holding:
            mouse_controller.click(mouse.Button.left, 1)
            time.sleep(0.002)
        else:
            time.sleep(0.005)


def on_key_press(key):
    global clicking
    if key == keyboard.Key.f6:
        clicking = not clicking
        print("Autoclicker:", clicking)


threading.Thread(target=hook_thread, daemon=True).start()
threading.Thread(target=clicker_thread, daemon=True).start()

with keyboard.Listener(on_press=on_key_press) as listener:
    listener.join()
