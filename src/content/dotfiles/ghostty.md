---
title: ghostty
note: config
description: >-
  Translucent, undecorated-but-native, and deliberately still. No blinking
  cursor, no titlebar theming, nothing that moves unless I moved it.
order: 1
tags: [terminal, macos]
---

The terminal is the only application I have open all day, so the settings that
matter are the ones that stop it asking for attention: the cursor does not
blink, the mouse pointer gets out of the way while typing, and the window keeps
its own state between restarts.

Everything else is legibility. `JetBrainsMono NFM` at 15 with a block cursor
that inverts rather than overlays, so the character underneath stays readable.
The theme follows the system rather than picking a side.

```ini file="~/.config/ghostty/config"
theme = light:Apple System Colors Light,dark:Bright Lights
background-opacity = 0.75
background-blur-radius = 75
font-family = "JetBrainsMono NFM Regular"
font-size = 15
cursor-style = block
cursor-style-blink = false
cursor-invert-fg-bg = true
mouse-hide-while-typing = true
macos-titlebar-style = native
confirm-close-surface = true
window-decoration = true
window-padding-x = 8
window-padding-y = 2
window-padding-balance = true
window-save-state = always
macos-icon = official
shell-integration = fish
copy-on-select = clipboard
focus-follows-mouse = true
link-url = true
```

`copy-on-select` and `focus-follows-mouse` are the two that took longest to get
used to and would now be the hardest to give up. Together they remove most of
the clicking from moving between panes and pulling a line out of a log.
