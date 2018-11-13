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
# test for Java functions
#
# @copyright 2018 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>

import editor
import time
import editor
import zipFileTest


expectedZipName = "input222.zip"


description = "input111"
title = "input222"
filesize = "3333"
lon_capa_path = "input4444/"
language = "en"
prog_lang = "java/1.8"


#
# filename_task_xml_1         = "output/task_java_1.xml"
# filename_task_xml_2         = "output/task_java_2.xml"
# filename_task_xml_reference = "output/task_java_reference.xml"
#
# filename_problem_1          = "output/problem_java_1.txt"
# filename_problem_2          = "output/problem_java_2.txt"
# filename_problem_reference  = "output/problem_java_reference.txt"
#
#
#
# editor.delete_file(filename_task_xml_1)
# editor.delete_file(filename_task_xml_2)
# editor.delete_file(filename_problem_1)
# editor.delete_file(filename_problem_2)
# editor.delete_temporary_files()


class JavaTest(zipFileTest.ZipFileTest):

    def setUp(self):
        print "setup JavaTest"
        zipFileTest.ZipFileTest.setUp(self, 'java', 'java')
        editor.delete_old_task_files(expectedZipName, self.output_folder)


    def test_input(self):
        # I N P U T

        ####################################################################
        ## fill MAIN page
        ####################################################################

        # fill Task decription
        editor.set_task_description(description)
        # fill title
        editor.set_task_title(title)
        # fill internal description
        editor.set_task_comment('task internal description')
        # fill filesize
        editor.set_filesize(filesize)
        # fill regexp filename
        editor.set_regexp_filename("ABC123*")
        # LON-CAPA path
        editor.set_LON_CAPA_path(lon_capa_path)
        # fill language
        editor.set_language(language)
        # fill programming language
        editor.set_prog_language(prog_lang)

        ####################################################################
        # fill FILES
        ####################################################################

        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()

        # fill filename
        editor.set_filename(0, "file0.java")
        editor.set_filename(1, "file1.java")
        editor.set_filename(2, "file2.java")
        editor.set_filename(3, "file3.java")
        # set filename for file 4 later
        editor.set_filename(5, "file5.java")

        # fill file comment
        editor.set_file_comment(0, "comment for file file0.java")
        editor.set_file_comment(1, "comment for file file1.java")
        editor.set_file_comment(2, "comment for file file2.java")
        editor.set_file_comment(3, "comment for file file3.java")
        # set comment for file 4 later
        editor.set_file_comment(5, "comment for file file5.java")

        # set file class
        editor.set_template_filename("file1.java", 0)
        editor.set_library_filename("file2.java", 0)

