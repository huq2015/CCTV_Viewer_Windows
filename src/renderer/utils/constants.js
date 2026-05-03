const CHANNELS = [
  { id: 0,  name: "CCTV-1 综合",       category: "cctv", url: "https://tv.cctv.com/live/cctv1/" },
  { id: 1,  name: "CCTV-2 财经",       category: "cctv", url: "https://tv.cctv.com/live/cctv2/" },
  { id: 2,  name: "CCTV-3 综艺",       category: "cctv", url: "https://tv.cctv.com/live/cctv3/" },
  { id: 3,  name: "CCTV-4 中文国际（亚）", category: "cctv", url: "https://tv.cctv.com/live/cctv4/" },
  { id: 4,  name: "CCTV-5 体育",       category: "cctv", url: "https://tv.cctv.com/live/cctv5/" },
  { id: 5,  name: "CCTV-6 电影",       category: "cctv", url: "https://tv.cctv.com/live/cctv6/" },
  { id: 6,  name: "CCTV-7 国防军事",    category: "cctv", url: "https://tv.cctv.com/live/cctv7/" },
  { id: 7,  name: "CCTV-8 电视剧",      category: "cctv", url: "https://tv.cctv.com/live/cctv8/" },
  { id: 8,  name: "CCTV-9 纪录",       category: "cctv", url: "https://tv.cctv.com/live/cctvjilu" },
  { id: 9,  name: "CCTV-10 科教",      category: "cctv", url: "https://tv.cctv.com/live/cctv10/" },
  { id: 10, name: "CCTV-11 戏曲",      category: "cctv", url: "https://tv.cctv.com/live/cctv11/" },
  { id: 11, name: "CCTV-12 社会与法",   category: "cctv", url: "https://tv.cctv.com/live/cctv12/" },
  { id: 12, name: "CCTV-13 新闻",      category: "cctv", url: "https://tv.cctv.com/live/cctv13/" },
  { id: 13, name: "CCTV-14 少儿",      category: "cctv", url: "https://tv.cctv.com/live/cctvchild" },
  { id: 14, name: "CCTV-15 音乐",      category: "cctv", url: "https://tv.cctv.com/live/cctv15/" },
  { id: 15, name: "CCTV-16 奥林匹克",   category: "cctv", url: "https://tv.cctv.com/live/cctv16/" },
  { id: 16, name: "CCTV-17 农业农村",   category: "cctv", url: "https://tv.cctv.com/live/cctv17/" },
  { id: 17, name: "CCTV-5+ 体育赛事",   category: "cctv", url: "https://tv.cctv.com/live/cctv5plus/" },
  { id: 18, name: "CCTV-4 中文国际（欧）", category: "cctv", url: "https://tv.cctv.com/live/cctveurope" },
  { id: 19, name: "CCTV-4 中文国际（美）", category: "cctv", url: "https://tv.cctv.com/live/cctvamerica/" },
  { id: 20, name: "北京卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002309" },
  { id: 21, name: "江苏卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002521" },
  { id: 22, name: "东方卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002483" },
  { id: 23, name: "浙江卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002520" },
  { id: 24, name: "湖南卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002475" },
  { id: 25, name: "湖北卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002508" },
  { id: 26, name: "广东卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002485" },
  { id: 27, name: "广西卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002509" },
  { id: 28, name: "黑龙江卫视", category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002498" },
  { id: 29, name: "海南卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002506" },
  { id: 30, name: "重庆卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002531" },
  { id: 31, name: "深圳卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002481" },
  { id: 32, name: "四川卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002516" },
  { id: 33, name: "河南卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002525" },
  { id: 34, name: "福建东南卫视", category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002484" },
  { id: 35, name: "贵州卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002490" },
  { id: 36, name: "江西卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002503" },
  { id: 37, name: "辽宁卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002505" },
  { id: 38, name: "安徽卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002532" },
  { id: 39, name: "河北卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002493" },
  { id: 40, name: "山东卫视",  category: "local", url: "https://www.yangshipin.cn/tv/home?pid=600002513" }
];

const KEYBOARD = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  MENU: 'KeyM',
  BACK: 'KeyB',
  REFRESH: 'KeyR',
  ZOOM_IN: 'Equal',
  ZOOM_OUT: 'Minus'
};

const UI = {
  COLORS: {
    BG_PRIMARY: '#000000',
    BG_OVERLAY: 'rgba(0, 0, 0, 0.85)',
    BG_OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.5)',
    TEXT_PRIMARY: '#ffffff',
    TEXT_SECONDARY: '#cccccc',
    ACCENT: '#2196F3',
    ACCENT_HOVER: '#42A5F5',
    BORDER: 'rgba(255, 255, 255, 0.2)'
  },
  FONTS: {
    BASE: '"Microsoft YaHei", "PingFang SC", sans-serif',
    SIZES: {
      small: '16px',
      medium: '20px',
      large: '24px',
      xlarge: '28px'
    }
  },
  DIMENSIONS: {
    CHANNEL_LIST_WIDTH: 440,
    CHANNEL_LIST_FIRST_COL: 160,
    CHANNEL_LIST_SECOND_COL: 280,
    MENU_HEIGHT: 80,
    SETTINGS_WIDTH: 500
  },
  ANIMATION: {
    DURATION: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms'
    },
    EASING: 'ease-out'
  }
};

const IPC_CHANNELS = {
  KEYBOARD_UP: 'keyboard:up',
  KEYBOARD_DOWN: 'keyboard:down',
  KEYBOARD_ENTER: 'keyboard:enter',
  KEYBOARD_MENU: 'keyboard:menu',
  KEYBOARD_BACK: 'keyboard:back',
  KEYBOARD_REFRESH: 'keyboard:refresh',
  APP_QUIT: 'app:quit',
  STORE_GET: 'store:get',
  STORE_SET: 'store:set',
  WINDOW_ENTER_FULLSCREEN: 'window:enter-fullscreen',
  WINDOW_EXIT_FULLSCREEN: 'window:exit-fullscreen'
};

const DEFAULT_SETTINGS = {
  directChannelChange: false,
  directBack: true,
  textSize: 'medium'
};

module.exports = {
  CHANNELS,
  KEYBOARD,
  UI,
  IPC_CHANNELS,
  DEFAULT_SETTINGS
};
