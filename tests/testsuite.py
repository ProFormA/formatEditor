# coding=utf-8

import editor
import time

#from testcases import xsd_094_Unittest
#from testcases import javaUnittest
#from testcases import setlxDgUnittest
#from testcases import pythonUnittest

import unittest

only_one_browser = True



loader = unittest.TestLoader()
start_dir = 'testcases'
# suite = loader.discover(start_dir, "java*.py")
suite = loader.discover(start_dir, "*test*.py")

runner = unittest.TextTestRunner(verbosity=2)

editor.browser = "Chrome"
print "----------------------------------------------------"
print "run test with * " + editor.browser + " * "
print "----------------------------------------------------"
runner.run(suite)

if not only_one_browser:

    time.sleep(3);

    editor.browser = "Firefox"
    print "----------------------------------------------------"
    print "run test with * " + editor.browser + " * "
    print "----------------------------------------------------"
    runner.run(suite)