#       editor.set_file_class(0, 0)
#       editor.set_file_class(1, 1)#
#       editor.set_file_class(2, 2)
#       editor.set_file_class(3, 3)
#       editor.set_file_class(4, 4)
#       editor.set_file_class(5, 0)

        # fill file text
        # does not work yet
        editor.set_file_text(1, "// dummy file text 1")
        editor.set_file_text(2, "// dummy file text #2")
        # does not work with export!!
        # editor.set_file_text(3, "// deutsche Umlaute öäüß in File 3")
        editor.set_file_text(3, "// TODO: deutsche Umlautein File 3")
        editor.set_file_text(4, "int i = 0; // in File 4")
        editor.set_file_text(5, "package de.test.test1; class MyClass {}")

        # set filename for actual java code
        # -> expect change of filename
        editor.set_filename(4, "file4.java")

        # beim Aufruf der nächsten Funktion verliert die Eingabe zurm Dateinamen den Fokus.
        # Dadurch wird ein Test ausgelöst, der feststellt, dass in der Datei ein Klassenname und
        # ein Packagename vorhanden sind. Daraufhin wird der Dateiname geändert.
        # Die eigentliche Eingabe geht daher verloren.
        editor.set_file_comment(4, "")
        time.sleep(1);
        editor.confirmPopup()
        #alert = driver.switch_to.alert
        #alert.accept()
        editor.set_file_comment(4, "comment for file file4.java")

        # what shall I do with newline?
        ###editor.set_file_text(2, "int i = 0;\\nint j = 1;")


        # remove first file
        # editor.remove_file(4)
        # editor.remove_file(2)
        # editor.remove_file(1)
        # editor.remove_file(1)
        # editor.remove_file(0)
        editor.remove_first_file()

        ####################################################################
        # fill MODEL SOLUTION
        ####################################################################

        # add model solution
        # editor.add_model_solution() # first model solution ist added by editor
        editor.add_model_solution()

        editor.set_model_solution_comment(0, "model solution #0")
        editor.set_model_solution_comment(1, "model solution #1")

        editor.add_file_to_model_solution(0, 2)
        editor.add_file_to_model_solution(1, 1)

        editor.append_file_to_model_solution(1)
        editor.add_file_to_model_solution(2, 3)  # attention: new file has (absolute) index 2!
        # editor.set_model_solution_fileref2(1, "4")

        ####################################################################
        # add Java compiler test
        ####################################################################
        # test titles and filerefs use common class name :-(
        counter_test_index = 0

        # add 2 compiler tests
        editor.add_java_compiler_test()
        editor.add_java_compiler_test()

        # fill compiler test #0
        editor.set_test_title(counter_test_index, "java compiler test title #0")
        editor.set_test_public(0, "False")
        editor.set_test_required(0, "False")
        editor.set_jct_flags(0, "flags")
        editor.set_jct_output_flags(0, "no_output_flags")
        editor.set_jct_libs(0, "selenium")
        # editor.set_jct_file_pattern(0, "*.java")
        # test of issue 24
        editor.set_jct_file_pattern(0, ".*(?<!(Test|lper)\.[jJ][aA][vV][aA])$")

        counter_test_index = counter_test_index + 1


        # fill compiler test #1
        editor.set_test_title(counter_test_index, "compiler test 1")
        counter_test_index = counter_test_index + 1

        ####################################################################
        # add Java JUnit test
        ####################################################################
        editor.add_junit_test()
        editor.add_junit_test()

        # fill JUnit test #0
        editor.set_test_description(0, "junit description # 0")
        editor.set_test_file(counter_test_index, 1)
        editor.set_test_title(counter_test_index, "JUnit Test #0")
        editor.set_junit_test_class(0, "JUNIT test class #0")
        editor.set_test_public(counter_test_index, "False")
        editor.set_test_required(counter_test_index, "False")
        editor.set_junit_version(0, 1)
        # editor.set_junit_fileref2(counter_test_index, "1")

        counter_test_index = counter_test_index + 1

        # fill JUnit test #1
        editor.set_test_description(1, "junit description # 1")
        editor.set_test_file(counter_test_index, 4) # file with package name
        # editor.set_test_title(counter_test_index, "JUnit Test #1")
        # editor.set_junit_test_class(1, "JUNIT test class #1")
        editor.set_test_public(counter_test_index, "True")
        editor.set_test_required(counter_test_index, "True")
        editor.set_junit_version(1, 0)
        # editor.set_junit_fileref2(counter_test_index, "2")


        counter_test_index = counter_test_index + 1

        ####################################################################
        # add CHECKSTYLE test
        ####################################################################
        editor.add_checkstyle()
        editor.add_checkstyle()

        editor.set_test_title(counter_test_index, "checkstyle test title #0")
        editor.set_test_public(counter_test_index, "False")
        editor.set_test_required(counter_test_index, "False")
        editor.set_cs_version(0, 0)
        editor.set_cs_max_warnings(0, "2")
        editor.set_test_file(counter_test_index, 3)
        counter_test_index = counter_test_index + 1

        editor.set_test_title(counter_test_index, "checkstyle test title #1")
        editor.set_test_public(counter_test_index, "True")
        editor.set_test_required(counter_test_index, "True")
        editor.set_cs_version(1, 1)
        editor.set_cs_max_warnings(1, "0")
        editor.set_test_file(counter_test_index, 3)
        counter_test_index = counter_test_index + 1

        # test environment converts / to \ so that the text is not visible :-(
        # editor.set_instruction_file("de/test/test1/MyClass.java", 0)


        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, False)



