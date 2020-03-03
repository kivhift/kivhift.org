AUTHOR = 'Joshua Hughes'
SITENAME = 'kivhiftian ruminations'
SITEURL = ''

PATH = 'content'
PAGE_PATHS = ['']
ARTICLE_PATHS = 'posts'.split()
STATIC_PATHS = 'images static'.split()
DIRECT_TEMPLATES = 'index'.split()

TIMEZONE = 'America/New_York'
DEFAULT_DATE_FORMAT = '%Y-%m-%d, %A'
DEFAULT_LANG = 'en'
DEFAULT_CATEGORY = ''
DISPLAY_CATEGORIES_ON_MENU = False
TYPOGRIFY = True
THEME = 'kivhift-theme'

ARTICLE_URL = 'posts/{date:%Y}/{date:%m}-{date:%d}-{slug}.html'
ARTICLE_SAVE_AS = ARTICLE_URL
PAGE_URL = '{slug}.html'
PAGE_SAVE_AS = PAGE_URL
AUTHOR_URL = ''
AUTHOR_SAVE_AS = ''
AUTHORS_SAVE_AS = ''
CATEGORY_URL = ''
CATEGORY_SAVE_AS = ''
CATEGORIES_SAVE_AS = ''
SUMMARY_MAX_LENGTH = 0

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

LINKS = None

# Social widget
SOCIAL = None

DEFAULT_PAGINATION = False
RELATIVE_URLS = True
