<script setup lang="ts">
import type { ColumnType } from 'nocodb-sdk'
import { ViewTypes } from 'nocodb-sdk'
import SmartsheetGrid from '../smartsheet/Grid.vue'
import { computed, inject, provide, useMetas, watch, watchEffect } from '#imports'
import { ActiveViewInj, FieldsInj, IsLockedInj, MetaInj, ReloadViewDataHookInj, RightSidebarInj, TabMetaInj } from '~/context'
import type { TabItem } from '~/composables'

const { getMeta, metas } = useMetas()

const activeView = ref()

const el = ref<typeof SmartsheetGrid>()

const fields = ref<ColumnType[]>([])

const tabMeta = inject(
  TabMetaInj,
  computed(() => ({} as TabItem)),
)

const meta = computed(() => metas.value?.[tabMeta?.value?.id as string])

watchEffect(async () => {
  await getMeta(tabMeta?.value?.id as string)
})

const reloadEventHook = createEventHook<void>()

provide(MetaInj, meta)
provide(TabMetaInj, tabMeta)
provide(ActiveViewInj, activeView)
provide(IsLockedInj, false)
provide(ReloadViewDataHookInj, reloadEventHook)
provide(FieldsInj, fields)
provide(RightSidebarInj, ref(true))

watch(tabMeta, async (newTabMeta, oldTabMeta) => {
  if (newTabMeta !== oldTabMeta && newTabMeta.id) await getMeta(newTabMeta.id)
})
</script>

<template>
  <div class="nc-container flex h-full">
    <div class="flex flex-col h-full flex-1 min-w-0">
      <SmartsheetToolbar />

      <template v-if="meta">
        <div class="flex flex-1 min-h-0">
          <div v-if="activeView" class="h-full flex-grow min-w-0 min-h-0">
            <SmartsheetGrid v-if="activeView.type === ViewTypes.GRID" :ref="el" />

            <SmartsheetGallery v-else-if="activeView.type === ViewTypes.GALLERY" />

            <SmartsheetForm v-else-if="activeView.type === ViewTypes.FORM" />
          </div>
        </div>

        <teleport to="#sidebar-right">
          <SmartsheetSidebar />
        </teleport>
      </template>
    </div>
  </div>
</template>
