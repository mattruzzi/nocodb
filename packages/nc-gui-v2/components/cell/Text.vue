<script setup lang="ts">
import { computed, inject, onMounted, ref } from '#imports'

interface Props {
  modelValue: any
}

const { modelValue: value } = defineProps<Props>()

const emit = defineEmits(['update:modelValue'])

const editEnabled = inject<boolean>('editEnabled', false)

const root = ref<HTMLInputElement>()

const localState = computed({
  get: () => value,
  set: (val) => emit('update:modelValue', val),
})

onMounted(() => {
  root.value?.focus()
})

/* export default {
  name: 'TextCell',
  props: {
    value: [String, Object, Number, Boolean, Array],
  },
  computed: {
    localState: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      },
    },
    parentListeners() {
      const $listeners = {}

      if (this.$listeners.blur) {
        $listeners.blur = this.$listeners.blur
      }
      if (this.$listeners.focus) {
        $listeners.focus = this.$listeners.focus
      }

      if (this.$listeners.cancel) {
        $listeners.cancel = this.$listeners.cancel
      }

      return $listeners
    },
  },
  mounted() {
    this.$el.focus()
  },
} */
</script>

<template>
  <input v-if="editEnabled" ref="root" v-model="localState" />
  <span v-else>{{ localState }}</span>
  <!--  v-on="parentListeners" /> -->
</template>

<style scoped>
input,
textarea {
  width: 100%;
  height: 100%;
  color: var(--v-textColor-base);
  outline: none;
}
</style>
<!--
/**
 * @copyright Copyright (c) 2021, Xgene Cloud Ltd
 *
 * @author Naveen MR <oof1lab@gmail.com>
 * @author Pranav C Balan <pranavxc@gmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
-->
