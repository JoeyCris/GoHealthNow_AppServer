from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import SimpleHTTPServer
import SocketServer

import argparse
import BaseHTTPServer
import cgi
import logging
import os
import sys

from digits_detector import OCR

g_detector = OCR()


class MyRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):

	def detect(self,img_file):
		if img_file is not None and os.path.exists(img_file):
			#detector = OCR()

			rst, out_img_file = g_detector.predict(img_file)

			self.send_response(200)  # OK
			self.send_header('Content-type', 'application/json')
			self.end_headers()

			self.wfile.write('{"uri":"')
			self.wfile.write('/images/medical_digits/' + out_img_file)
			self.wfile.write('"}')


		else:
			self.send_response(400)  # OK
			self.send_header('Content-type', 'application/json')
			self.end_headers()

			self.wfile.write('{"result":"image file is not exist"}')



	def do_HEAD(self):
	    '''
	    Handle a HEAD request.
	    '''
	    logging.debug('HEADER %s' % (self.path))
	    self.send_response(200)
	    self.send_header('Content-type', 'text/html')
	    self.end_headers()

	def do_GET(self):
	    '''
	    Handle a GET request.
	    '''
	    logging.debug('GET %s' % (self.path))

	    # Parse out the arguments.
	    # The arguments follow a '?' in the URL. Here is an example:
	    #   http://example.com?arg1=val1
	    args = {}
	    idx = self.path.find('?')
	    if idx >= 0:
	        rpath = self.path[:idx]
	        args = cgi.parse_qs(self.path[idx+1:])
	    else:
	        rpath = self.path

	    # Print out logging information about the path and args.
	    if 'content-type' in self.headers:
	        ctype, _ = cgi.parse_header(self.headers['content-type'])
	        logging.debug('TYPE %s' % (ctype))

	    #print('PATH %s' % (rpath))
	    #print('ARGS %d' % (len(args)))
	    if len(args):
	        i = 0
	        for key in sorted(args):
	            print('ARG[%d] %s=%s' % (i, key, args[key]))
	            i += 1

		if rpath == '/detection' or self.path == '/detection/':

			file_name = args['image'][0]

			self.detect(file_name)	 
		else:	
			self.send_response(400)  # OK
			self.send_header('Content-type', 'application/json')
			self.end_headers() 

			self.wfile.write('{"result":"unknown path"}')           


def main():
	PORT = 9000



	Handler = MyRequestHandler #SimpleHTTPServer.SimpleHTTPRequestHandler

	httpd = SocketServer.TCPServer(("", PORT), Handler)

	print( "serving at port", PORT)
	httpd.serve_forever()

main()