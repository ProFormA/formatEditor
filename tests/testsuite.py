# coding=utf-8

import editor
from testcases import xsd_094_Unittest
import unittest

print "----------------------------------------------------"
print "run test with * " + editor.browser + " * "
print "----------------------------------------------------"

loader = unittest.TestLoader()
start_dir = 'testcases'
suite = loader.discover(start_dir, "*test*.py")

runner = unittest.TextTestRunner()
runner.run(suite)

#print "run 0.94 version test (tc)"

#suite = unittest.TestLoader().loadTestsFromTestCase(xsd_094_Unittest.Xsd_0_94_Test)
#unittest.TextTestRunner(verbosity=2).run(suite)


# print "run 0.94 version test"
# import xsd_094_Test
# print "----"
#
# print "----"
# print "run JAVA TEST"
# import javaTest
# print "----"
#
# print "run PYTHON TEST"
# import pythonTest
# print "----"
#
# print "run SETLX and DEJAGNU TEST"
# import setlx_and_dejagnuTest
# print "----"


