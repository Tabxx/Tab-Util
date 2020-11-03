<template>
  <div class="filekeyword-container">
    <el-upload
      class="upload-demo"
      drag
      action="http://localhost:5000/uploadFile"
      :onSuccess="uploadSuccess"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过5M</div>
    </el-upload>

    <el-select
      v-model="keyword"
      multiple
      filterable
      allow-create
      default-first-option
      placeholder="请输入要识别的文字"
    >
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
    <el-button type="primary" @click="identify">提交识别</el-button>
  </div>
</template>

<script>
import { reactive, ref, toRefs, getCurrentInstance } from 'vue'
import keywordAPI from '../api/keyword'

export default {
  name: 'FileKeyword',
  setup(props, context) {
    let hash = ref('')
    let options = ref([
      {
        value: '埋点',
        label: '埋点',
      },
      {
        value: '交互',
        label: '交互',
      },
    ])
    let keyword = ref([])

    const uploadFile = () => {
      let formData = new FormData()
      let fileField = document.querySelector("input[type='file']")
      formData.append('file', fileField.files[0])

      // 上传调用API
      keywordAPI
        .uploadFile(formData)
        .then((response) => {
          console.log('Success:', response)
          hash = response.data
        })
        .catch((error) => console.error('Error:', error))
    }
    const internalInstance = getCurrentInstance()
    console.log(internalInstance)
    const identify = () => {
      let key = keyword.value.join('$tab$')
      // let keyword = document.querySelector('#keyword').value

      // 识别接口
      keywordAPI.search(key, hash).then((res) => {
        if (res.data) {
          alert(`文档中存在“${keyword.value.join(',')}”的关键词`)
        } else {
          alert('未识别到关键词')
        }
      })
    }

    const uploadSuccess = (response) => {
      hash = response.data
    }

    return {
      uploadFile,
      identify,
      uploadSuccess,
      options,
      keyword,
    }
  },
}
</script>

<style scoped>
</style>
