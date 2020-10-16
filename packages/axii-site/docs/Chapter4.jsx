/** @jsx createElement */
import { createElement, ref, computed, reactive } from 'axii'

export const text = `
## layout 样式

layout 样式指的是"盒子"大小、位置相关的样式。例如 display/width/height。
因为 layout 样式通常和结构有关。例如 display:flex 影响的是当前元素下的子元素位置。
为了让我们写组、改动组件结构时更好地同步处理 layout 样式，我们为所有原生提供了 layout attribute。

遵循以下步骤:
1. 使用有语义的自定义标签名来替代原生标签名。
2. 指定 text/inline/block 
3. 如果有需要，可以用 flex-display 或者 自己定义的 display。
4. 设置 width/height 或者相应 display 的属性。

layout attribute 提供"连写"的写法来更快地书写:
flex-justify-content="space-between" 
flex-justify-content-space-between

只要提供一个 boolean 值，就可以动态控制是否需要该 layout attribute。
flex-justify-content-space-between={true}
`

export function Code() {
  return (
    <todoList block block-width="100%">
      <todoItem block flex-display flex-justify-content="space-between">
        <name>swimming</name>
        <action>delete</action>
      </todoItem>
      <todoItem block flex-display flex-justify-content-space-between>
        <name>swimming</name>
        <action>delete</action>
      </todoItem>
    </todoList>
  )
}

