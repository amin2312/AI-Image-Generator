<template>
  <div id="my-frame-body">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "FrameBody",
};
</script>

<style scoped>
#my-frame-body {
  height: calc(100% - var(--my-bar-height));
  display: flex;
  flex-direction: column;
}
</style>
