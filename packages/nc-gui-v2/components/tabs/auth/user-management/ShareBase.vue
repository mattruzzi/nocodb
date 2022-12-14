<script setup lang="ts">
import { useToast } from 'vue-toastification'
import { useClipboard } from '@vueuse/core'
import OpenInNewIcon from '~icons/mdi/open-in-new'
import { dashboardUrl } from '~/utils/urlUtils'
import { extractSdkResponseErrorMsg } from '~/utils/errorUtils'
import MdiReload from '~icons/mdi/reload'
import DownIcon from '~icons/ic/round-keyboard-arrow-down'
import ContentCopyIcon from '~icons/mdi/content-copy'
import MdiXmlIcon from '~icons/mdi/xml'
const toast = useToast()

interface ShareBase {
  uuid?: string
  url?: string
  role?: string
}

enum ShareBaseRole {
  Editor = 'editor',
  Viewer = 'viewer',
}

const { $api, $e } = useNuxtApp()
let base = $ref<null | ShareBase>(null)
const showEditBaseDropdown = $ref(false)
const { project } = useProject()
const { copy } = useClipboard()

const url = $computed(() => (base && base.uuid ? `${dashboardUrl()}#/nc/base/${base.uuid}` : null))

const loadBase = async () => {
  try {
    if (!project.value.id) return

    const res = await $api.project.sharedBaseGet(project.value.id)
    base = {
      uuid: res.uuid,
      url: res.url,
      role: res.roles,
    }
  } catch (e: any) {
    console.error(e)
    toast.error(await extractSdkResponseErrorMsg(e))
  }
}

const createShareBase = async (role = ShareBaseRole.Viewer) => {
  try {
    if (!project.value.id) return

    const res = await $api.project.sharedBaseUpdate(project.value.id, {
      roles: role,
    })

    base = res || {}
    base.role = role
  } catch (e: any) {
    console.error(e)
    toast.error(await extractSdkResponseErrorMsg(e))
  }
  $e('a:shared-base:enable', { role })
}

const disableSharedBase = async () => {
  try {
    if (!project.value.id) return

    await $api.project.sharedBaseDisable(project.value.id)
    base = null
  } catch (e: any) {
    console.error(e)
    toast.error(await extractSdkResponseErrorMsg(e))
  }

  $e('a:shared-base:disable')
}

const recreate = async () => {
  try {
    if (!project.value.id) return

    const sharedBase = await $api.project.sharedBaseCreate(project.value.id, {
      roles: base?.role || ShareBaseRole.Viewer,
    })
    const newBase = sharedBase || {}
    base = { ...newBase, role: base?.role }
  } catch (e: any) {
    console.error(e)
    toast.error(await extractSdkResponseErrorMsg(e))
  }

  $e('a:shared-base:recreate')
}

const copyUrl = async () => {
  if (!url) return

  copy(url)
  toast.success('Copied shareable base url to clipboard!')

  $e('c:shared-base:copy-url')
}

const navigateToSharedBase = () => {
  if (!url) return

  window.open(url, '_blank')

  $e('c:shared-base:open-url')
}

const generateEmbeddableIframe = () => {
  if (!url) return

  copy(`<iframe
class="nc-embed"
src="${url}?embed"
frameborder="0"
width="100%"
height="700"
style="background: transparent; border: 1px solid #ddd"></iframe>`)
  toast.success('Copied embeddable html code!')

  $e('c:shared-base:copy-embed-frame')
}

onMounted(() => {
  if (!base) {
    loadBase()
  }
})
</script>

<template>
  <div class="flex flex-col w-full">
    <div class="flex flex-row items-center space-x-0.5 pl-2 h-[0.8rem]">
      <OpenInNewIcon />
      <div class="text-xs">Shared Base Link</div>
    </div>
    <div v-if="base?.uuid" class="flex flex-row mt-2 bg-red-50 py-4 mx-1 px-2 items-center rounded-sm w-full justify-between">
      <span class="flex text-xs overflow-x-hidden overflow-ellipsis text-gray-700 pl-2">{{ url }}</span>
      <div class="flex border-l-1 pt-1 pl-1">
        <a-tooltip placement="bottom">
          <template #title>
            <span>Reload</span>
          </template>
          <a-button type="text" class="!rounded-md mr-1 -mt-1.5 h-[1rem]" @click="recreate">
            <template #icon>
              <MdiReload class="flex mx-auto text-gray-600" />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip placement="bottom">
          <template #title>
            <span>Copy URL</span>
          </template>
          <a-button type="text" class="!rounded-md mr-1 -mt-1.5 h-[1rem]" @click="copyUrl">
            <template #icon>
              <ContentCopyIcon class="flex mx-auto text-gray-600" />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip placement="bottom">
          <template #title>
            <span>Open new tab</span>
          </template>
          <a-button type="text" class="!rounded-md mr-1 -mt-1.5 h-[1rem]" @click="navigateToSharedBase">
            <template #icon>
              <OpenInNewIcon class="flex mx-auto text-gray-600" />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip placement="bottom">
          <template #title>
            <span>Copy embeddable HTML code</span>
          </template>
          <a-button type="text" class="!rounded-md mr-1 -mt-1.5 h-[1rem]" @click="generateEmbeddableIframe">
            <template #icon>
              <MdiXmlIcon class="flex mx-auto text-gray-600" />
            </template>
          </a-button>
        </a-tooltip>
      </div>
    </div>
    <div class="flex text-xs text-gray-500 mt-2 justify-start ml-2">Generate publicly shareable readonly base</div>
    <div class="mt-4 flex flex-row justify-between mx-1">
      <a-dropdown v-model="showEditBaseDropdown" class="flex">
        <a-button>
          <div class="flex flex-row items-center space-x-2">
            <div v-if="base?.uuid">Anyone with the link</div>
            <div v-else>Disable shared base</div>
            <DownIcon class="h-[1rem]" />
          </div>
        </a-button>

        <template #overlay>
          <a-menu>
            <a-menu-item>
              <div v-if="base?.uuid" @click="disableSharedBase">Disable shared base</div>
              <div v-else @click="createShareBase(ShareBaseRole.Viewer)">Anyone with the link</div>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <a-select v-if="base?.uuid" v-model:value="base.role" class="flex">
        <template #suffixIcon>
          <div class="flex flex-row">
            <DownIcon class="text-black -mt-0.5 h-[1rem]" />
          </div>
        </template>
        <a-select-option
          v-for="(role, index) in [ShareBaseRole.Editor, ShareBaseRole.Viewer]"
          :key="index"
          :value="role"
          dropdown-class-name="capitalize"
          @click="createShareBase(role)"
        >
          <div class="w-full px-2 capitalize">
            {{ role }}
          </div>
        </a-select-option>
      </a-select>
    </div>
  </div>
</template>

<style scoped></style>
