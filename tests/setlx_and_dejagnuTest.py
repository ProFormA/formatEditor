# coding=utf-8

import editor





def check_lon_capa_problem(elemOutput):
   try:
       assert '/res/fhwf/input4444/input222.zip' in elemOutput
       editor.PASS("/res/fhwf/input4444/input222.zip found in LON CAPA problem file")
   except AssertionError:
       editor.FAILED("FAILED: Not found: /res/fhwf/input4444/input222.zip")


####################################################################
# clean up
####################################################################


filename_task_xml_1         = "output/task_setlx_dg_1.xml"
filename_task_xml_2         = "output/task_setlx_dg_2.xml"
filename_task_xml_reference = "output/task_setlx_dg_reference.xml"

filename_problem_1          = "output/problem_setlx_dg_1.txt"
filename_problem_2          = "output/problem_setlx_dg_2.txt"
filename_problem_reference  = "output/problem_setlx_dg_reference.txt"



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
editor.set_task_description("input111")
# fill title
editor.set_task_title("input222")
#fill filesize
editor.set_filesize("3333")
# fill MimeType
editor.set_mimetype("text/TEST")
# LON-CAPA path
editor.set_LON_CAPA_path("input4444/")
# fill language
editor.set_language("en")
# fill programming language
editor.set_prog_language("setlX/2.40")

####################################################################
# fill FILES
####################################################################

# add 5 new files (1 is already added by editor)
editor.add_file()
editor.remove_first_file()

editor.add_file()
editor.add_file()
editor.add_file()
editor.add_file()
# editor.add_file()

# fill filename
editor.set_filename(0, "file0.stlx")
editor.set_filename(1, "file1.stlx")
editor.set_filename(2, "file2.stlx")
editor.set_filename(3, "file3.stlx")
editor.set_filename(4, "file4.stlx")

# fill file comment
editor.set_file_comment(0, "comment for file file0.stlx")
editor.set_file_comment(1, "comment for file file1.stlx")
editor.set_file_comment(2, "comment for file file2.stlx")
editor.set_file_comment(3, "comment for file file3.stlx")
editor.set_file_comment(4, "comment for file file4.stlx")

# set file class
editor.set_file_class(0, 0)
editor.set_file_class(1, 1)
editor.set_file_class(2, 2)
editor.set_file_class(3, 3)
editor.set_file_class(4, 4)

# fill file text
# does not work yet
# Attention! The interface for set_file_text uses the internal index
# of the editor array. This internal array has no index 0 since it has been deleted.
# So we must use index 1 as the first!
editor.set_file_text(1, "some text in file #0")
editor.set_file_text(2, "/* dummy file text 1 */")
editor.set_file_text(3, "/* dummy file text #2 */")
# does not work with export!!
#editor.set_file_text(3, "// deutsche Umlaute öäüß in File 3")
editor.set_file_text(4, "/* TODO: deutsche Umlautein File 3*/")
editor.set_file_text(5, "int i = 0; # in File 4")

# what shall I do with newline?
###editor.set_file_text(2, "int i = 0;\\nint j = 1;")


# remove first file
#editor.remove_file(4)
#editor.remove_file(2)
#editor.remove_file(1)
#editor.remove_file(1)
#editor.remove_file(0)




####################################################################
# fill MODEL SOLUTION
####################################################################

# add model solution
# editor.add_model_solution() # first model solution ist added by editor
editor.change_tab("ms_tab")
editor.set_model_solution_comment(0, "model solution #0")

editor.add_file_to_model_solution(0, 1)
editor.append_file_to_model_solution(0)
#editor.set_model_solution_fileref2(0, "4")
editor.add_file_to_model_solution(1, 4) # attention: new file has (absolute) index 1!


####################################################################
# add SETLX test
####################################################################
# test titles and filerefs use common class name :-(
counter_test_index = 0

editor.add_setlx_test()
editor.add_setlx_test()

editor.set_test_file(counter_test_index, 1)
editor.set_test_title(counter_test_index, "SETLX Test #0")
editor.set_test_public(counter_test_index, "False")
editor.set_test_required(counter_test_index, "False")

# framework and version cannot be changed
# => no test
#editor.set_test_framework(counter_test_index, "False")
#editor.set_test_version(counter_test_index, "False")
# editor.set_test_fileref2(counter_test_index, "1")

counter_test_index = counter_test_index + 1

editor.set_test_file(counter_test_index, 3)
editor.set_test_title(counter_test_index, "SETLX Test #1")
editor.set_test_public(counter_test_index, "True")
editor.set_test_required(counter_test_index, "True")
# editor.set_test_fileref2(counter_test_index, "2")


counter_test_index = counter_test_index + 1


####################################################################
# add SETLX syntax check
####################################################################
# test titles and filerefs use common class name :-(
editor.add_setlx_syntax()

editor.set_test_file(counter_test_index, 1)
editor.set_test_title(counter_test_index, "SETLX Syntax check #0")
editor.set_test_public(counter_test_index, "False")
editor.set_test_required(counter_test_index, "False")

# framework and version cannot be changed
# => no test
#editor.set_test_framework(counter_test_index, "False")
#editor.set_test_version(counter_test_index, "False")
# editor.set_test_fileref2(counter_test_index, "1")
counter_test_index = counter_test_index + 1

####################################################################
# add DEJAGNU tester
####################################################################
editor.add_dejagnu_tester()
editor.add_dejagnu_tester()

editor.set_test_title(counter_test_index, "dejagnu tester title #0")
editor.set_test_public(counter_test_index, "False")
editor.set_test_required(counter_test_index, "False")
editor.set_test_file(counter_test_index, 3)
counter_test_index = counter_test_index + 1


editor.set_test_title(counter_test_index, "dejagnu tester title #1")
editor.set_test_public(counter_test_index, "True")
editor.set_test_required(counter_test_index, "True")
editor.set_test_file(counter_test_index, 4)
counter_test_index = counter_test_index + 1


####################################################################
# add DEJAGNU setup
####################################################################
editor.add_dejagnu_setup()

editor.set_test_title(counter_test_index, "dejagnu setup title #0")
editor.set_test_public(counter_test_index, "False")
editor.set_test_required(counter_test_index, "False")
editor.set_test_file(counter_test_index, 3)
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
editor.TEST_SUMMARY()
