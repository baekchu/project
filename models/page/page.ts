import { JSONContent } from '@tiptap/core'

import { Entity } from '../_common_/entity'



export class Page extends Entity {
  emoji: string
  title: string
  layer: number
  order: number
  content?: JSONContent
  publishedAt: Date | null
  childIds?: string[]
  children?: Page[]

  constructor(init: ExcludeMethods<Page>) {
    super(init)

    this.emoji = init.emoji
    this.title = init.title
    this.layer = init.layer
    this.order = init.order
    this.content = init.content
    this.publishedAt = init.publishedAt
    this.childIds = init.childIds
    this.children = init.children
  }

  static create(params: OptionalByKey<ExcludeMethods<Page>,   'createdAt'>) {
    return new Page({
      ...params,
      createdAt: new Date(),
    })
  }

  getTitle(option = { withEmoji: true }) {
    return option?.withEmoji
      ? `${this.emoji} ${this.title || 'Untitled'}`
      : this.title || 'Untitled'
  }

  isPrimary() {
    return this.layer === 1
  }

  hasChildren(): this is Page & {
    children: NonNullable<Page['children']>
    childIds: NonNullable<Page['childIds']>
  } {
    return this.children !== undefined && this.children.length > 0
  }

  nestChildren(pages: Page[]) {
    const children: Page[] = pages
      .filter((p) => this.childIds?.includes(p.id))
      .map((p) => p.nestChildren(pages))

    return new Page({ ...this, children: children })
  }

  getParent(pages: Page[]) {
    return pages.find((p) => p.childIds?.includes(this.id))
  }

  toJson(): ChangeTypeOfKeys<
    ExcludeMethods<Page>,
    'createdAt' | 'updatedAt' | 'publishedAt',
    string
  > {
    return {
      id: this.id,
      emoji: this.emoji,
      title: this.title,
      layer: this.layer,
      order: this.order,
      content: this.content,
      createdAt: this.createdAt.toLocaleString(),
      updatedAt: this.updatedAt?.toLocaleString() || '',
      publishedAt: this.publishedAt?.toLocaleString() || '',
      childIds: this.childIds || [],
    }
  }
}
