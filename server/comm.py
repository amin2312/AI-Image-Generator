import os
import re
import sys
import json
import httpx
import base64
import logging
from io import BytesIO
from PIL import Image


def InitLog(fileName):
  logging.basicConfig(filename=fileName, level=logging.WARNING, format='[%(levelname)s] %(asctime)s %(message)s')
  return logging.getLogger()


class DictClass(dict):
  __getattr__ = dict.__getitem__


def ConvertDictToObj(d):
  if not isinstance(d, dict):
    return d
  dc = DictClass()
  for k, v in d.items():
    dc[k] = ConvertDictToObj(v)
  return dc


def LoadConf(fileName):
  ins = None
  if os.path.exists(fileName):
    with open(fileName, 'r', encoding='utf-8') as file:
      text = file.read()
      text = re.sub(r'\s+//.*?$', '', text, flags=re.MULTILINE)
      d = json.loads(text or '{}')
      ins = ConvertDictToObj(d)
  print('LoadConf', fileName, d)
  return ins


def SaveConf(fileName, content):
  print('SaveConf', content)
  with open(fileName, 'w', encoding='utf-8') as file:
    jstr = json.dumps(content, indent=None)
    file.write(jstr)


def LoadJson(fileName, default="{}"):
  jobj = json.loads(default)
  if os.path.exists(fileName):
    with open(fileName, 'r', encoding='utf-8') as file:
      text = file.read()
      text = re.sub(r'\s+//.*?$', '', text, flags=re.MULTILINE)
      jobj = json.loads(text or default)
  print('LoadJson', fileName)
  return jobj


def SaveJson(fileName, jobj):
  with open(fileName, 'w', encoding='utf-8') as file:
    jstr = json.dumps(jobj, indent=None)
    file.write(jstr)
  print('SaveJson', fileName)


async def DumpImageByUrl(url: str, savePath: str, saveType: str, saveQuality: str):
  async with httpx.AsyncClient(verify=False, timeout=None) as client:
    try:
      response = await client.get(url)
    except Exception as e:
      return False, "DumpImageByUrl fail-1: %s - %s" % (url, str(e))

  status_code = response.status_code
  content = response.content
  if status_code != 200:
    return False, ("DumpImageByUrl fail-1: %d - %s" % (status_code, url))

  try:
    bin = BytesIO(content)
    img = Image.open(bin)
    img.save(savePath, format=saveType, quality=saveQuality)
    img.close()
    bin.close()
  except Exception as e:
    return False, "DumpImageByUrl fail-3: %s - %s" % (url, str(e))
  return True, None


def DumpImageByBase64(b64: str, savePath: str, saveType: str, saveQuality: str):
  try:
    data = base64.b64decode(b64)
    bin = BytesIO(data)
    img = Image.open(bin)
    img.save(savePath, format=saveType, quality=saveQuality)
    img.close()
    bin.close()
  except Exception as e:
    return False, "DumpImageByBase64 fail-1: %s" % (str(e))
  return True, None


class MyPrint:
  def __init__(self, filename):
    self.stdout = sys.stdout
    self.file = open(filename, "w")

  def write(self, message):
    self.stdout.write(message)
    self.file.write(message)

  def flush(self):  # The flush method is required to be compatible with sys.stdout
    self.stdout.flush()
    self.file.flush()
