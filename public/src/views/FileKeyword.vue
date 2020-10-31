<template>
  <div class="filekeyword-container">
    <input type="file" />
    <div @click="uploadFile">上传</div>
    <input type="text" id="keyword" />
    <div @click="identify">识别</div>
  </div>
</template>

<script>
import { reactive, ref, toRefs } from "vue";
import keywordAPI from "../api/keyword";

export default {
  name: "FileKeyword",
  setup(props, context) {
    let hash = ref("");

    const uploadFile = () => {
      let formData = new FormData();
      let fileField = document.querySelector("input[type='file']");
      formData.append("file", fileField.files[0]);

      // 上传调用API
      keywordAPI
        .uploadFile(formData)
        .then((response) => {
          console.log("Success:", response);
          hash = response.data;
        })
        .catch((error) => console.error("Error:", error));
    };

    const identify = () => {
      let keyword = document.querySelector("#keyword").value;

      // 识别接口
      keywordAPI.search(keyword, hash).then((res) => {
        console.log(res);
      });
    };

    return {
      uploadFile,
      identify,
    };
  },
};
</script>

<style scoped>
</style>
