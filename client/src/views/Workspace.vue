<template>
  <div id="my-workspace">
    <div class='L'>
      <div class='L-head'>
      </div>
      <div class='L-body'>
        <LPart ref="lp" />
      </div>
    </div>
    <div class='R' ref="R" v-show="!GB.isPhoneView || isAdvanceView">
      <div class='R-head'>
        <div class="R-first-line">
          <el-button v-show="GB.isPhoneView" type="danger" plain @click="isAdvanceView = false" v-if="GB.isPhoneView">{{ Lang.n.home }}</el-button>
          <el-radio-group v-model="model">
            <el-radio-button :label="G.MODELS[0]">DALL·E</el-radio-button>
            <el-radio-button :label="G.MODELS[1]">SD</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class='R-body'>
        <RPartDallE :ref="G.MODELS[0]" v-show="model == G.MODELS[0]" :isDisabledSubmit="isDisabledSubmit" />
        <RPartSD :ref="G.MODELS[1]" v-show="model == G.MODELS[1]" :isDisabledSubmit="isDisabledSubmit" />
      </div>
      <div class='R-foot'>
        <div class='fieldset' v-if="hasWorking">
          <div class='legend'>{{ Lang.id(103) }}</div>
          <div class='working-item' v-for="item in Kit.getStateItems(GB.jobs, 0)" :key="item.uuid">
            <img src="/loading.svg" />
            <el-popover :placement="GB.isPhoneView ? 'top-start' : 'right-start'" :title="Lang.n.inputInfo" :width="348" popper-class="gallery-info-popover" trigger="click">
              <template #reference>
                <span>{{ Lang.n.job }}：{{ item.uuid }}</span>
              </template>
              <div style="overflow-x:hidden">
                <pre style="margin:0px 0px 8px 0px">{{ Kit.formatInputInfo(item.I) }}</pre>
                <el-button type="primary" plain @click="onDelJob(item, 0)" :title="Lang.id(149)">
                  <icon-delete size="16" />
                </el-button>
                <el-button type="primary" plain @click="onRefreshJob(item)" :title="Lang.id(150)">
                  <icon-refresh size="16" />
                </el-button>
              </div>
            </el-popover>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { G, GB, Conf, SaveJobs, ShowLoading } from "../G";
import { reactive } from 'vue';
import Kit from '../Kit';
import Lang from '../Lang';
import LPart from './LPart.vue';
import RPartDallE from './RPartDallE.vue';
import RPartSD from './RPartSD.vue';

const MSG_DELIM = '---1@3$5^7*9)---';

