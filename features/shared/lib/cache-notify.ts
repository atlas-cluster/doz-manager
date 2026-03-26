import { updateTag } from 'next/cache'

import { publishChange } from '@/features/shared/lib/change-events'

type ChangedEntity = {
  entityType: 'course' | 'lecturer' | 'user'
  entityId: string
}

export async function notifyTagsUpdated(
  tags: string[],
  source?: string,
  entities?: ChangedEntity[]
) {
  const uniqueTags = Array.from(new Set(tags.filter(Boolean)))
  const uniqueEntities = Array.from(
    new Map(
      (entities ?? [])
        .filter((entity) => entity.entityId)
        .map((entity) => [`${entity.entityType}:${entity.entityId}`, entity])
    ).values()
  )

  if (uniqueTags.length === 0) {
    return
  }

  for (const tag of uniqueTags) {
    updateTag(tag)
  }

  await publishChange({
    type: 'tags-updated',
    tags: uniqueTags,
    source,
    entities: uniqueEntities,
  })
}
