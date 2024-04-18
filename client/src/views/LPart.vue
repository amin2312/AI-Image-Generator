<template>
  <div id='gallery'>
    <div class="image-one">
      <div class="op_buttons">
        <template v-if='curJob'>
          <el-popover placement="bottom-start" :title="Lang.n.outputInfo" :width="348" popper-class="gallery-info-popover" trigger="hover" :content="curOutputInfo">
            <template #reference>
              <button class="my_button_white">
                <icon-info size="16" style="margin-right: 4px" />{{ Lang.n.outputInfo1 }}
              </button>
            </template>
            <div style="overflow-x:hidden">
              <pre style="margin:0px 0px 8px 0px">{{ curOutputInfo }}</pre>
              <el-button type="primary" plain @click="onCopyCurOutputInfo">
                <icon-copy size="16" />
              </el-button>
            </div>
          </el-popover>
          <el-popover placement="bottom-start" :title="Lang.n.inputInfo" :width="348" popper-class="gallery-info-popover" trigger="hover">
            <template #reference>
              <button class="my_button_white">
                <icon-info size="16" style="margin-right: 4px" />{{ Lang.n.inputInfo1 }}
              </button>
            </template>
            <div style="overflow-x:hidden">
              <pre style="margin:0px 0px 8px 0px">{{ curInputInfo }}</pre>
              <el-button type="primary" plain @click="onFillCurInputInfo">
                <icon-fill size="16" />
              </el-button>
            </div>
          </el-popover>
          <el-popover placement="bottom-start" :title="Lang.n.imgInfo" :width="348" popper-class="gallery-info-popover" trigger="hover" :content="curImageInfo">
            <template #reference>
              <button class="my_button_white">
                <icon-info size="16" style="margin-right: 4px" />{{ Lang.n.imgInfo1 }}
              </button>
            </template>
          </el-popover>
          <button class="my_button_white" @click="onDelCurJob">
            <icon-delete size="16" style="margin-right: 4px" />{{ Lang.n.delete }}
          </button>
        </template>
        <div v-else></div>
        <div v-if="GB.isPhoneView">
          <el-button type="danger" plain style="margin-left:4px" size="small" @click="$parent.isAdvanceView = true">{{ Lang.n.generate }}</el-button>
        </div>
      </div>
      <div class="cur-image">
        <el-image v-if="curJob" :src="getImgSrc(curJob.image.samples[0])" fit="contain" @click="openCurImage">
          <template #placeholder>
            <div style="color:white;height:100%;display:flex;align-items:center;justify-content:center;">Loading..</div>
          </template>
          <template #error>
            <div style="color:white;height:100%;display:flex;align-items:center;justify-content:center;">Load Failed</div>
          </template>
        </el-image>
      </div>
      <div v-if="curJob" class="image-prompt">
        <el-button type="primary" style="margin-right:4px" size="small" text @click="onCopyCurPrompt">
          <icon-copy size="16" />
        </el-button>{{ curJob.I.prompt }}
      </div>
    </div>
    <div class="image-list">
      <el-scrollbar always id="ImageScrollBar" ref="isb">
        <div id="ImageSet">
          <div v-for="item in Kit.getStateItems(GB.jobs, 1)" :key="item.uuid">
            <div @click="setCurJob(item)" :class="{ 'is-selected-item': curJob == item }">
              <el-image :src="getImgSrc(item.image.samples[0])" lazy scroll-container="#ImageScrollBar .el-scrollbar__wrap" fit="contain">
                <template #placeholder>
                  <div style="color:white;width:120px;height:120px;display:flex;align-items:center;justify-content:center;">Loading</div>
                </template>
                <template #error>
                  <div style="color:white;width:120px;height:120px;display:flex;align-items:center;justify-content:center;">Load Failed</div>
                </template>
              </el-image>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { G, GB, SaveJobs } from "../G";
import Lang from '../Lang';
import Kit from '../Kit';

