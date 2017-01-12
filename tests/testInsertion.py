# coding=utf-8

import os


def Test1(elemOutput):
   try:
      assert '<description><![CDATA[input111]]></description>' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: <description><![CDATA[input111]]></description>'

   try:
      assert '<title>input222</title>' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: <title>input222</title>'

   try:
      assert 'max-size="3333"' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: submission-restrictions max-size="3333"'

   try:
      assert 'allowed-upload-filename-mimetypes>text/TEST</' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: allowed-upload-filename-mimetypes>text/TEST</'

   try:
      assert 'lang="en"' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: lang="en"'

   try:
      assert 'proglang version="1.8">java</proglang' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: proglang version="1.8">java</proglang'

   try:
      assert 'filename5555.java' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: filename5555.java'

   try:
      assert 'id="2" type="embedded"' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: id="2"'

   try:
      assert 'input6666' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: input6666'

   try:
      assert '<title>input7777</title>' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: <title>input7777</title>'

   try:
      assert 'Description>input8888</praktomat:config-testDescription>' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: input8888'

   try:
      assert 'title>input9999</title>' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: input9999'

   try:
      assert '<praktomat:public>False</praktomat:public>' in elemOutput.get_attribute('value')
   except AssertionError:
      print '<praktomat:public>False<'
   print 'Test1 finished'

def Test1a(elemOutput):
   try:
       assert '/res/fhwf/input4444/input222.zip' in elemOutput.get_attribute('value')
   except AssertionError:
       print 'Not found: /res/fhwf/input4444/input222.zip'
   print 'Test1a finished'
       

def Test2():
   try:
      assert '<title>Field erased</title>' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: Field erased'
   print 'Test2 finished'
      

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.support.ui import Select


import editor

# open browser
#driver = editor.openFirefox()
driver = editor.openChrome()
editor.init(driver)
# with editor page
editor.openEditorPage()



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
editor.set_prog_language("java/1.8")

####################################################################
# fill FILES
####################################################################

# add 5 new files
editor.add_file()
editor.add_file()
editor.add_file()
editor.add_file()
editor.add_file()

# fill filename
editor.set_filename(0, "filename5555.java")
editor.set_filename(1, "filename6666.java")
editor.set_filename(2, "filename7.java")
editor.set_filename(3, "filename8.java")
editor.set_filename(4, "filename9.java")

# fill file comment
editor.set_file_comment(0, "comment for file filename5555.java")
editor.set_file_comment(1, "comment for file filename6666.java")

# set file class
editor.set_file_class(0, 0)
editor.set_file_class(1, 1)
editor.set_file_class(2, 2)
editor.set_file_class(3, 3)
editor.set_file_class(4, 4)

# fill file text
# does not work, raises exception (element not visible)
# elem = driver.find_elements_by_class_name('xml_file_text')
# elem[0].send_keys("//dummy file text")
#editor.set_file_text(0, "// dummy file text")
#editor.set_file_text(1, "// dummy file text #2")
###editor.set_file_text(1, "// deutsche Umlaute öäüß")
###editor.set_file_text(2, "int i = 0;\\nint j = 1;")


# remove first file
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

####################################################################
# add Java compiler test
####################################################################
editor.add_java_compiler_test()
# fill title
editor.set_test_title(0, "input7777")
editor.set_jct_public(0, "False")


####################################################################
# add Java JUnit test
####################################################################
editor.add_junit_test()
editor.set_junit_description(0,"input8888" )
editor.set_test_title(1, "JUnit Test #0")

editor.set_junit_test_class(0, "inputAAAA")

# Achtung! Index!
# Alle Tests haben ein Fileref-Feld. Der Index muss entsprechend angepasst werden.
# Compiler test hat auch ein solches Feld, was
# aber nicht sichtbar ist. Es zählt aber mit!!
editor.add_file_to_junit(1, 1)


####################################################################
# add CHECKSTYLE test
####################################################################
editor.add_checkstyle()
editor.set_test_title(2, "input9999")
# Achtung! Index!
# Alle Tests haben ein Fileref-Feld. Der Index muss entsprechend angepasst werden.
# Compiler test hat auch ein solches Feld, was
# aber nicht sichtbar ist. Es zählt aber mit!!
editor.add_file_to_checkstyle(2, 1)

####################################################################

elem = driver.find_element_by_id("buttonExport").click()

outputarea1 = driver.find_element_by_id("output")
outputvalue1 = outputarea1.get_attribute('value')
outputarea2 = driver.find_element_by_id("output2")
outputvalue2 = outputarea2.get_attribute('value')

Test1(outputarea1)
Test1a(outputarea2)

elem = driver.find_element_by_id("buttonImport").click()
alert = driver.switch_to.alert
alert.accept()

elem = driver.find_element_by_id("buttonExport").click()

outputarea1new = driver.find_element_by_id("output")
outputvalue1new = outputarea1new.get_attribute('value')
outputarea2new = driver.find_element_by_id("output2")
outputvalue2new = outputarea2new.get_attribute('value')

if (outputvalue1 != outputvalue1new):
   print '1 Different after import'
if (outputvalue2 != outputvalue2new):
   print '2 Different after import'

driver.close()
print "test finished"

