<template>
  <div id='R-dall-e'>
    <el-input v-model="input.prompt" :rows="6" type="textarea" :maxlength="4000" show-word-limit :placeholder="Lang.id(121)" />
    <table class="tab">
      <tr>
        <td>{{ Lang.n.model }}</td>
        <td>{{ G.MODELS[0].toUpperCase() }} {{ input.version }}</td>
      </tr>
      <tr>
        <td>{{ Lang.n.version }}</td>
        <td>
          <el-radio-group v-model="input.version" fill="green">
            <el-radio-button size="small" :label="3">3</el-radio-button>
          </el-radio-group>
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.size }}</td>
        <td>
          <el-radio-group v-model="input.param.size" class="param_size" fill="green">
            <el-radio-button label="1024x1024" size="small">1024x1024<br />{{ Lang.id(107) }}</el-radio-button>
            <el-radio-button label="1792x1024" size="small">1792x1024<br />{{ Lang.id(108) }}</el-radio-button>
            <el-radio-button label="1024x1792" size="small">1024x1792<br />{{ Lang.id(109) }}</el-radio-button>
          </el-radio-group>
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.quality }}</td>
        <td>
          <el-radio-group v-model="input.param.quality" fill="green">
            <el-radio-button label="standard" :size="GB.isPhoneView ? 'small' : 'default'">{{ Lang.id(111) }}</el-radio-button>
            <el-radio-button label="hd" :size="GB.isPhoneView ? 'small' : 'default'">{{ Lang.id(112) }}</el-radio-button>
          </el-radio-group>
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.style }}</td>
        <td>
          <el-radio-group v-model="input.param.style" fill="green">
            <el-radio-button label="vivid" :size="GB.isPhoneView ? 'small' : 'default'">{{ Lang.id(114) }}</el-radio-button>
            <el-radio-button label="natural" :size="GB.isPhoneView ? 'small' : 'default'">{{ Lang.id(115) }}</el-radio-button>
          </el-radio-group>
        </td>
      </tr>
      <tr>
        <td>{{ Lang.n.supplier }}</td>
        <td>
          <el-radio-group v-model="input.supplier" fill="green">
            <el-radio-button label="openai" size="small">OpenAI</el-radio-button>
            <el-radio-button label="azure" size="small">Azure</el-radio-button>
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
      <tr v-if="input.supplier == 'azure'">
        <td>{{ Lang.n.apiVer }}</td>
        <td>
          <el-input v-model="input.api_version" :placeholder="Lang.id(120)" />
        </td>
      </tr>
      <tr v-if="input.supplier == 'azure'">
        <td>{{ Lang.n.endpoint }}</td>
        <td>
          <el-input ref='endpoint' v-model="input.endpoint" :placeholder="Lang.id(130)" />
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
  model: G.MODELS[0],
  prompt: '',
  version: 3,
  param:
  {
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  },
  supplier: 'openai',
  api_key: '',
  api_version: '',
  endpoint: '',
};

export default {
  name: "RPartDallE",
  props:
  {
    isDisabledSubmit: Boolean,
  },
  data()
  {
    return {
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
      if (this.input.supplier == 'azure')
      {
        if (!this.input.endpoint)
        {
          ElMessage.warning(Lang.id(129));
          this.$refs.endpoint.focus();
          return;
        }
      }
      if (this.$parent.submitRequest(this.input))
      {
        this.input.prompt = '';
      }
    },
  }
};
</script>

<style lang="scss" scoped>
#R-dall-e {
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

.param_size :deep(.el-radio-button) .el-radio-button__inner {
  line-height: 18px;
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
