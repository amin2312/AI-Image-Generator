# encoding=utf-8
import os
import sys
import json
import time
import uuid
import httpx
import asyncio
import traceback
import tornado.web
import tornado.ioloop
from apscheduler.schedulers.tornado import TornadoScheduler

from openai import AsyncOpenAI
from openai import AsyncAzureOpenAI

from comm import *

MSG_DELIM = '---1@3$5^7*9)---'

NumConcurrencies = 0


async def dumpToUrl(UUID, type, data) -> (bool | str):
  if not Conf.dump.on:
    return False
  saveName = '%s.%s' % (UUID, Conf.dump.save_type)
  savePath = Conf.dump.save_path + saveName
  if type == 'url':
    ok, err = await DumpImageByUrl(data, savePath, Conf.dump.save_type, Conf.dump.save_quality)
    if not ok:
      Logger.error(err)
      return False
  elif type == 'base64':
    ok, err = DumpImageByBase64(data, savePath, Conf.dump.save_type, Conf.dump.save_quality)
    if not ok:
      Logger.error(err)
      return False
  return Conf.dump.public_url.replace('{host}', CurHost).replace('{save_path}', savePath).replace('{save_name}', saveName)


class onRetrieve(tornado.web.RequestHandler):
  def post(self):
    global Jobs

    self.set_header('Content-Control', "no-cache")
    self.set_header('Access-Control-Allow-Origin', "*")

    try:
      content = self.request.body
      ids = json.loads(content)
      resp = {"err": None, "items": []}
      for uuid in ids:
        resp["items"].append(
            Jobs.get(uuid, {"uuid": uuid, "state": 404}))
      self.write(json.dumps(resp))
    except Exception as e:
      resp = {
          "err": {
              "name":  type(e).__name__,
              "desc": str(e),
          }
      }
      self.write(json.dumps(resp))


