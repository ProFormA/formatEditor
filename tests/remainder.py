# contains unused stuff from original test script.

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




def Test2(elemOutput):
   try:
      assert '<title>Field erased</title>' in elemOutput.get_attribute('value')
   except AssertionError:
      print 'Not found: Field erased'
   print 'Test2 finished'
