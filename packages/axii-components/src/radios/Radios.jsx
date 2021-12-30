/** @jsx createElement */
/** @jsxFrag Fragment */
import {
  createElement,
  createComponent,
  reactive,
  propTypes,
  atom,
} from 'axii'
import scen from "../pattern";

export function Radios({value, options, onChange, renderOption, match }, fragments) {


  return (
    <container block flex-display-inline>
      {() => options.map(option => fragments.item({option})(
        <radioContainer onClick={() => onChange(option)} inline inline-margin-right-10px>
          <radioButton inline inline-border-width-1px inline-padding-4px inline-margin-right-8px>
            <input type="radio" />
            <radioButtonInner inline inline-width-8px inline-height-8px />
          </radioButton>
          <radioLabel>{renderOption(option)}</radioLabel>
        </radioContainer>
      ))}
    </container>
  )
}

Radios.propTypes = {
  value: propTypes.object.default(() => atom(undefined)),
  options: propTypes.object.default(() => reactive([])),
  match: propTypes.function.default(() => (value, option) => {
    return value.value ? value.value === option : false
  }),
  renderOption: propTypes.function.default(() => (option) => option),
  onChange: propTypes.callback.default(() => (option, {value, optionToValue}) => {
    value.value = optionToValue(option)
  }),
  optionToValue: propTypes.function.default(() => o => o)
}

Radios.Style = (fragments) => {
  fragments.item.elements.radioContainer.style({
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: scen().lineHeight()
  })

  fragments.item.elements.radioButton.style((props) => {
    return {
      borderColor: scen().inverted().active().bgColor() ,
      borderStyle: 'solid',
      position: 'relative',
      borderRadius: '50%',
      width: 16,
      height: 16,
      boxSizing: 'border-box',
      position: 'relative',
    }
  })

  fragments.item.elements.input.style({
    position: 'absolute',
    inset: 0,
    opacity: 0,
    zIndex: 1,
    cursor: 'pointer',
  })

  fragments.item.elements.radioButtonInner.style((props) => {
    const { value, option, match } = props
    const equal = match(value, option)

    return {
      background: equal?
        scen().inverted().active().bgColor() :
        scen().inactive().bgColor(),
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginTop: -4,
      marginLeft: -4,
      borderRadius: 8
    }
  })
}


export default createComponent(Radios)