class onCreate(tornado.web.RequestHandler):
  async def post(self):
    global Jobs, CurHost, NumConcurrencies
    CurHost = '%s://%s' % (self.request.protocol, self.request.host)
    isFreeTrial = False

    self.set_header('Content-Control', "no-cache")
    self.set_header('Access-Control-Allow-Origin', "*")

    # 3.Start work
    try:
      # 1.Create job
      NumConcurrencies += 1
      UUID: str = 'job-' + str(uuid.uuid4())
      job = {
          "uuid": UUID,
          "state": 0,
      }

      # 2.If overflow, then remove first element
      if len(Jobs) >= Conf.jobs.maxItems:
        Jobs.pop(next(iter(Jobs)))
      Jobs[UUID] = job  # add to jobs

      content: bytes = self.request.body
      I = json.loads(content)

      # 1.Get and check parameters
      p_model: str = I["model"]
      p_version: float = I["version"]
      p_prompt: str = I["prompt"]
      p_negativePrompt: str = I.get("negativePrompt", None)
      p_param: dict = I["param"]
      p_supplier: str = I["supplier"]
      p_api_key: str = I["api_key"]

      isFreeApiKey = not p_api_key
      if isFreeApiKey:
        # Check whether the max free concurrencies is exceeded
        if NumConcurrencies > Conf.jobs.maxFreeConcurrencies:
          raise Exception('exceed_max_concurrencies')

      if p_model == 'dall-e':
        p_param_size: any = p_param['size']  # type: ignore
        p_param_quality: any = p_param['quality']  # type: ignore
        p_param_style: any = p_param['style']  # type: ignore
        if p_supplier == 'azure':
          p_api_version: str = I['api_version']
          p_endpoint: str = I['endpoint']

      elif p_model == 'stable-diffusion':
        p_text_prompts = [{"text": p_prompt, "weight": 1}]
        if p_negativePrompt:
          p_text_prompts.append(
              {"text": p_negativePrompt, "weight": -1})
        p_param_width: int = p_param['width']
        p_param_height: int = p_param['height']
        p_param_cfg_scale: float = p_param['cfg_scale']
        p_param_clip_guidance_preset: str = p_param['clip_guidance_preset']
        p_param_sampler: str | None = p_param['sampler'] if p_param['sampler'] != 'default' else None
        p_param_samples: int = p_param['samples']
        p_param_seed: int = p_param['seed']
        p_param_steps: int = p_param['steps']
        p_param_style_preset: str | None = p_param['style_preset'] if p_param['style_preset'] != 'default' else None

      # 2.Send the job to client for storage first
      job["I"] = I
      self.write(json.dumps(job) + MSG_DELIM)
      self.flush()
      # raise Exception('empty_content')
      # await asyncio.sleep(3000000)  # for test

      # 3.Send the API request to supplier
      if p_model == 'dall-e':
        httpPorxy = httpx.AsyncClient(proxies=Conf.api_proxy) if Conf.api_proxy else None  # support proxy
        _TIME_A_ = time.time()
        if Conf.test:
          O = {'created': 1713337972, 'data': [{'b64_json': None, 'revised_prompt': 'A detailed image depicting an everyday life scene on a sunny afternoon in the United States. The scene includes an individual of Caucasian descent, male, in casual summer wear, walking his Golden Retriever on a suburban sidewalk lined with trees. Also included in the scene is a Hispanic female, a professional painter, working on a cityscape painting on a nearby easel. Both individuals are composed, relaxed, and are enjoying the beautiful day in their own ways. The setting sunlight casts long, dappled shadows on the scene, giving it a serene and tranquil ambiance.', 'url': 'test.jpg'}]}
        else:
          if p_supplier == 'azure':
            client = AsyncAzureOpenAI(api_key=p_api_key or Conf.supplier.azure.api_key, http_client=httpPorxy, api_version=p_api_version or Conf.supplier.azure.api_version, azure_endpoint=p_endpoint or Conf.supplier.azure.endpoint)
          else:
            client = AsyncOpenAI(api_key=p_api_key or Conf.supplier.openai.api_key, http_client=httpPorxy)
          resp = await client.images.generate(model=p_model+'-'+str(p_version), prompt=p_prompt, size=p_param_size, quality=p_param_quality, style=p_param_style, n=1)
          O = resp.model_dump()
        _TIME_B_ = time.time()

        # dump to url
        sampleType = 'url'
        sampleData = O['data'][0]['url']
        okOrUrl = await dumpToUrl(UUID, sampleType, sampleData)
        if okOrUrl:
          sampleType = 'url'
          sampleData = okOrUrl

        # update job
        job['state'] = 1  # update state
        job['O'] = O
        job['image'] = {
            "created": O['created'],
            "elapsed": int(_TIME_B_ - _TIME_A_),
            "samples": [
                {"type": sampleType, "data": sampleData}
            ],
        }
      elif p_model == 'stable-diffusion':
        client = httpx.AsyncClient(proxies=Conf.api_proxy)
        api_host = 'https://api.stability.ai'
        engine_id = p_model + '-v' + str(p_version).replace('.', '-')
        api_key = p_api_key or Conf.supplier.stability.api_key
        async with client:
          _TIME_A_ = time.time()
          if Conf.test:
            O = {"artifacts": [{"base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "finishReason": "SUCCESS", "seed": 1050625087}]}
          else:
            resp = await client.post(f"{api_host}/v1/generation/{engine_id}/text-to-image",
                                     headers={"Content-Type": "application/json", "Accept": "application/json", "Authorization": f"Bearer {api_key}"},
                                     json={"text_prompts": p_text_prompts, "width": p_param_width, "height": p_param_height, "cfg_scale": p_param_cfg_scale, "clip_guidance_preset": p_param_clip_guidance_preset, "sampler": p_param_sampler, "samples": p_param_samples, "seed": p_param_seed, "steps": p_param_steps, "style_preset": p_param_style_preset, },
                                     timeout=Conf.maxRequestSeconds)
            if resp.status_code != 200:
              raise Exception(resp.text)
            O = resp.json()
            if len(O['artifacts']) == 0:  # Sometime return empty content
              raise Exception('empty_content')
          _TIME_B_ = time.time()

          # dump to url
          sampleType = 'base64'
          sampleData = O['artifacts'][0]['base64']
          okOrUrl = await dumpToUrl(UUID, sampleType, sampleData)
          if okOrUrl:
            sampleType = 'url'
            sampleData = okOrUrl
            O['artifacts'][0]['base64'] = '...'

          # update job
          job['state'] = 1  # update state
          job['O'] = O
          job['image'] = {
              "created": int(_TIME_B_),
              "elapsed": int(_TIME_B_ - _TIME_A_),
              "samples": [
                  {"type": sampleType, "data": sampleData}
              ],
          }
      else:
        raise Exception('Invalid model request')
      self.write(json.dumps(job) + MSG_DELIM)
      self.finish()
    except Exception as e:
      job['state'] = -1  # update state
      job["err"] = {
          "name": type(e).__name__,
          "desc": str(e),
      }
      self.write(json.dumps(job) + MSG_DELIM)
      self.finish()
      Logger.error(traceback.format_exc())
    finally:
      NumConcurrencies -= 1


class onIndex(tornado.web.RequestHandler):
  def get(self):
    self.redirect("/gen-basic/")


def buildApp():
  return tornado.web.Application(
      [
          (r"/gen-basic/api/create", onCreate),
          (r"/gen-basic/api/retrieve", onRetrieve),
          (r"/gen-basic/downloads/(.*)", tornado.web.StaticFileHandler, {"path": Conf.dump.save_path}),
          (r"/gen-basic/(.*)", tornado.web.StaticFileHandler, {"path": "../wwwroot/", "default_filename": "index.html"}),
          (r"/", onIndex),
      ],
      debug=Conf.debug
  )


def onDaily():
  pass


if __name__ == "__main__":
  # change directory to current path
  CurDir = os.path.dirname(os.path.realpath(__file__))
  os.chdir(CurDir)
  print("Current Directory", CurDir)
  # set conf file
  confFileName = sys.argv[1] if len(sys.argv) > 1 else 'conf.json'

  Conf: any = LoadConf(confFileName)  # type: ignore
  Jobs: any = LoadJson(Conf.jobs.save_path)  # type: ignore
  Logger = InitLog(Conf.errLog)
  sys.stdout = MyPrint(Conf.outLog)

  try:
    myApp = buildApp()
    myApp.listen(Conf.port)

    print("Server port: %d" % Conf.port)
    print("Server is running..")

    # add a scheduler
    scheduler = TornadoScheduler()
    scheduler.add_job(onDaily, 'interval', seconds=2)
    scheduler.start()

    tornado.ioloop.IOLoop.current().start()
  except Exception as e:
    print(e)
  finally:
    SaveJson(Conf.jobs.save_path, Jobs)
