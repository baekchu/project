
import { useCallback, useState } from 'react'

import { Page } from '@/models/page'

import { PageRepository } from '@/config/page.repository'



const pageRepo = new PageRepository()

export const usePage = () => {

  const [page, setPage] = useState<Page>()

  const fetchPage = useCallback(async (id: string) => {
    await pageRepo.get(id).then((res) => setPage(res))
  }, [])

  // TODO: DTO
  const addPage = useCallback(async (page: Parameters<PageRepository['add']>[number]) => {
    await pageRepo.add(page).catch((e) => console.error(e))
  }, [])

  const updatePage = useCallback(
    async (id: string, updateObject: Partial<Page>, onUpdate?: () => void) => {
      return await pageRepo
        .update(id, { ...updateObject, updatedAt: new Date() })
        .then(onUpdate)
        .catch((e) => console.error(e))
    },
    []
  )

  const deletePage = useCallback(async (id: string, pages?: Page[]) => {
    const page = await pageRepo.get(id)

    await pageRepo.delete(id).catch((e) => console.error(e))

    if (!page.isPrimary()) {
      if (!pages) return
      const parent = page.getParent(pages)
      if (parent) {
        await pageRepo.update(parent.id, {
          childIds: parent.childIds?.filter((id) => id !== page.id),
        })
      }
    }
  }, [])


  return { page, fetchPage, addPage, updatePage, deletePage }
}
