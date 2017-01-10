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
driver = editor.openBrowser()
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
# fill FILE page
####################################################################

# add new file
elem = driver.find_element_by_id("addFile").click()
# add new file
elem = driver.find_element_by_id("addFile").click()

# remove first file
elem = driver.find_element_by_class_name('xml_file')
elem.find_element_by_tag_name('button').click()
alert = driver.switch_to.alert
alert.accept()

# fill filename
elem = driver.find_elements_by_class_name('xml_file_filename')
elem[0].send_keys("filename5555.java")
# fill file comment
elem = driver.find_elements_by_class_name('xml_file_comment')
elem[0].send_keys("input6666")
# fill file text
# does not work, raises exception (element not visible)
# elem = driver.find_elements_by_class_name('xml_file_text')
# elem[0].send_keys("//dummy file text")



# add model solution
elem = driver.find_element_by_id("addModelsol").click()

# does not work:
elem = driver.find_elements_by_class_name("xml_model-solution_filename")

# geht alles nicht!!!
##select = Select(driver.find_elements_by_class_name('xml_model-solution_filename'))
## select by visible text
##select.select_by_visible_text('Banana')
## select by value
##select.select_by_value('1')



elem[0].send_keys(Keys.NULL)                    # so that the filename options get created


editor.showModalWindow()

select = Select(elem[0])
select.select_by_index(1)

# add Java compiler test
elem = driver.find_element_by_id("addJavaComp").click()
elem = driver.find_elements_by_class_name('xml_test_title')
# fill title
elem[0].clear()
elem[0].send_keys("input7777")

# add Java JUnit test
elem = driver.find_element_by_id("addJavaJunit").click()
# fill description
elem = driver.find_elements_by_class_name('xml_pr_configDescription')
elem[0].send_keys("input8888")

# fill test file name
elem = driver.find_elements_by_class_name("xml_test_filename")
elem[1].send_keys(Keys.NULL)                    # so that the filename options get created

editor.showModalWindow()

select = Select(elem[1])
select.select_by_index(1)

elem = driver.find_element_by_id("addCheckStyle").click()
elem = driver.find_elements_by_class_name('xml_test_title')
elem[2].clear()
elem[2].send_keys("input9999")

elem = driver.find_elements_by_class_name("xml_test_filename")
elem[2].send_keys(Keys.NULL)                    # so that the filename options get created

editor.showModalWindow()

select = Select(elem[2])
select.select_by_index(1)

elem = driver.find_elements_by_class_name('xml_ju_mainclass')
elem[0].send_keys("inputAAAA")

select = Select(driver.find_element_by_class_name("xml_pr_public"))
select.select_by_visible_text("False")

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

