import Lang from './Lang';
import { G, GB } from './G';
/**
 * Kit.
 */
export default class Kit
{
  static lastError = null;
  static checkP3(httpStatusCode, httpReponse) 
  {
    if (httpStatusCode != 200)
    {
      Kit.lastError = httpStatusCode + ',' + httpReponse;
      return new Error(`[ERROR] HTTP:${ Kit.lastError }`);
    }
    var content = httpReponse;
    var index1 = content.indexOf(',');
    if (index1 == -1)
    {
      Kit.lastError = content;
      return new Error(`[ERROR] CONTENT:${ Kit.lastError }`);
    }
    var part1 = null;
    var part2 = null;
    var part3 = null;
    part1 = content.substring(0, index1);
    var index2 = content.indexOf(',', index1 + 1);
    if (index2 > 0)
    {
      part2 = content.substring(index1 + 1, index2);
      part3 = content.substring(index2 + 1);
      part1 = parseInt(part1);
      part2 = parseInt(part2);
      switch (part2)
      {
        case 10:
          part3 = parseInt(part3);
          break;
        case 11:
          part3 = parseInt(part3) ? true : false;
          break;
        case 20:
          part3 = parseFloat(part3);
          break;
        case 32:
          part3 = JSON.parse(part3);
          break;
      }
    }
    return { part1, part2, part3 };
  }
  /**
   * Get the items by condition.
   */
  static getStateItems(src: Array<any>, state, n = -1, key: any = null): Array<any>
  {
    var items: Array<any> = [];
    for (let item of src)
      if (item.state == state)
      {
        items.push(key ? item[key] : item);
        n--;
        if (n == 0)
        {
          break;
        }
      }
    return items;
  }
  /**
   * Format input info.
   */
  static formatInputInfo(I: any): string
  {
    var info = '';
    if (I.model == G.MODELS[0])
    {
      info = `${ Lang.n.prompt }: ${ I.prompt }
${ Lang.n.model }: ${ I.model }
${ Lang.n.version }: ${ I.version }
${ Lang.n.size }: ${ I.param.size }
${ Lang.n.quality }: ${ I.param.quality } 
${ Lang.n.style }: ${ I.param.style }
${ Lang.n.supplier }: ${ I.supplier }
`;
    }
    else if (I.model == G.MODELS[1])
    {
      info = `${ Lang.n.prompt }: ${ I.prompt }
${ Lang.n.negativePrompt }: ${ I.negativePrompt }
${ Lang.n.model }: ${ I.model }
${ Lang.n.version }: ${ I.version }
${ Lang.n.width }: ${ I.param.width }
${ Lang.n.height }: ${ I.param.height } 
CFG Scale: ${ I.param.cfg_scale }
${ Lang.n.steps }: ${ I.param.steps }
CLIP Guidance: ${ I.param.clip_guidance_preset }
${ Lang.n.sampler }: ${ I.param.sampler }
${ Lang.n.style }: ${ I.param.style_preset }
${ Lang.n.seed }: ${ I.param.seed }
${ Lang.n.supplier }: ${ I.supplier }
`;
    }
    return info;
  }
  /**
   * Fill the blank values of A with B.
   */
  static fillInto(b: any, a: any, cover = false, plus = false): void
  {
    if (b == null || a == null)
    {
      return;
    }
    for (let key in b)
    {
      let val = a[key];
      if (cover || val == null)
      {
        a[key] = b[key];
      }
      else if (plus)
      {
        a[key] += b[key];
      }
    }
  }
  /**
   * Generate a uid.
   */
  static genUID(randomLength = 8, prefix: string = '')
  {
    return prefix + Kit.padStart(Math.random().toString(36).substring(2, 2 + randomLength), '0', randomLength) + '-' + Date.now().toString(36);
  }
  /**
   * Padding start.
   */
  static padStart(s: string, chr: string, n: number)
  {
    const c = n - s.length;
    if (c > 0)
    {
      s = Array(c).fill(chr).join('') + s;
    }
    return s;
  }
  /**
   * Copy text to clipboard.
   */
  static copyTextToClipboard(input, { target = document.body } = {})
  {
    const element = document.createElement('textarea');
    const previouslyFocusedElement = document.activeElement;
    element.value = input;
    // Prevent keyboard from showing on mobile
    element.setAttribute('readonly', '');
    element.style.contain = 'strict';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.fontSize = '12pt'; // Prevent zooming on iOS
    const selection: any = document.getSelection();
    const originalRange = selection.rangeCount > 0 && selection.getRangeAt(0);
    target.append(element);
    element.select();
    // Explicit selection workaround for iOS
    element.selectionStart = 0;
    element.selectionEnd = input.length;
    let isSuccess = false;
    try
    {
      isSuccess = document.execCommand('copy');
    }
    catch { }
    element.remove();
    if (originalRange)
    {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }
    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement)
    {
      (previouslyFocusedElement as HTMLElement).focus();
    }
    return isSuccess;
  }
}