import time
import threading
from pynput import mouse, keyboard

toggle = keyboard.Key.f6

clicking = False
middleDown = False
rat = mouse.Controller()

def onClick(x, y, button, pressed):
    global middleDown
    if button == mouse.Button.middle:
        middleDown = pressed


def clicker():
    while True:                                                                 
        if clicking and middleDown:
            rat.click(mouse.Button.left, 1)
            time.sleep(0.01)
        else:
            time.sleep(0.005)
    
def toggled(key):
    global clicking
    if key == toggle:
        clicking = not clicking
        print("Autoclicker:", clicking)

clonk = threading.Thread(target=clicker, daemon=True)
clonk.start()


mouse.Listener(on_click=onClick).start()

with keyboard.Listener(on_press=toggled) as key:
    key.join()