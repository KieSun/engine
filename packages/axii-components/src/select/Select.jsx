/** @jsx createElement */
/** @jsxFrag Fragment */
import {
  createElement,
  createComponent,
  useRef,
  propTypes,
  atom,
  atomComputed,
  reactive,
  delegateLeaf,
  overwrite,
} from 'axii'
import useLayer from "../hooks/useLayer";
import {composeRef, nextTick} from "../util";
import Input from "../input/Input";
import scen from "../pattern";

export function Select({value, options, onChange, renderOption, renderValue, onFocus, onBlur, focused, ref}, fragments) {
  const optionListRef = useRef()

  const onInputFocus = () => {
    // CAUTION 这里 onFocus() 的写法，不传参很重要，这样 callback 系统补齐的默认参数顺序才正确
    onFocus()
    // 在 nextTick 中 focus calendar 是因为在当前是在 onFocus 事件中，focus 到别的 element 上没用。用 e.preventDefault 也不行
    nextTick(() => optionListRef.current.focus())
  }

  const getContainerRect = ({top, left, height}) => {
    return {
      top: height + top,
      left,
    }
  }

  const {source, node: optionListNode} = useLayer((sourceRef) => {
    return (
      <optionList
        inline
        inline-display-none={atomComputed(() => !focused.value)}
        inline-min-width={atomComputed(() => `${sourceRef.value ? sourceRef.value.offsetWidth : 0}px`)}
        tabindex={-1}
        onFocusOut={() => onBlur()}
        style={{background: "#fff", zIndex: 99}}
        ref={optionListRef}
      >
        {() => options.map(option => fragments.optionItem({ option })(
          <optionItem
            block
            block-font-size={scen().fontSize()}
            block-padding={`${scen().spacing(-1)}px ${scen().spacing()}px `}
            onClick={() => {
              onChange(option)
              onBlur()
            }}
          >
            {renderOption(option)}
          </optionItem>
        ))}
      </optionList>)
    }, {
      getContainerRect,
    })

  return (
    <container block flex-display-inline>
      <selectInput
        layout:inline
        layout:inline-max-width="100%"
        use={Input}
        ref={composeRef(ref,  source)}
        onFocus={onInputFocus}
        focused={focused}
        onBlur={() => false}
        value={atomComputed(() => renderValue(value))}
      >
      </selectInput>
      {optionListNode}
    </container>
  )
}

Select.propTypes = {
  value: propTypes.object.default(() => atom(undefined)),
  options: propTypes.object.default(() => reactive([])),
  focused: propTypes.bool.default(() => atom(false)),
  onFocus: propTypes.callback.default(() => ({focused}) => focused.value = true),
  onBlur: propTypes.callback.default(() => ({focused}) => {
    focused.value = false
  }),

  match: propTypes.function.default(() => (value, option) => {
    return value.value ? value.value.id === option.id : false
  }),
  renderOption: propTypes.function.default(() => (option) => option.name),
  renderValue: propTypes.function.default(() => (value) => value.value ? value.value.name : ''),
  optionToValue: propTypes.function.default(() => (option) => Object.assign({}, option)),
  onChange: propTypes.callback.default(() => (option, {value, optionToValue}) => {
    value.value = optionToValue(option)
  }),
}

Select.Style = (fragments) => {
  fragments.optionItem.elements.optionItem.style(({ value, option, match}) => {
    const equal = match(value, option)

    return {
      background: equal?
        scen().inverted().active().bgColor() :
        scen().active().bgColor(),
      color: equal ? scen().interactable().active().inverted().color() : scen().color(),
      cursor: 'pointer',
    }
  })

  fragments.root.elements.optionList.style({
    boxShadow: scen().elevate().shadow()
  })
}

Select.forwardRef = true


/**
 * TODO 搜索模式。支持回车选中。
 * 理论上回车的时候如果没有，或者blur 的时候没有，应该是什么样子？
 *
 */
export function SearchableFeature(fragments) {
  // TODO
}

SearchableFeature.propTypes = {
  searchable :propTypes.object.default(() => atom(false)),
  allOptions: propTypes.object.default(() => reactive([])),
}

/**
 * 推荐模式
 * 注意推荐模式和搜索模式心智完全不同。搜索模式中 value 不能超出 option 的范围，而推荐则是 value 以 input 为准。
 */
export function RecommendMode(fragments) {
  // 1. 修改 input 的 value，使得可以输入，每次输入的时候更新 options
  fragments.root.modify((result, { onFocus, onBlur, focused, inputToValue, onChange, options, onRenderOptionChange, onPressEnter }) => {

    const inputNode = result.children[0]
    const inputRef = useRef()
    // 增加 ref， 后面 blur 的时候要用。
    inputNode.ref = composeRef(inputNode.ref, inputRef)

    const onInputChange = ({ value: inputValue }) => {
      const nextValue = inputToValue(inputValue.value)
      onChange(nextValue)
      onRenderOptionChange(nextValue)
    }

    const onKeyDown = (e) => {
      if (e.code === 'Enter') {
        onPressEnter()
        inputRef.current.blur()
      }
    }

    Object.assign(inputNode.attributes, {
      onFocus: () => onFocus(),
      onChange: onInputChange,
      // TODO 这里有个问题，如果 input 自己控制 Blur, 那么浮层上面的 onClick 就没法触发，因为 onBlur 发生在前面。浮层已经收起来了。
      // 如果 input 不控制 blur，那么丢失焦点就没用了。先用 nextTick 强行解决一下
      onKeyDown,
      onBlur: overwrite(() => {
        // TODO 这里还一定得是数值足够大 timeout 才行，得等 onClick 触发了，才能 blur。
        setTimeout(() => {
          if (focused.value) onBlur()
        }, 50)
      }),
    })

  })
}

RecommendMode.propTypes = {
  allOptions: propTypes.object.default(() => reactive([])),
  recommendMode : propTypes.bool.default(() => atom(false)),
  delegateValue : propTypes.function.default(() => (value) => delegateLeaf(value).name),
  inputToValue: propTypes.function.default(() => (v) => ({ name: v })),
  filter: propTypes.function.default(() => (value, allOptions) => {
    return allOptions.filter(o => {
      const exp = new RegExp(`${value.name}`)
      return exp.test(o.name)
    })
  }),
  onRenderOptionChange: propTypes.callback.default(() =>(value, { options, filter, allOptions }) => {
    options.splice(0, options.length, ...filter(value, allOptions))
  }),
  matchInputValue: propTypes.function.default(() => (value, option) => {
    return value.value.name === option.name
  }),
  // TODO 理论上需要更容易的机制来透传对 Input 的控制。这里先快速实现一下。
  onPressEnter: propTypes.callback.default(() =>({value, options, onBlur, onChange, matchInputValue}) => {
    // 如果能匹配，就选中匹配的。
    const matchedOption = options.find(option => matchInputValue(value, option))
    if (matchedOption) onChange(matchedOption)

    onBlur()
  }),
}


// TODO Select 的多选 feature

export default createComponent(Select, [SearchableFeature, RecommendMode])
