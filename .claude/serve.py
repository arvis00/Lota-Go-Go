"""Dev server for web/ that never lets the browser cache a file."""
import functools, http.server, sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

http.server.test(HandlerClass=functools.partial(NoCache, directory='web'),
                 port=int(sys.argv[1]) if len(sys.argv) > 1 else 8123)
