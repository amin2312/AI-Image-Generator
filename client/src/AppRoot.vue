<template>
  <div id="my-body">
    <FrameHead />
    <FrameBody>
      <Workspace />
    </FrameBody>
    <div id="my-model-dialog">
    </div>
  </div>
</template>

<script lang="ts">
import FrameHead from "./layouts/FrameHead.vue";
import FrameBody from "./layouts/FrameBody.vue";
import Workspace from "./views/Workspace.vue";

export default {
  name: "AppRoot",
  components:
  {
    FrameHead,
    FrameBody,
    Workspace,
  },
  mounted()
  {
    window.dispatchEvent(new CustomEvent('VueMounted'));
  },
};
</script>

<style lang="scss" scoped>
#my-body {
  width: 100%;
  height: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  max-width: 1440px;
  box-sizing: border-box;
  border-top: none;
  border-bottom: none;
}

@include media-breakpoint-down(sm) {
  #my-body {
    max-width: 100%;
  }
}
</style>
