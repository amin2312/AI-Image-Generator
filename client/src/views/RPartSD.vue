<template>
  <div id='R-SD'>
    <el-input v-model="input.prompt" :rows="3" type="textarea" :maxlength="2000" show-word-limit :placeholder="Lang.id(121)" />
    <el-input v-model="input.negativePrompt" style="margin-top:4px" :rows="3" type="textarea" :maxlength="2000" show-word-limit :placeholder="Lang.id(147)" />
    <table class="tab">
      <tr>
        <td>{{ Lang.n.model }}</td>
        <td>{{ G.MODELS[1] }} {{ input.version }}</td>
      </tr>
      <tr>
        <td>{{ Lang.n.version }}</td>
        <td>
          <el-radio-group v-model="input.version" fill="green">
            <el-radio-button size="small" :label="1.6">1.6</el-radio-button>
          </el-radio-group>
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.width }}</td>
        <td class='td2'>
          <el-slider v-model="input.param.width" :min="320" :max="1536" size="small" />
          <el-input-number v-model="input.param.width" :min="320" :max="1536" size="small" :controls="false" />
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.height }}</td>
        <td class='td2'>
          <el-slider v-model="input.param.height" :min="320" :max="1536" size="small" />
          <el-input-number v-model="input.param.height" :min="320" :max="1536" size="small" :controls="false" />
        </td>
      </tr>
      <tr>
        <td>CFG Scale</td>
        <td class='td2'>
          <el-slider v-model="input.param.cfg_scale" :min="0" :max="35" size="small" />
          <el-input-number v-model="input.param.cfg_scale" :min="0" :max="35" size="small" :controls="false" />
        </td>
      </tr>
      <tr :title="Lang.n.steps2">
        <td>{{ Lang.n.steps }}</td>
        <td class='td2'>
          <el-slider v-model="input.param.steps" :min="10" :max="50" size="small" />
          <el-input-number v-model="input.param.steps" :min="10" :max="50" size="small" :controls="false" />
        </td>
      </tr>
      <tr>
        <td>CLIP Guidance</td>
        <td>
          <el-select v-model="input.param.clip_guidance_preset" size="small">
            <el-option v-for="item in clip_guidance_enmu" :key="item" :value="item" />
          </el-select>
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.sampler }}</td>
        <td>
          <el-select v-model="input.param.sampler" size="small">
            <el-option v-for="item in sampler_enmu" :key="item" :value="item" />
          </el-select>
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.style }}</td>
        <td>
          <el-select v-model="input.param.style_preset" size="small">
            <el-option v-for="item in style_enmu" :key="item" :value="item" />
          </el-select>
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.seed }}</td>
        <td>
          <el-input-number v-model="input.param.seed" :min="0" :max="4294967295" size="small" :controls="false" />
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.supplier }}</td>
        <td>
          <el-radio-group v-model="input.supplier" fill="green">
            <el-radio-button label="stability" size="small">stability</el-radio-button>
          </el-radio-group>
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.apiKey }}</td>
        <td style="display: flex;">
          <el-input v-model="input.api_key" :placeholder="Lang.id(120)" />
          <button class="inside_btn" @click="onHelpApiKey"><icon-help fill="#000" style="margin:0px 4px;" /></button>
        </td>
      </tr>
    </table>
    <div class="op_buttons">
      <div>
        <button class="op_button" @click="onClear()" :disabled="isDisabledSubmit">{{ Lang.n.clear }}</button>
      </div>
      <div>
        <button class="op_button op_button_hl2" @click="onSubmit()" :disabled="isDisabledSubmit">{{ Lang.n.generate }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { G, GB } from "../G";
import Lang from '../Lang';
import Kit from '../Kit';

const DEFAULT_INPUT = {
  template: 1,
  isExample: false,
  model: G.MODELS[1],
  prompt: '',
  negativePrompt: '',
  version: 1.6,
  param:
  {
    width: 512,
    height: 512,
    cfg_scale: 7,
    clip_guidance_preset: 'NONE',
    sampler: 'default',
    samples: 1,
    seed: 0,
    steps: 30,
    style_preset: 'default',
  },
  supplier: 'stability',
  api_key: '',
};

export default {
  name: "RPartSD",
  props:
  {
    isDisabledSubmit: Boolean,
  },
  data()
  {
    return {
      clip_guidance_enmu: ['FAST_BLUE', 'FAST_GREEN', 'NONE', 'SIMPLE', 'SLOW', 'SLOWER', 'SLOWEST'],
      sampler_enmu: ['default', 'DDIM', 'DDPM', 'K_DPMPP_2M', 'K_DPMPP_2S_ANCESTRAL', 'K_DPM_2', 'K_DPM_2_ANCESTRAL', 'K_EULER', 'K_EULER_ANCESTRAL', 'K_HEUN', 'K_LMS'],
      style_enmu: ['default', '3d-model', 'analog-film', 'anime', 'cinematic', 'comic-book', 'digital-art', 'enhance', 'fantasy-art', 'isometric', 'line-art', 'low-poly', 'modeling-compound', 'neon-punk', 'origami', 'photographic', 'pixel-art', 'tile-texture'],
      input: JSON.parse(JSON.stringify(DEFAULT_INPUT)),
    };
  },
  mounted() { },
  methods:
  {
    onHelpApiKey()
    {
      ElMessageBox.alert(Lang.id(159), null);
    },
    onClear()
    {
      this.input = JSON.parse(JSON.stringify(DEFAULT_INPUT));
    },
    onSubmit()
    {
      this.submit();
    },
    submit()
    {
      if (!this.input.prompt)
      {
        ElMessage.warning(Lang.id(121));
        return;
      }
      if (this.$parent.submitRequest(this.input))
      {
        this.input.prompt = '';
        this.input.negativePrompt = '';
      }
    },
  }
};
</script>

<style lang="scss" scoped>
#R-SD {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab tr>td:first-child {
  width: 72px;
  text-align: center;
}

.tab td {
  border-bottom: 1px solid #EEE;
  padding: 4px 0px;
}

.tab td .el-radio-group {
  vertical-align: middle;
}

.td2 {
  display: flex;
  align-items: center;
}

.td2 .el-slider {
  margin: 0px 16px 0px 8px;
}
.inside_btn {
  color: #FFF;
  border: none;
  display: inline-block;
  height: 32px;
  padding: 0px 4px;
  background-color: transparent;
  box-sizing: border-box;
}

.inside_btn:hover {
  cursor: pointer;
  background-color: var(--el-color-primary-light-9);
}

.op_buttons {
  display: flex;
  height: var(--my-bar-height-ml);
}

.op_buttons>div {
  flex-basis: 50%;
  flex-grow: 1;
  margin: 4px 0px;
  display: flex;
}

.op_buttons>div+div {
  margin-left: 2px;
}

.op_buttons>div>* {
  flex-basis: 50%;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

.op_buttons .el-button+.el-button {
  margin-left: 4px;
}

.op_buttons .i-icon {
  margin: 0px 4px;
}
</style>
