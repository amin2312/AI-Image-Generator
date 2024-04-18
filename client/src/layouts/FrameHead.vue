<template>
  <div id="my-frame-head">
    <div><a href="https://www.ai-img-gen.com/">{{ Lang.n.logo }}</a></div>
  </div>
</template>

<script>
export default {
  name: 'FrameHead',
};
</script>

<style scoped>
#my-frame-head {
  height: var(--my-bar-height);
  color: white;
  background-color: #744da9;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

#my-frame-head>div {
  font-size: x-large;
  font-family: LogoFont;
}

a {
  text-decoration: none;
  color: white;
}

a:hover {
  text-decoration: underline;

}
</style>
