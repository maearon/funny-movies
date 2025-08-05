// types/common/mega-menu.ts
export interface MenuCategory {
  title: string
  titleHref?: string // 👈 thêm dòng này
  description?: string // <-- thêm dòng này nếu chưa có
  items: { name: string; href: string }[]
}
