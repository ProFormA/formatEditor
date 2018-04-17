#!/usr/bin/python
import zipfile
import sys
import lxml.etree as ET
import StringIO
from difflib import unified_diff

zf = zipfile.ZipFile(sys.argv[1])
data1 = zf.read('task.xml')

zf = zipfile.ZipFile(sys.argv[2])
data2 = zf.read('task.xml')

root1 = ET.fromstring(data1)
root2 = ET.fromstring(data2)

output1 = StringIO.StringIO()
root1.getroottree().write_c14n(output1)
array1 = output1.getvalue().split(">")

output2 = StringIO.StringIO()
root2.getroottree().write_c14n(output2)
array2 = output2.getvalue().split(">")

for line in unified_diff(array1, array2 ,n = 0):
     print line
