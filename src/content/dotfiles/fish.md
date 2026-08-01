---
title: fish
note: interactive config
description: >-
  Ported off zsh once the plugin list stopped earning its keep. Autosuggestions,
  syntax highlighting and history search ship with the shell, so what is left is
  vi mode, aliases, and the two tools that need initialising.
order: 2
tags: [shell, macos]
---

The reason to move was subtraction. Autosuggestions, syntax highlighting,
history substring search and completions all ship with fish, which deleted most
of a zsh plugin manager and the startup cost that came with it.

Below is the interactive block. Machine-specific tails — tool installers
appending their own `PATH` lines — are left out; they belong to the machine,
not the config.

Vi mode is set through the variable rather than by calling
`fish_vi_key_bindings` directly — plugins that listen on
`--on-variable fish_key_bindings` need the event to rebind, and calling the
function skips it.

```fish file="~/.config/fish/config.fish"
if status is-interactive
    # vi mode + cursor shapes
    set -g fish_key_bindings fish_vi_key_bindings
    set -g fish_cursor_default block
    set -g fish_cursor_insert line
    set -g fish_cursor_visual block
    set -g fish_cursor_replace_one underscore

    # Ctrl+Right / Ctrl+Left word navigation, in both modes
    for m in default insert
        bind -M $m ctrl-right forward-word
        bind -M $m ctrl-left backward-word
    end

    # modern CLI swaps
    alias ls='eza --icons'
    alias ll='eza -lh --icons --git'
    alias la='eza -lah --icons --git'
    alias tree='eza --tree --icons'
    alias cat='bat'
    alias grep='rg --color=auto'
    alias diff='diff --color=auto'
    alias df='df -h'

    # git
    alias glog='env PAGER="less -F -X" git log'
    alias gadog='env PAGER="less -F -X" git log --all --decorate --oneline --graph'

    # homebrew
    alias bi='brew install'
    alias bic='brew install --cask'
    alias bl='brew list'
    alias bs='brew search'
    alias binfo='brew info'
    alias bup='brew update && brew upgrade && brew upgrade --cask --greedy && brew cleanup'
    alias bcleanup='brew cleanup -s && rm -rf (brew --cache)'

    # system
    alias c='clear'
    alias h='history'
    alias reload='exec fish'
    alias sleepnow='pmset sleepnow'
    alias caffeinateon='caffeinate -dimsu'

    # disk
    alias dusage='du -sh ./* 2>/dev/null | sort -h'
    alias free='vm_stat'

    # macos / finder
    alias o='open .'
    alias of='open -a Finder .'
    alias ql='qlmanage -p 2>/dev/null'
    alias reveal='open -R'

    # network
    alias flushdns='sudo dscacheutil -flushcache; and sudo killall -HUP mDNSResponder'
    alias ports='lsof -i -P -n | grep LISTEN'
    alias myip='curl -fsSL ifconfig.me'
    alias localip='ipconfig getifaddr en0'

    alias python='python3'

    # fzf
    set -gx FZF_DEFAULT_COMMAND 'fd --type f --hidden --strip-cwd-prefix'
    set -gx FZF_DEFAULT_OPTS '--height=60% --layout=reverse --border=rounded --preview-window=right:65%:wrap:border-left'

    # tool init
    zoxide init fish | source

    # Ctrl+T = file search, Ctrl+R = history (plugin default).
    # Ctrl+F stays on fish's accept-autosuggestion.
    fzf_configure_bindings --directory=ctrl-t
end
```

`glog` pipes through `less -F -X` so short logs print and exit instead of
trapping you in a pager for four lines. It is the alias I miss first on someone
else's machine.
