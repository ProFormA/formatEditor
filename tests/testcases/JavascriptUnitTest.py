# coding=utf-8# coding=utf-8

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
# test for Python functions
#
# @copyright 2019 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>


import unittest
import editor

class JavascriptUnitTest(unittest.TestCase):

    error_counter = 0
    def setUp(self):

        print("----------------------------------------------------")
        print("starting Unit Test: " + self._testMethodName)
        print("----------------------------------------------------")

        self.driver = editor.openBrowser()
        editor.init(self.driver)
        editor.openEditorPage()

    def execute_test(self, test_input, expected_result):
        result = editor.driver.execute_script('return taskTitleToFilename("' + test_input + '");')
        try:
            self.assertEqual(expected_result, result, result)
            print(("PASSED: " + test_input + " => " + expected_result))
        except:
            print(("x FAILED: " + test_input + " => " + result + " expected was: " + expected_result ))
            self.error_counter = self.error_counter + 1

    def test_zipfilename(self):
        self.execute_test('hansi', 'hansi')
        self.execute_test('my Task', 'myTask')
        self.execute_test('this is my-Task', 'thisIsMy-Task')
        self.execute_test('this is my_Task', 'thisIsMy_Task')
        self.execute_test('this is a number 9', 'thisIsANumber9')
        self.execute_test('this is also a Number 88', 'thisIsAlsoANumber88')
        self.execute_test('this is nonsen$se', 'thisIsNonsen_Se')
        self.execute_test('this is nonsen?se', 'thisIsNonsen_Se')
        self.execute_test('this is nonsen/se', 'thisIsNonsen_Se')
        self.execute_test('this is +nonsen?se', 'thisIs_Nonsen_Se')
        self.execute_test('this is another number 9.6', 'thisIsAnotherNumber9_6')


        self.assertEqual(self.error_counter, 0, 'all tests passed')