# Design System Migration

## Tokens

- Background：深色 `#0b0e13`，浅色主题继续可用。
- Surface：panel / raised panel / border 三层，避免纯黑堆叠。
- Accent：Nucleus blue；green/red/orange 仅表达行情语义。
- Type：页面标题、section kicker、正文、mono 数值四级层次。
- Shape：surface 10px，pill 仅用于 chips/tags，控件 8px。

## Shared components

应用壳层、Sidebar、Top Bar、Global Search、Mobile Navigation、Button、Input、Card、Badge、Tabs、Modal/Drawer/Bottom Sheet 容器、Toast、Skeleton、Empty State、Error State 均使用现有 DOM/组件能力和统一 token；本阶段不改变业务数据。

## Accessibility

保留跳过链接、可见 focus ring、语义导航、按钮/链接可键盘操作、移动端可触达控件尺寸；`prefers-reduced-motion` 继续生效。
