####################################################################
# start HHTP server
####################################################################
import SimpleHTTPServer
import SocketServer
import runpy
import os

PORT = 8000


def startHttpServer():

    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = SocketServer.TCPServer(("", PORT), Handler)

    # change working directory so that
    # the editor files are served
    os.chdir("..")
    
    # start the server
    print "serving at port", PORT
    httpd.serve_forever()


startHttpServer()

# Alternative auf der Kommandozeile

# python -m SimpleHTTPServer
# oder
# python -m SimpleHTTPServer PORT
