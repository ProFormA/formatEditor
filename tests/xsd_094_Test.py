# coding=utf-8


import editor

# editor.browser = "Firefox"


task_filename =  "input/Hello_World_094.zip"
filename_task_xml = "HelloWorld.zip"
#filename_task_1_xml = "HelloWorld_1.zip"

output_folder = "output/xsd_094"

output_folder + "/" + filename_task_xml
####################################################################
# clean up
####################################################################


filename_task_xml_1         = "output/xsd_094/task_094_1.xml"
filename_task_xml_2         = "output/xsd_094/task_094_2.xml"
filename_task_xml_reference = "output/xsd_094/task_094_reference.xml"

filename_problem_1          = "output/xsd_094/problem_094_1.txt"
filename_problem_2          = "output/xsd_094/problem_094_2.txt"
filename_problem_reference  = "output/xsd_094/problem_094_reference.txt"



editor.delete_file(filename_task_xml_1)
editor.delete_file(filename_task_xml_2)
editor.delete_file(filename_problem_1)
editor.delete_file(filename_problem_2)
editor.delete_temporary_files()
editor.delete_old_task_files(filename_task_xml, output_folder)


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
# load zip file basing on XSD version 0.94
editor.loadTaskFile(task_filename, False)

####################################################################
####################################################################
####################################################################

# C H E C K S

# todo: XSD validation
editor.perform_xml_lint_check(filename_task_xml_1);


####################################################################
####################################################################
####################################################################

# save task (expecting it to be converted to new version)
editor.saveTaskFile(filename_task_xml, output_folder, filename_task_xml_1)

if editor.is_file1_equal_to_file2_except_for_uuid(filename_task_xml_reference, filename_task_xml_1):
   editor.PASS("task.xml output")
else:
   editor.FAILED("task.xml is not ok")


# save LAN CAPA file
editor.saveLonCapa(filename_problem_1)

if editor.is_file1_equal_to_file2(filename_problem_reference, filename_problem_1):
   editor.PASS("problem file output (1)")
else:
   editor.FAILED("problem file is not ok! (1)")





# reimport
editor.loadTaskFile(output_folder + "/" + filename_task_xml, True)
# export
editor.saveTaskFile(filename_task_xml, output_folder, filename_task_xml_2)

# editor.export_to(filename_task_xml_2, filename_problem_2)
if editor.is_file1_equal_to_file2_except_for_uuid(filename_task_xml_1, filename_task_xml_2):
   editor.PASS("task.xml export/import test")
else:
   editor.FAILED("task_1.xml does not match task_2.xml after reimport")



# resave LAN CAPA file
editor.saveLonCapa(filename_problem_2)

if editor.is_file1_equal_to_file2(filename_problem_reference, filename_problem_2):
   editor.PASS("problem file output (2)")
else:
   editor.FAILED("problem file is not ok! (2)")


driver.close()
print "test finished"
editor.TEST_SUMMARY()
