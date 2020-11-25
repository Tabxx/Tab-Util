import { getImageInfo, init } from '../util/indexDB';
init();
export default {
  beforeMount(el, binding, vnode, prevVnode) {
    let { url, key } = binding.value;
    setTimeout(() => {
      getImageInfo(url, key, (blob) => {
        el.src = window.URL.createObjectURL(blob)
      })
    }, 100)

  },
  mounted(el, binding) {

  },
  beforeUpdate() { },
  updated() { },
  beforeUnmount() { }, // new
  unmounted() { }
}