export default {
  name: "Workspace",
  components:
  {
    LPart,
    RPartDallE,
    RPartSD,
  },
  data()
  {
    return {
      model: G.MODELS[0],
      isDisabledSubmit: false,
      isAdvanceView: false,
    };
  },
  mounted()
  {
    // show last completed job
    var completedJobs = Kit.getStateItems(GB.jobs, 1);
    var n = completedJobs.length;
    if (n)
    {
      this.$refs.lp.setCurJob(completedJobs[n - 1]);
    }
    // retrieve the status of all uncompleted jobs
    var ids = Kit.getStateItems(GB.jobs, 0, -1, 'uuid');
    if (ids.length > 0)
    {
      this.refreshJobs(ids);
    }
    // init url params
    var p_model = G.url.searchParams.get('model') || null;
    var p_prompt = G.url.searchParams.get('p') || null;
    var p_negativePrompt = G.url.searchParams.get('np') || null;
    var p_do = G.url.searchParams.get('do') || null;
    if (p_model && G.MODELS.indexOf(p_model) != -1)
    {
      this.model = p_model;
      this.$refs[p_model].input.prompt = p_prompt;
      if (p_negativePrompt && this.$refs[p_model].input.negativePrompt !== undefined)
      {
        this.$refs[p_model].input.negativePrompt = p_negativePrompt;
      }
    }
    if (p_do == 'submit')
    {
      this.$refs[this.model].submit();
    }
  },
  computed:
  {
    hasWorking()
    {
      return Kit.getStateItems(GB.jobs, 0, 1).length;
    }
  },
  methods:
  {
    fillInputBy(src)
    {
      var ref = this.$refs[src.model];
      if (ref.input.template == src.template) // Check if templates are equal
      {
        ref.input = JSON.parse(JSON.stringify(src));
        this.model = src.model;
        ElMessage.success(Lang.id(125));
      }
      else
      {
        ElMessage.error(Lang.id(154));
      }
    },
    onRefreshJob(item)
    {
      ElMessage.info(Lang.id(152));
      this.refreshJobs([item.uuid], () => ElMessage.success(Lang.id(125)));
    },
    refreshJobs(ids, onComplete: ((() => null) | null) = null)
    {
      var url = `${ G.API_HOST }${ Conf.api.retrieve }?uid=${ G.uid }`;
      fetch(url, { method: "POST", body: JSON.stringify(ids) })
        .then(response => response.json())
        .then(data =>
        {
          if (data.err)
          {
            console.log(data);
            ElMessage.error('【' + data.err.name + '】' + data.err.desc);
            return;
          }
          // 1.Update jobs
          data.items.forEach(newJob =>
          {
            for (let i = 0, n = GB.jobs.length; i < n; i++)
            {
              if (GB.jobs[i].uuid == newJob.uuid)
              {
                if (newJob.state == -1 || newJob.state == 404)
                {
                  GB.jobs.splice(i, 1);
                }
                else
                {
                  // GB.jobs[i] = newJob; // it will be a bug in vue when removed in the latter code
                  GB.jobs.splice(i, 1, newJob);
                }
                break;
              }
            }
          });
          // 2.Save jobs
          SaveJobs();
          if (onComplete)
          {
            onComplete();
          }
        })
        .catch(e =>
        {
          console.log(e);
          ElMessage.error(e.toString());
        });
    },
    onDelJob(item, state)
    {
      ElMessageBox.confirm(Lang.id(151), null)
        .then(() =>
        {
          if (item.state == state)
          {
            ElMessage.success(Lang.id(125));
            // 1.Delete job
            let index = GB.jobs.indexOf(item);
            GB.jobs.splice(index, 1);
            // 2.Save jobs
            SaveJobs();
          }
        })
        .catch(() => { });
    },
    /**
     * Submit request.
     */
    submitRequest(post)
    {
      // 1.Check the conditions
      if (this.isDisabledSubmit)
      {
        ElMessage.warning(Lang.id(104));
        return false;
      }
      if (Kit.getStateItems(GB.jobs, 0).length >= Conf.concurrentRequests)
      {
        ElMessageBox.alert(Lang.id(148).replace('\n', '<br/>'), null, { type: 'warning', showClose: false, dangerouslyUseHTMLString: true });
        return false;
      }
      // 1.Update state
      var p_prompt = post.prompt;
      this.isDisabledSubmit = true;
      // 2.Send request
      var msgIndex = 0;
      var url = `${ G.API_HOST }${ Conf.api.create }?uid=${ G.uid }`;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.send(JSON.stringify(post));
      xhr.onreadystatechange = () =>
      {
        if (xhr.readyState === XMLHttpRequest.DONE)
        {
          if (xhr.status === 200)
          {
            // No need to deal with it, because in it's already handled in xhr.onprogress
          }
        }
      };
      xhr.onprogress = () =>
      {
        while (true)
        {
          var index = xhr.responseText.indexOf(MSG_DELIM, msgIndex);
          if (index == -1)
          {
            return;
          }
          this.isDisabledSubmit = false;
          // 1.Get job
          let job = JSON.parse(xhr.responseText.substring(msgIndex, index));
          msgIndex = index + MSG_DELIM.length;
          // 2.Update job
          var ok = false;
          for (let i = 0, n = GB.jobs.length; i < n; i++)
          {
            ok = (GB.jobs[i].uuid == job.uuid);
            if (ok)
            {
              // GB.jobs[i] = job; // it will be a bug in vue when removed in the latter code
              GB.jobs.splice(i, 1, job);
              break;
            }
          }
          if (!ok)
          {
            GB.jobs.push(job);
          }
          // 3.Copy error
          if (job.err)
          {
            let desc = job.err.desc;
            if (desc.indexOf('content_policy_violation') != -1) // DALL-E
            {
              ElMessageBox.alert(`${ Lang.n.job }：${ job.uuid }<br />${ Lang.id(153) }`, null, { type: 'error', showClose: false, dangerouslyUseHTMLString: true });
            }
            else if (desc.indexOf('empty_content') != -1) // SD
            {
              ElMessageBox.alert(`${ Lang.n.job }：${ job.uuid }<br />${ Lang.id(155) }`, null, { type: 'error', showClose: false, dangerouslyUseHTMLString: true });
            }
            else if (desc.indexOf('exceed_max_concurrencies') != -1)
            {
              ElMessageBox.confirm(`${ Lang.id(158) }`, null, { type: 'info', cancelButtonText: Lang.id(160), confirmButtonText: Lang.id(161), showClose: false, dangerouslyUseHTMLString: true })
                .then(() =>
                {
                  ShowLoading(true);
                  const form = { lang: Lang.customValue, prompt: p_prompt, format: "", offset: 0, limit: 100 };
                  fetch("https://www.ai-img-gen.com/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
                    .then(resp => resp.text())
                    .then(data =>
                    {
                      ShowLoading(false);
                      let pack = Kit.checkP3(200, data);
                      if (pack instanceof Error)
                      {
                        alert(pack.toString());
                        return;
                      }
                      if (pack.part1 < 0)
                      {
                        alert(pack.part1 + '\n' + pack.part3);
                        return;
                      }
                      const url = `https://www.ai-img-gen.com/lang/${ Lang.customValue }/prompt/${ encodeURIComponent(p_prompt) }/result/${ pack.part3.data }`;
                      window.open(url);
                    }).catch(error =>
                    {
                      alert("HTTP CODE: " + error);
                    });
                })
                .catch(() => { });
            }
            else
            {
              ElMessage.error('【' + job.err.name + '】' + desc);
            }
          }
          // 4.Cope job
          if (job.state == 0) // 0 = new job
          {
            if (GB.settings.runTimes > 3)
            {
              ElMessage.success({ message: `${ Lang.id(157) }<br />${ Lang.n.job }：${ job.uuid }`.replace('\n', '<br />'), dangerouslyUseHTMLString: true });
            }
            else
            {
              ElMessageBox.alert(`${ Lang.id(157) }<br />${ Lang.n.job }：${ job.uuid }`.replace('\n', '<br />'), null, { type: 'success', showClose: false, dangerouslyUseHTMLString: true });
            }
            // scroll to bottom
            setTimeout(() =>
            {
              let win = this.$refs.R;
              let st = win.scrollTop;
              let sh = win.scrollHeight;
              if (sh && st != sh)
              {
                win.scrollTop = sh;
              }
            }, 1);
          }
          else if (job.state == 1) // 1 = completed job
          {
            this.$refs.lp.setCurJob(job, true);
            this.isAdvanceView = false;
          }
          else if (job.state == -1) // -1 = failed job
          {
            for (let i = 0, n = GB.jobs.length; i < n; i++)
            {
              if (GB.jobs[i].uuid == job.uuid)
              {
                GB.jobs.splice(i, 1);
                break;
              }
            }
          }
          // 4.save jobs
          SaveJobs();
        }
      };
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
#my-workspace {
  width: 100%;
  height: 100%;
  background-color: #FFF;
  display: flex;
}

.L {
  flex: 3 1 1080px;
  overflow: auto;
  height: 100%;
  box-sizing: border-box;
  border-left: 2px solid #744da9;
  display: flex;
  flex-direction: column;
  position: relative;
}

.R {
  flex: 1 1 360px;
  box-sizing: border-box;
  min-width: 360px;
  height: 100%;
  overflow-y: auto;
  background-color: white;
  border-top: none;
  border-right: 2px solid #744da9;
  border-bottom: none;
}

.L-head {
  display: none;
}

.R-head {
  flex-shrink: 0;
}

.L-body {
  flex-grow: 1;
  overflow: auto;
}

.R-body {
  padding: 4px;
}

.R-first-line {
  height: var(--my-bar-height-l);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-color-primary-light-9);
}

.R-first-line>* {
  white-space: nowrap;
  line-height: 1;
}

.R-foot .fieldset {
  border: 1px solid var(--el-color-warning);
  margin: 0px 4px 4px 4px;
}

.R-foot .legend {
  color: blue;
  text-align: center;
  background-color: var(--el-color-warning-light-7);
  height: var(--my-bar-height-s);
  line-height: var(--my-bar-height-s);
}

.working-item {
  margin: 4px;
  display: flex;
  align-items: center;
  height: var(--my-bar-height-s);
}

.working-item span {
  font-family: digitW;
  flex-grow: 1;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}

.working-item:hover {
  cursor: default;
  background-color: #EEE;
}

@include media-breakpoint-down(sm) {
  #my-workspace {
    flex-direction: column;
  }

  .L {
    height: calc(100% - 96px) !important;
  }

  .R {
    position: absolute;
    width: 100% !important;
    height: calc(100% - var(--my-bar-height));
    z-index: 10;
  }

  .R-first-line {
    padding: 0px 4px;
    justify-content: space-between;
  }
}
</style>
<style>
.el-popover.el-popper {
  padding: 12px 8px !important;
}
</style>
