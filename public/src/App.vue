<template>
  <div>
    <input type="file" />
    <div @click="uploadFile">上传</div>
    <input type="text" id="keyword" />
    <div @click="identify">识别</div>
  </div>
</template>

<script>
import { reactive, ref, toRefs } from 'vue'
export default {
  name: 'App',
  setup(props, context) {
    let hash = ''
    const uploadFile = () => {
      let formData = new FormData()
      let fileField = document.querySelector("input[type='file']")
      formData.append('file', fileField.files[0])

      fetch('http://localhost:5000/uploadFile', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((response) => {
          console.log('Success:', response)
          hash = response.data
        })
        .catch((error) => console.error('Error:', error))
    }

    const identify = () => {
      let keyword = document.querySelector('#keyword').value
      fetch(
        'http://localhost:5000/search?keyword=' + keyword + '&fileHash=' + hash
      )
        .then((response) => response.json())
        .then((res) => {
          console.log(res)
        })
    }

    return {
      uploadFile,
      identify,
    }
  },
}
</script>
