# coding=utf-8

import editor

description = "input111"
title = "input222"
filesize = "3333"
mimetype = "text/TEST"
lon_capa_path = "input4444/"
language = "en"
prog_lang = "java/1.8"

# does it make sense to check the output that way?
# better check whole task.xml manually and then recheck by file compare!
def check_task_xml(elemOutput):
   try:
      assert '<description><![CDATA[' +description + ']]></description>' in elemOutput
   except AssertionError:
      print 'Not found: <description><![CDATA[' +description + ']]></description>'

   try:
      assert '<title>' + title + '</title>' in elemOutput
   except AssertionError:
      print 'Not found: <title>' + title + '</title>'

   try:
      assert 'max-size="' + filesize + '"' in elemOutput
   except AssertionError:
      print 'Not found: submission-restrictions max-size="' + filesize + '"'

   try:
      assert 'mime-type-regexp="' + mimetype + '"' in elemOutput
   except AssertionError:
      print 'Not found: mime-type-regexp=' + mimetype

   try:
      assert 'lang="' + language + '"' in elemOutput
   except AssertionError:
      print 'Not found: lang="' + language + '"'

   try:
      assert 'proglang version="1.8">java</proglang' in elemOutput
   except AssertionError:
      print 'Not found: proglang version="1.8">java</proglang'

   try:
      assert 'file1.java' in elemOutput
   except AssertionError:
      print 'Not found: file1.java'

   try:
      assert 'id="2" type="embedded"' in elemOutput
   except AssertionError:
      print 'Not found: id="2"'

   try:
      assert 'model solution #0' in elemOutput
   except AssertionError:
      print 'Not found: model solution #0'

   try:
      assert '<title>java compiler test title #0</title>' in elemOutput
   except AssertionError:
      print 'Not found: <title>java compiler test title #0</title>'

   try:
      assert 'Description>junit description # 0</praktomat:config-testDescription>' in elemOutput
   except AssertionError:
      print 'Not found: junit description # 0'

   try:
      assert 'title>checkstyle test title #0</title>' in elemOutput
   except AssertionError:
      print 'Not found: checkstyle test title #0'

   try:
      assert '<praktomat:public>False</praktomat:public>' in elemOutput
   except AssertionError:
      print '<praktomat:public>False<'
   print 'check_task_xml finished'


def check_lon_capa_problem(elemOutput):
   try:
       assert '/res/fhwf/input4444/input222.zip' in elemOutput
   except AssertionError:
       print 'Not found: /res/fhwf/input4444/input222.zip'
   print 'check_lon_capa_problem finished'
       

def Test2(elemOutput):
   try:
      assert '<title>Field erased</title>' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: Field erased'
   print 'Test2 finished'
      





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

# add 6 new files
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
editor.set_filename(3, "file2.java")
editor.set_filename(4, "file4.java")
editor.set_filename(5, "file5.java")

# fill file comment
editor.set_file_comment(0, "comment for file file0.java")
editor.set_file_comment(1, "comment for file file1.java")
editor.set_file_comment(2, "comment for file file2.java")
editor.set_file_comment(3, "comment for file file3.java")
editor.set_file_comment(4, "comment for file file4.java")
editor.set_file_comment(5, "comment for file file5.java")

# set file class
editor.set_file_class(0, 0)
editor.set_file_class(1, 1)
editor.set_file_class(2, 2)
editor.set_file_class(3, 3)
editor.set_file_class(4, 4)
editor.set_file_class(5, 0)

# fill file text
# does not work yet
editor.set_file_text(1, "// dummy file text 1")
editor.set_file_text(2, "// dummy file text #2")
# does not work with export!!
#editor.set_file_text(3, "// deutsche Umlaute öäüß in File 3")
editor.set_file_text(3, "// TODO: deutsche Umlautein File 3")
editor.set_file_text(4, "int i = 0; // in File 4")
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
editor.add_model_solution()
editor.add_model_solution()

editor.set_model_solution_comment(0, "model solution #0")
editor.set_model_solution_comment(1, "model solution #1")

editor.add_file_to_model_solution(0, 2)
editor.add_file_to_model_solution(1, 1)

editor.set_model_solution_fileref2(1, "4")

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
editor.set_jct_file_pattern(0, "*.java")
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
editor.set_junit_description(0,"junit description # 0" )
editor.add_file_to_junit(counter_test_index, 1)
editor.set_test_title(counter_test_index, "JUnit Test #0")
editor.set_junit_test_class(0, "JUNIT test class #0")
editor.set_test_public(counter_test_index, "False")
editor.set_test_required(counter_test_index, "False")
editor.set_junit_version(0, 1)
# editor.set_junit_fileref2(counter_test_index, "1")

counter_test_index = counter_test_index + 1

# fill JUnit test #1
editor.set_junit_description(1,"junit description # 1" )
editor.add_file_to_junit(counter_test_index, 3)
editor.set_test_title(counter_test_index, "JUnit Test #1")
editor.set_junit_test_class(1, "JUNIT test class #1")
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
editor.add_file_to_checkstyle(counter_test_index, 4)
counter_test_index = counter_test_index + 1


editor.set_test_title(counter_test_index, "checkstyle test title #1")
editor.set_test_public(counter_test_index, "True")
editor.set_test_required(counter_test_index, "True")
editor.set_cs_version(1, 0)
editor.set_cs_max_warnings(1, "0")
editor.add_file_to_checkstyle(counter_test_index, 4)
counter_test_index = counter_test_index + 1


####################################################################
####################################################################
####################################################################

# create field value for task.xml and LON-CAPA-problem
editor.export()
task_xml_field_value_1 = editor.get_task_xml()
lon_capa_problem_field_value_1 = editor.get_lon_capa_problem()

check_task_xml(task_xml_field_value_1)
check_lon_capa_problem(lon_capa_problem_field_value_1)

text_file = open("task_1.xml", "w")
text_file.write(task_xml_field_value_1)
text_file.close()


text_file = open("problem_1.xml", "w")
text_file.write(lon_capa_problem_field_value_1)
text_file.close()


# reimport
editor.import_task_xml()

# reexport
editor.export()

task_xml_field_value_2 = editor.get_task_xml()
lon_capa_problem_field_value_2 = editor.get_lon_capa_problem()

if (task_xml_field_value_1 != task_xml_field_value_2):
   print 'Task XML different after import'
if (lon_capa_problem_field_value_1 != lon_capa_problem_field_value_2):
   print 'LON Capa problem file different after import'


text_file = open("task_2.xml", "w")
text_file.write(task_xml_field_value_2)
text_file.close()

text_file = open("problem_2.xml", "w")
text_file.write(lon_capa_problem_field_value_2)
text_file.close()


if editor.compare_without_uuid("task_1.xml", "task_2.xml"):
   print "task_1.xml equals task_2.xml (uiid is not relevant)"
else:
   print "task_1.xml does not match task_2.xml"

driver.close()
print "test finished"

