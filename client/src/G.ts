/// <reference path="./d/ACsv.d.ts" />

import { reactive } from 'vue';
import { ElLoading } from 'element-plus';

const SETTINGS_ITEM_NAME = 'settings';
const JOBS_ITEM_NAME = 'jobs';
const IS_DEBUG: boolean = (import.meta as any).env.DEV;
/**
 * Conf Declaration.
 */
export const Conf: any = {
  "concurrentRequests": 5, // HTTP 1.x: 6, HTTP 2: 100 - Please reserve 1 for other requests
  "api": {
    "create": "/gen-basic/api/create",
    "retrieve": "/gen-basic/api/retrieve"
  }
};
/**
 * Global Declaration.
 */
enum Color
{
  red,
  yellow,
  blue
}

class Global
{
  // consts
  //API_HOST = `//127.0.0.1:3001`; // for test
  API_HOST = '';
  MODELS = ['dall-e', 'stable-diffusion'];
  // variables
  loading = null;
  url: URL = null;
  uid = 0;
  isDebug = IS_DEBUG;
}
export var G = new Global();
/**
 * Global Bind Declaration.
 */
interface GlobalBind
{
  settings: any;
  jobs: Array<any>;

  isTabletView: boolean;
  isPhoneView: boolean;
  isTouchDevice: boolean;
}
export var GB: GlobalBind = reactive({
  settings: {
    runTimes: 0,
  },
  jobs: [],

  isTabletView: false,
  isPhoneView: false,
  isTouchDevice: false,
});

/**
 * Show loading box.
 */
export function ShowLoading(v: boolean, label: string = 'Loading')
{
  if (G.loading)
  {
    G.loading.close();
    G.loading = null;
  }
  if (v)
  {
    G.loading = ElLoading.service({
      lock: true,
      text: label,
      background: 'rgba(0, 0, 0, 0.75)',
    });
  }
};
/**
 * Save settings.
 */
export function SaveSettings()
{
  try
  {
    localStorage.setItem(SETTINGS_ITEM_NAME, JSON.stringify(GB.settings));
  }
  catch (e)
  {
    var estr = e.toString();
    if (estr.indexOf('QuotaExceededError') != -1)
      alert("Warning: Browser local storage is full, no more data can be saved");
    else
      alert(e);
  }
}
/**
 * Load settings.
 */
export function LoadSettings()
{
  var jobj = null;
  try
  {
    jobj = JSON.parse(localStorage.getItem(SETTINGS_ITEM_NAME));
  }
  catch { }
  return reactive(jobj || {});
}
/**
 * Save jobs.
 */
export function SaveJobs()
{
  try
  {
    localStorage.setItem(JOBS_ITEM_NAME, JSON.stringify(GB.jobs));
  }
  catch (e)
  {
    var estr = e.toString();
    if (estr.indexOf('QuotaExceededError') != -1)
      alert("Warning: Browser local storage is full, no more images can be saved");
    else
      alert(e);
  }
}
/**
 * Load jobs.
 */
export function LoadJobs()
{
  var jarr = null;
  try
  {
    jarr = JSON.parse(localStorage.getItem(JOBS_ITEM_NAME));
  }
  catch { }
  return reactive(jarr || []);
}