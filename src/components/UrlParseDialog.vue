<template>
  <el-dialog
    v-model="localVisible"
    :show-close="false"
    :close-on-click-modal="!loading"
    :close-on-press-escape="!loading"
    width="700px"
  >
    <template #header>
      解析 Subconverter 链接
    </template>

    <el-form label-position="left" :inline="true">
      <el-form-item prop="loadConfig" label="订阅链接：" label-width="85px">
        <el-input v-model="localLoadConfig" :disabled="loading" style="width: 565px" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading">取 消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading" :disabled="loading || localLoadConfig.trim().length === 0">
          确 定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'UrlParseDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loadConfig: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'cancel', 'confirm'],
  data() {
    return {
      localLoadConfig: this.loadConfig
    };
  },
  computed: {
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
    loadConfig(newVal) {
      this.localLoadConfig = newVal;
    }
  },
  methods: {
    handleCancel() {
      if (this.loading) return
      this.$emit('cancel')
    },
    handleConfirm() {
      if (this.loading) return
      this.$emit('confirm', this.localLoadConfig)
    }
  }
};
</script>