export default {
  name: "LPart",
  data()
  {
    return {
      curJob: null,
    };
  },
  computed:
  {
    curOutputInfo()
    {
      return JSON.stringify(this.curJob.O, null, 2);
    },
    curInputInfo()
    {
      return Kit.formatInputInfo(this.curJob.I);
    },
    curImageInfo()
    {
      var desc = `uuid: ${ this.curJob.uuid }
${ Lang.n.date }: ${ (new Date(this.curJob.image.created * 1000)).toLocaleString() }
${ Lang.n.elapsed }: ${ this.curJob.image.elapsed }s
`;
      return desc;
    }
  },
  methods:
  {
    onFillCurInputInfo()
    {
      this.$parent.fillInputBy(this.curJob.I);
    },
    onCopyCurPrompt()
    {
      Kit.copyTextToClipboard(this.curJob.I.prompt);
      ElMessage.success(Lang.id(125));
    },
    onCopyCurOutputInfo()
    {
      Kit.copyTextToClipboard(JSON.stringify(this.curJob.O, null, 2));
      ElMessage.success(Lang.id(125));
    },
    setCurJob(v, scrollToEnd = false)
    {
      this.curJob = v;
      if (scrollToEnd)
      {
        setTimeout(() =>
        {
          this.$refs.isb.setScrollLeft(2147483647);
        }, 1);
      }
    },
    getImgSrc(sample)
    {
      var url = '';
      if (sample.type == 'base64')
      {
        return 'data:image/png;base64,' + sample.data;
      }
      else if (sample.type == 'url')
      {
        url = sample.data;
      }
      return url;
    },
    onDelCurJob()
    {
      ElMessageBox.confirm(Lang.id(124), null)
        .then(() =>
        {
          ElMessage.success(Lang.id(125));
          // 1.Delete job
          let index = GB.jobs.indexOf(this.curJob);
          GB.jobs.splice(index, 1);
          this.curJob = GB.jobs[index - 1] || GB.jobs[0] || null;
          // 2.Save jobs
          SaveJobs();
        })
        .catch(() => { });
    },
    openCurImage()
    {
      window.open(this.getImgSrc(this.curJob.image.samples[0]));
    },
  }
};
</script>

<style lang="scss" scoped>
#gallery {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.image-one {
  height: calc(100% - 150px);
  background-color: #1b2221;
}

.op_buttons {
  height: var(--my-bar-height);
  background-color: #333;
  display: flex;
  align-items: center;
}

.op_buttons button {
  line-height: 1;
  height: 100%;
}

.cur-image {
  height: calc(100% - var(--my-bar-height) - var(--my-bar-height));
  display: flex;
  align-items: center;
  justify-content: center;
}

.cur-image .el-image {
  box-sizing: border-box;
  padding: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  cursor: pointer;
}

.image-list {
  height: 150px;
  box-sizing: border-box;
  padding: 4px 4px 0px 4px;
  background-color: #000;
}

.image-prompt {
  color: white;
  height: var(--my-bar-height);
  display: flex;
  align-items: center;
  justify-content: start;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

#ImageSet {
  display: flex;
  justify-content: start;
}

#ImageSet>div {
  border: 2px solid #333;
  box-sizing: border-box;
  display: flex;
  padding: 2px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

#ImageSet>div:hover {
  cursor: pointer;
  border: 2px solid #FFF;
}

.is-selected-item {
  border: 2px solid #fff100 !important;
}

#ImageSet>div+div {
  margin-left: 4px;
}

#ImageSet .el-image {
  width: 120px;
  height: 120px;
}

:deep(.el-scrollbar) .el-scrollbar__bar {
  background-color: #333;
  height: 12px;
}

:deep(.el-scrollbar) .el-scrollbar__thumb {
  background-color: #999;
  opacity: 1;
}

:deep(.el-scrollbar) .is-vertical {
  display: none;
}


@include media-breakpoint-down(sm) {
  .my_button_white {
    padding: 0px !important;
    flex-grow: 1;
  }

  .op_buttons {
    justify-content: space-between;
    padding: 0px 4px 0px 0px;
  }
}
</style>
<style>
.gallery-info-popover {
  white-space: pre-wrap;
}
</style>
