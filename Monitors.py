#!/usr/bin/env python3
#brightness_control.py
import sys

def get_brightness():
    brightness = 50  # Placeholder value
    print(brightness)  # GNOME Shell extension reads this output

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "get":
        get_brightness()
