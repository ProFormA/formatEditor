# coding=utf-8

import editor


task_filename =  "input/Hello_World_094.zip"
####################################################################
# clean up
####################################################################


filename_task_xml_1         = "output/task_094_1.xml"
filename_task_xml_2         = "output/task_094_2.xml"
filename_task_xml_reference = "output/task_094_reference.xml"

filename_problem_1          = "output/problem_094_1.txt"
filename_problem_2          = "output/problem_094_2.txt"
filename_problem_reference  = "output/problem_094_reference.txt"



editor.delete_file(filename_task_xml_1)
editor.delete_file(filename_task_xml_2)
editor.delete_file(filename_problem_1)
editor.delete_file(filename_problem_2)
editor.delete_temporary_files()


####################################################################
# start browser
####################################################################

# open browser
driver = editor.openBrowser()
editor.init(driver)
editor.openEditorPage()

####################################################################
####################################################################
####################################################################

# I N P U T
editor.loadTaskFile(task_filename)

####################################################################
####################################################################
####################################################################

# C H E C K S

####################################################################
####################################################################
####################################################################

editor.saveTaskFile()

# editor.export_1()

editor.export_to(filename_task_xml_1, filename_problem_1)

# lon_capa_problem_field_value_1 = editor.get_lon_capa_problem()
# check_lon_capa_problem(lon_capa_problem_field_value_1)


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
