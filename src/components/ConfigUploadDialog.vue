<template>
  <el-dialog
    v-model="localVisible"
    :show-close="false"
    :close-on-click-modal="!loading"
    :close-on-press-escape="!loading"
    width="700px"
  >
    <template #header>
      Remote config upload
      <el-popover trigger="hover" placement="right">
        <template #reference>
          <el-icon style="margin-left: 10px"><QuestionFilled /></el-icon>
        </template>
        <el-link type="primary" :href="sampleConfig" target="_blank" :icon="InfoFilled">参考配置</el-link>
      </el-popover>
    </template>

    <el-form label-position="left">
      <el-form-item v-if="resultUrl" label="配置链接">
        <el-input :model-value="resultUrl" readonly />
      </el-form-item>
      <el-form-item v-else prop="uploadConfig">
        <el-input
          v-model="localUploadConfig"
          :disabled="loading"
          type="textarea"
          :autosize="{ minRows: 15, maxRows: 30 }"
          maxlength="10000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading">{{ resultUrl ? '关 闭' : '取 消' }}</el-button>
        <el-button
          v-if="!resultUrl"
          type="primary"
          @click="handleConfirm"
          :loading="loading"
          :disabled="loading || localUploadConfig.trim().length === 0"
        >
          确 定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { InfoFilled, QuestionFilled } from '@element-plus/icons-vue';

import { CONSTANTS } from '@/config/constants';

export default {
  name: 'ConfigUploadDialog',
  components: {
    QuestionFilled
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    uploadConfig: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    resultUrl: {
      type: String,
      default: ''
    }
  },
  emits: ['update:visible', 'cancel', 'confirm'],
  data() {
    return {
      sampleConfig: CONSTANTS.REMOTE_CONFIG_SAMPLE,
      localUploadConfig: this.uploadConfig
    };
  },
  computed: {
    // 图标组件经 computed 暴露，避免放入 data 被转换为响应式对象
    InfoFilled() {
      return InfoFilled;
    },

    localVisible: {
      get() {
        return this.visible;
      },
      set(newVal) {
        this.$emit('update:visible', newVal);
      }
    }
  },
  watch: {
    uploadConfig(newVal) {
      this.localUploadConfig = newVal;
    }
  },
  methods: {
    handleCancel() {
      if (this.loading) return
      this.$emit('cancel')
    },
    handleConfirm() {
      if (this.loading) return
      this.$emit('confirm', this.localUploadConfig)
    }
  }
};
</script>
