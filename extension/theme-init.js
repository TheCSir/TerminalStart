(function () {
    var BUILTIN_THEMES = {
        darkish: { bg: '#0d0d0d', fg: '#e0e0e0', muted: '#777777', border: '#333333', accent: '#ffffff', hover: '#222222' },
        nord: { bg: '#2e3440', fg: '#d8dee9', muted: '#4c566a', border: '#434c5e', accent: '#88c0d0', hover: '#3b4252' },
        blossom: { bg: '#2d2024', fg: '#f5c2e7', muted: '#5c404b', border: '#5c404b', accent: '#f5e0dc', hover: '#3e2e34' },
        lavender: { bg: '#232136', fg: '#e0def4', muted: '#908caa', border: '#44415a', accent: '#c4a7e7', hover: '#2a273f' },
        crimson: { bg: '#1a0b0c', fg: '#e8c0c2', muted: '#5e2a2e', border: '#4a1a1e', accent: '#ff4455', hover: '#2d1315' },
        oled: { bg: '#000000', fg: '#ffffff', muted: '#666666', border: '#333333', accent: '#00ff00', hover: '#111111' },
        evergreen: { bg: '#0f1f1c', fg: '#d1e8e2', muted: '#2c5248', border: '#1f423a', accent: '#2bcb97', hover: '#162e29' },
        greyish: { bg: '#222222', fg: '#aaaaaa', muted: '#555555', border: '#444444', accent: '#dddddd', hover: '#333333' },
        lightish: { bg: '#f0f0f0', fg: '#222222', muted: '#888888', border: '#cccccc', accent: '#000000', hover: '#e0e0e0' },
        solarDark: { bg: '#002b36', fg: '#839496', muted: '#586e75', border: '#073642', accent: '#b58900', hover: '#073642' },
        solarLight: { bg: '#fdf6e3', fg: '#657b83', muted: '#93a1a1', border: '#eee8d5', accent: '#cb4b16', hover: '#eee8d5' },
        mix: { bg: '#191919', fg: '#f0f0f0', muted: '#ff00ff', border: '#00ffff', accent: '#ffff00', hover: '#2a2a2a' },
        crt: { bg: '#050505', fg: '#33ff33', muted: '#1b5e20', border: '#2e7d32', accent: '#69f0ae', hover: '#0a1a0b' },
        dracula: { bg: '#282a36', fg: '#f8f8f2', muted: '#6272a4', border: '#44475a', accent: '#bd93f9', hover: '#44475a' },
        gruvbox: { bg: '#282828', fg: '#ebdbb2', muted: '#928374', border: '#504945', accent: '#fabd2f', hover: '#3c3836' },
        monokai: { bg: '#272822', fg: '#f8f8f2', muted: '#75715e', border: '#49483e', accent: '#a6e22e', hover: '#3e3d32' },
        cyberpunk: { bg: '#000b1e', fg: '#00f3ff', muted: '#054863', border: '#003a5c', accent: '#ff003c', hover: '#001a3d' },
        toxic: { bg: '#121212', fg: '#e0e0e0', muted: '#333333', border: '#1f1f1f', accent: '#00ff41', hover: '#1a1a1a' },
        synthwave: { bg: '#2b213a', fg: '#fff', muted: '#534b62', border: '#463c57', accent: '#ff71ce', hover: '#382e4a' },
        nightowl: { bg: '#011627', fg: '#d6deeb', muted: '#637777', border: '#5f7e97', accent: '#82aaff', hover: '#0b2942' },
        coffee: { bg: '#201a1a', fg: '#d0c0c0', muted: '#5c4b4b', border: '#3c3030', accent: '#c0a080', hover: '#2d2424' },
        oceanic: { bg: '#1b2b34', fg: '#d8dee9', muted: '#4f5b66', border: '#343d46', accent: '#6699cc', hover: '#23343f' },
        rosepine: { bg: '#191724', fg: '#e0def4', muted: '#6e6a86', border: '#26233a', accent: '#ebbcba', hover: '#1f1d2e' },
        catppuccin: { bg: '#1e1e2e', fg: '#cdd6f4', muted: '#6c7086', border: '#313244', accent: '#fab387', hover: '#181825' },
        kanagawa: { bg: '#1f1f28', fg: '#dcd7ba', muted: '#727169', border: '#2a2a37', accent: '#7e9cd8', hover: '#2a2a37' },
        ayu: { bg: '#0d1017', fg: '#bfbdb6', muted: '#565b66', border: '#1c2028', accent: '#e6b450', hover: '#131721' },
        poimandres: { bg: '#1b1e28', fg: '#a6accd', muted: '#506477', border: '#2b3040', accent: '#add7ff', hover: '#232738' },
        flexoki: { bg: '#100f0f', fg: '#cecdc3', muted: '#575653', border: '#282726', accent: '#d0a215', hover: '#1c1b1a' },
        vesper: { bg: '#101010', fg: '#b8b8b8', muted: '#505050', border: '#2a2a2a', accent: '#ffc799', hover: '#1a1a1a' },
        palenight: { bg: '#292d3e', fg: '#a6accd', muted: '#676e95', border: '#3a3f58', accent: '#89ddff', hover: '#32374d' },
        midnight: { bg: '#09090b', fg: '#fafafa', muted: '#71717a', border: '#27272a', accent: '#a78bfa', hover: '#18181b' },
        graphite: { bg: '#161616', fg: '#f4f4f4', muted: '#525252', border: '#262626', accent: '#78a9ff', hover: '#1e1e1e' }
    };
    try {
        var themeName = JSON.parse(localStorage.getItem('tui-theme') || '"midnight"');
        var customThemes = JSON.parse(localStorage.getItem('tui-custom-themes') || '{}');
        var theme = (customThemes[themeName] && customThemes[themeName].colors) || BUILTIN_THEMES[themeName] || BUILTIN_THEMES.midnight;
        var r = document.documentElement.style;
        r.setProperty('--color-bg', theme.bg);
        r.setProperty('--color-fg', theme.fg);
        r.setProperty('--color-muted', theme.muted);
        r.setProperty('--color-border', theme.border);
        r.setProperty('--color-accent', theme.accent);
        r.setProperty('--color-hover', theme.hover);
        document.body && (document.body.style.backgroundColor = theme.bg);
    } catch (e) { }
})();
