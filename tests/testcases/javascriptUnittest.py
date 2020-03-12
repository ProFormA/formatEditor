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

    def execute_javafilename(self, test_input, expected_result):
        try:
            result = editor.driver.execute_script('return javaParser.getFilenameWithPackage("' + test_input + '");')
        except Exception as inst:
            self.error_counter = self.error_counter + 1
            print("x FAILED (EXCEPTION): " + (test_input))
            print("A " + str(type(inst)))  # the exception instance
            print("B " + str(inst.args))  # arguments stored in .args
            print("C " + str(inst))  # __str__ allows args to be printed directly,
            #x, y = inst.args  # unpack args
            #print('x =', x)
            #print('y =', y)
            return

        if result == None:
            print(("x FAILED: " + test_input + " => <None> expected was: " + expected_result))
            self.error_counter = self.error_counter + 1
        else:
            try:
                self.assertEqual(expected_result, result, result)
                print(("PASSED: " + test_input + " => " + expected_result))
            except:
                print(("x FAILED: " + test_input + " => " + result + " expected was: " + expected_result ))
                self.error_counter = self.error_counter + 1

    def execute_tasktitle(self, test_input, expected_result):
        result = editor.driver.execute_script('return taskTitleToFilename("' + test_input + '");')
        try:
            self.assertEqual(expected_result, result, result)
            print(("PASSED: " + test_input + " => " + expected_result))
        except:
            print(("x FAILED: " + test_input + " => " + result + " expected was: " + expected_result ))
            self.error_counter = self.error_counter + 1

    def test_zipfilename(self):
        self.error_counter = 0
        self.execute_tasktitle('hansi', 'hansi')
        self.execute_tasktitle('my Task', 'myTask')
        self.execute_tasktitle('this is my-Task', 'thisIsMy-Task')
        self.execute_tasktitle('this is my_Task', 'thisIsMy_Task')
        self.execute_tasktitle('this is a number 9', 'thisIsANumber9')
        self.execute_tasktitle('this is also a Number 88', 'thisIsAlsoANumber88')
        self.execute_tasktitle('this is nonsen$se', 'thisIsNonsen_Se')
        self.execute_tasktitle('this is nonsen?se', 'thisIsNonsen_Se')
        self.execute_tasktitle('this is nonsen/se', 'thisIsNonsen_Se')
        self.execute_tasktitle('this is +nonsen?se', 'thisIs_Nonsen_Se')
        self.execute_tasktitle('this is another number 9.6', 'thisIsAnotherNumber9_6')

        self.assertEqual(self.error_counter, 0, 'all tests passed')
        
    def test_java(self):
        self.error_counter = 0

        self.execute_javafilename('/* */ class X {}', 'X.java')
        self.execute_javafilename('/* */ class X<T> {}', 'X.java')
        self.execute_javafilename('class MyClass extends YourClass {}', 'MyClass.java')
        self.execute_javafilename('class MyClass implements YourClass {}', 'MyClass.java')
        self.execute_javafilename('public class MyClass implements YourClass {}', 'MyClass.java')
        self.execute_javafilename('interface Interface {}', 'Interface.java') # FAIL: interface not found
        self.execute_javafilename('public interface Map <K,V> {}', 'Map.java') # FAIL: interface not found
        self.execute_javafilename('public class TestMap<K,V> {}', 'TestMap.java')


        self.execute_javafilename('/* */ package A.B.C; class X {}', 'A/B/C/X.java')
        self.execute_javafilename('package A.B.C; class MyClass extends YourClass {}', 'A/B/C/MyClass.java')
        self.execute_javafilename('package A.B.C; class MyClass implements YourClass {}', 'A/B/C/MyClass.java')
        self.execute_javafilename('package A.B.C; /* */ class X<T> {}', 'A/B/C/X.java')
        self.execute_javafilename('package A.B.C; public class TestMap<K,V> {}', 'A/B/C/TestMap.java')
        self.execute_javafilename('package A.B.C; interface Interface {}', 'A/B/C/Interface.java') # FAIL: interface not found

        # multiline is not possible that way :-(
#        self.execute_javafilename('// comment '
#                                  'class X {'
#                                  '}', 'X.java')
#        self.execute_javafilename('/* comment */'
#                                  '// comment'
#                                  'class X {'
#                                  '}', 'X.java')

        self.assertEqual(self.error_counter, 0, 'all tests passed')
