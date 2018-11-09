# coding=utf-8

# This is part of the ProFormA Editor
#
# This proformaEditor was created by the eCULT-Team of Ostfalia University
# http://ostfalia.de/cms/de/ecult/
# The software is distributed under a CC BY-SA 3.0 Creative Commons license
# https://creativecommons.org/licenses/by-sa/3.0/
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
# PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# script for running whole testsuite
#
# @copyright 2018 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>

import editor
import time

#from testcases import xsd_094_Unittest
#from testcases import javaUnittest
#from testcases import setlxDgUnittest
#from testcases import pythonUnittest

import unittest

only_one_browser = False



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

