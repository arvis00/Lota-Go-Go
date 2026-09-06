"""Dev server for web/ that never lets the browser cache a file.

The port comes from the command line if it is given, otherwise from $PORT —
which is how the editor hands one over when 8131 is already taken by another
session's server — and otherwise 8123.
"""
import functools, http.server, os, sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    # Python guesses .m4a as audio/mp4a-latm, which iPhone Safari will not play.
    # GitHub Pages gets this right on its own; this is only for local testing.
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.m4a': 'audio/mp4'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT', 8123))
http.server.test(HandlerClass=functools.partial(NoCache, directory='web'), port=port)
