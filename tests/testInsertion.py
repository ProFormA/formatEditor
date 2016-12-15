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
      assert 'input5555' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: input5555'

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

d = DesiredCapabilities.FIREFOX
driver = webdriver.Firefox(capabilities=d)
#binary = FirefoxBinary(firefox_path='/usr/bin/firefox')
#driver = webdriver.Firefox(firefox_binary=binary,capabilities=d)

the_path = os.path.dirname(os.path.abspath(__file__))
#print the_path
editor_path = the_path + "/../proformaEditor101.html"
#print editor_path

#driver.get("proformaEditor.html")
driver.get("file:///" + editor_path)


elem = driver.find_element_by_id("xml_description")
elem.send_keys("input111")

elem = driver.find_element_by_id("xml_meta-data_title")
elem.send_keys("input222")

elem = driver.find_element_by_id("xml_subm_max-size")
elem.clear()
elem.send_keys("3333")

elem = driver.find_element_by_id("xml_upload-mime-type")
elem.clear()
elem.send_keys("text/TEST")

elem = driver.find_element_by_id("lczip")
elem.clear()
elem.send_keys("input4444/")

select = Select(driver.find_element_by_id("xml_lang"))
select.select_by_value("en")

select = Select(driver.find_element_by_id("xml_programming-language"))
select.select_by_value("java/1.8")

elem = driver.find_element_by_id("addFile").click()
elem = driver.find_element_by_id("addFile").click()

elem = driver.find_element_by_class_name('xml_file')
elem.find_element_by_tag_name('button').click()
alert = driver.switch_to.alert
alert.accept()

elem = driver.find_elements_by_class_name('xml_file_filename')
elem[0].send_keys("input5555")
elem = driver.find_elements_by_class_name('xml_file_comment')
elem[0].send_keys("input6666")

elem = driver.find_element_by_id("addModelsol").click()
elem = driver.find_elements_by_class_name("xml_model-solution_filename")
elem[0].send_keys(Keys.NULL)                    # so that the filename options get created

try:
   driver.execute_script('window.alert("Hi")')
except:
   pass
alert = driver.switch_to.alert
alert.accept()

select = Select(elem[0])
select.select_by_index(1)

elem = driver.find_element_by_id("addJavaComp").click()
elem = driver.find_elements_by_class_name('xml_test_title')
elem[0].clear()
elem[0].send_keys("input7777")

elem = driver.find_element_by_id("addJavaJunit").click()
elem = driver.find_elements_by_class_name('xml_pr_configDescription')
elem[0].send_keys("input8888")

elem = driver.find_elements_by_class_name("xml_test_filename")
elem[1].send_keys(Keys.NULL)                    # so that the filename options get created

try:
   driver.execute_script('window.alert("Hi")')
except:
   pass
alert = driver.switch_to.alert
alert.accept()

select = Select(elem[1])
select.select_by_index(1)

elem = driver.find_element_by_id("addCheckStyle").click()
elem = driver.find_elements_by_class_name('xml_test_title')
elem[2].clear()
elem[2].send_keys("input9999")

elem = driver.find_elements_by_class_name("xml_test_filename")
elem[2].send_keys(Keys.NULL)                    # so that the filename options get created

try:
   driver.execute_script('window.alert("Hi")')
except:
   pass
   
alert = driver.switch_to.alert
alert.accept()
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

