# coding=utf-8

import editor

description = "input111"
title = "input222"
filesize = "3333"
mimetype = "text/TEST"
lon_capa_path = "input4444/"
language = "en"
prog_lang = "python/2"



def check_lon_capa_problem(elemOutput):
   try:
       assert '/res/fhwf/input4444/input222.zip' in elemOutput
       editor.PASS("/res/fhwf/input4444/input222.zip found in LON CAPA problem file")
   except AssertionError:
       editor.FAILED("Not found: /res/fhwf/input4444/input222.zip")


####################################################################
# clean up
####################################################################


filename_task_xml_1         = "output/task_python_1.xml"
filename_task_xml_2         = "output/task_python_2.xml"
filename_task_xml_reference = "output/task_python_reference.xml"

filename_problem_1          = "output/problem_python_1.txt"
filename_problem_2          = "output/problem_python_2.txt"
filename_problem_reference  = "output/problem_python_reference.txt"



editor.delete_file(filename_task_xml_1)
editor.delete_file(filename_task_xml_2)
editor.delete_file(filename_problem_1)
editor.delete_file(filename_problem_2)
editor.delete_temporary_files()


####################################################################
# start browser
####################################################################

# open browser
#driver = editor.openFirefox()
driver = editor.openChrome()
editor.init(driver)
# with editor page
editor.openEditorPage()

####################################################################
####################################################################
####################################################################

# I N P U T

####################################################################
## fill MAIN page
####################################################################

# fill Task decription
editor.set_task_description(description)
# fill title
editor.set_task_title(title)
#fill filesize
editor.set_filesize(filesize)
# fill MimeType
editor.set_mimetype(mimetype)
# LON-CAPA path
editor.set_LON_CAPA_path(lon_capa_path)
# fill language
editor.set_language(language)
# fill programming language
editor.set_prog_language(prog_lang)

####################################################################
# fill FILES
####################################################################

# add 5 new files (1 is already added by editor)
editor.add_file()
editor.add_file()
editor.add_file()
editor.add_file()
editor.add_file()
# editor.add_file()

# fill filename
editor.set_filename(0, "file0.py")
editor.set_filename(1, "file1.py")
editor.set_filename(2, "file2.py")
editor.set_filename(3, "file3.py")
editor.set_filename(4, "file4.py")
editor.set_filename(5, "file5.py")

# fill file comment
editor.set_file_comment(0, "comment for file file0.py")
editor.set_file_comment(1, "comment for file file1.py")
editor.set_file_comment(2, "comment for file file2.py")
editor.set_file_comment(3, "comment for file file3.py")
editor.set_file_comment(4, "comment for file file4.py")
editor.set_file_comment(5, "comment for file file5.py")

# set file class
editor.set_file_class(0, 0)
editor.set_file_class(1, 1)
editor.set_file_class(2, 2)
editor.set_file_class(3, 3)
editor.set_file_class(4, 4)
editor.set_file_class(5, 0)

# fill file text
# does not work yet
editor.set_file_text(1, "# dummy file text 1")
editor.set_file_text(2, "# dummy file text #2")
# does not work with export!!
#editor.set_file_text(3, "// deutsche Umlaute öäüß in File 3")
editor.set_file_text(3, "# TODO: deutsche Umlautein File 3")
editor.set_file_text(4, "int i = 0; # in File 4")
editor.set_file_text(5, "some text in file #5")

# what shall I do with newline?
###editor.set_file_text(2, "int i = 0;\\nint j = 1;")


# remove first file
#editor.remove_file(4)
#editor.remove_file(2)
#editor.remove_file(1)
#editor.remove_file(1)
#editor.remove_file(0)
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

editor.set_model_solution_fileref2(1, "4")

####################################################################
# add Python test
####################################################################
# test titles and filerefs use common class name :-(
counter_test_index = 0

editor.add_python_test()
editor.add_python_test()

editor.set_test_file(counter_test_index, 1)
editor.set_test_title(counter_test_index, "Python Test #0")
editor.set_test_public(counter_test_index, "False")
editor.set_test_required(counter_test_index, "False")
# editor.set_junit_fileref2(counter_test_index, "1")

counter_test_index = counter_test_index + 1

editor.set_test_file(counter_test_index, 3)
editor.set_test_title(counter_test_index, "Python Test #1")
editor.set_test_public(counter_test_index, "True")
editor.set_test_required(counter_test_index, "True")
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
editor.set_test_file(counter_test_index, 4)
counter_test_index = counter_test_index + 1


editor.set_test_title(counter_test_index, "checkstyle test title #1")
editor.set_test_public(counter_test_index, "True")
editor.set_test_required(counter_test_index, "True")
editor.set_cs_version(1, 0)
editor.set_cs_max_warnings(1, "0")
editor.set_test_file(counter_test_index, 4)
counter_test_index = counter_test_index + 1


####################################################################
####################################################################
####################################################################

# C H E C K S

####################################################################
####################################################################
####################################################################



# editor.export_1()

editor.export_to(filename_task_xml_1, filename_problem_1)

lon_capa_problem_field_value_1 = editor.get_lon_capa_problem()
check_lon_capa_problem(lon_capa_problem_field_value_1)


if editor.is_file1_equal_to_file2(filename_problem_reference, filename_problem_1):
   editor.PASS("problem file output")
else:
   editor.FAILED("problem file is not ok!")


if editor.is_file1_equal_to_file2_except_for_uuid(filename_task_xml_reference, filename_task_xml_1):
   editor.PASS("task.xml output")
else:
   editor.FAILED("task.xml is not ok")

# todo: XSD validation
editor.perform_xml_lint_check(filename_task_xml_1);

# reimport
editor.import_task_xml()
# reexport
editor.export_to(filename_task_xml_2, filename_problem_2)

# expect task.xml to be unchanged except for uuid
if editor.is_file1_equal_to_file2_except_for_uuid(filename_task_xml_1, filename_task_xml_2):
   editor.PASS("task.xml export/import test")
else:
   editor.FAILED("task_1.xml does not match task_2.xml after reimport")

driver.close()
print "test finished"

