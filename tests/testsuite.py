# coding=utf-8

import editor
import time

from testcases import xsd_094_Unittest
from testcases import javaUnittest
from testcases import setlxDgUnittest
from testcases import pythonUnittest

import unittest

print "----------------------------------------------------"
print "run test with * " + editor.browser + " * "
print "----------------------------------------------------"

loader = unittest.TestLoader()
start_dir = 'testcases'
# suite = loader.discover(start_dir, "java*.py")
suite = loader.discover(start_dir, "*test*.py")

runner = unittest.TextTestRunner(verbosity=2)
runner.run(suite)

time.sleep(3);

editor.browser = "Firefox"
print "----------------------------------------------------"
print "run test with * " + editor.browser + " * "
print "----------------------------------------------------"
runner.run(suite)

