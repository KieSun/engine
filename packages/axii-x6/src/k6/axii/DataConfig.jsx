/** @jsx createElement */
import {
  tryToRaw,
  createElement,
  createComponent,
  createContext,
  reactive,
  useViewEffect,
  useContext,
  watch,
  delegateLeaf,
  traverse,
  atom,
  computed,
} from 'axii';

import { RootContext } from './Root';
import { Input, Select, Button, Checkbox } from 'axii-components'
import cloneDeep from 'lodash/cloneDeep';
import Down from 'axii-icons/Down';
import Delete from 'axii-icons/Delete';
import { get, set, merge, take } from 'lodash';

const SimpleFormField = createComponent((() => {
  function FormField({ item, onChange }) {
    return (
      <formField>
        <fieldName>{item.description}</fieldName>
        <fieldValue block block-margin="4px 0px 8px 0">
          {() => {
            switch (item.type) {
              case 'string':
                return (
                  <Input onChange={onChange} layout:block value={delegateLeaf(item).value} />
                );
              case 'number':
                return (
                  <Input onChange={onChange}  layout:block type="number" value={delegateLeaf(item).value} />
                );
              case 'boolean':
                return (
                  <Checkbox onChange={onChange} value={delegateLeaf(item).value} />
                );
            }
          }}
        </fieldValue>
      </formField>
    );
  }
  FormField.Style = () => {

  };
  return FormField;
})());

function firstValue(obj) {
  return Object.values(obj || {})[0] || '';
}


const HigherFormField = createComponent((() => {
  function FormField({ item, onChange }, frag) {
    const expandIndex = atom(null);

    function addItem() {
      // 构造一个array children结构
      const newObj = item.properties.map(p => {
        return {
          [p.name]: null,
        }
      }).reduce((p, n) => Object.assign(p, n), {});      
      item.value.push(newObj);
      const newChildren = rebuildArrayValue2ReactiveChildren(item, item.value);
      item.children = merge(newChildren, item.children);
      onChange();
    }

    function genClickOnItemHeader(i) {
      return () => {
        if (expandIndex.value === i) {
          expandIndex.value = null;
        } else {
          expandIndex.value = i;
        }
      };
    }

    function genRemoveItem(children, index) {
      return () => {
        item.value.splice(index, 1);
        children.splice(index, 1);        
        onChange();
      };
    }

    function renderItemList(children) {
      return children.map((item, index) => {
        return (
          <itemContainer>
            <itemBox block flex-display flex-align-items="center">
              <itemHeader
                flex-grow="1"
                onClick={genClickOnItemHeader(index)}
                block block-padding="8px"
                flex-display >
                <text flex-grow="1" >
                  {() => item.properties[0] ? item.properties[0].value : ''}
                </text>
                <icon2><Down /></icon2>
              </itemHeader>
              <icon1 onClick={genRemoveItem(children, index)}><Delete fill="#ff4d4f" /></icon1>
            </itemBox>
            {() => (index === expandIndex.value) ? (
              <DataConfigForm layout:block-padding="16px" json={item} onChange={onChange} />
            ) : ''}
          </itemContainer>
        );
      });
    }

    function renderItemObject(item) {
      return (
        <itemContainer>
          <itemBox block flex-display flex-align-items="center">
            <itemHeader
              flex-grow="1"
              onClick={genClickOnItemHeader(0)}
              block block-padding="8px"
              flex-display >
              <text flex-grow="1" >
                {firstValue(item.value)}
              </text>
              <icon2><Down /></icon2>
            </itemHeader>
          </itemBox>
          {() => (0 === expandIndex.value) ? (
            <DataConfigForm layout:block-padding="16px" json={item} onChange={onChange} />
          ) : ''}
        </itemContainer>
      );
    }

    useViewEffect(() => {
    });

    return (
      <formField>
        <fieldName>{item.description}</fieldName>
        <fieldValue block block-margin="4px 0px 8px 0">
          {() => {
            switch (item.type) {
              case 'object':
                {
                  return (
                    <itemObject>
                      {renderItemObject(item)}
                    </itemObject>
                  );
                }
              case 'array':
                {
                  return (
                    <itemList>
                      {renderItemList(item.children)}
                      <actions block flex-display flex-justify-content="right" block-padding-right="0">
                        <Button layout:block-width="100%" layout:block-margin-top="8px" primary onClick={addItem}>+</Button>
                      </actions>
                    </itemList>
                  );
                }
            }
          }}
        </fieldValue>
      </formField>
    );
  }
  FormField.Style = (frag) => {
    const el = frag.root.elements;

    const itemHeaderStyle = {
      border: '1px solid #999',
      marginBottom: '-1px',
      cursor: 'pointer',
    };
    el.itemHeader.style(itemHeaderStyle);
    frag.itemHeader.elements.itemHeader.style(itemHeaderStyle);
    el.icon1.style({
      marginLeft: '8px',
      cursor: 'pointer',
    });
  };
  return FormField;
})())

function rebuildArrayValue2ReactiveChildren(arrTypeItem, valueArr = []) {
  const children = valueArr.map(singleValue => {
    const firstValueKey = Object.keys(singleValue)[0];
    const { description } = arrTypeItem.properties.find(obj => obj.name === firstValueKey) || {};
    const itemJson = {
      name: firstValueKey,
      description: description || firstValueKey,
      type: 'object',
      properties: cloneDeep(arrTypeItem.properties),
    };
    const mergedItemJson = mergeJsonAndData(itemJson, singleValue);

    return mergedItemJson;
  });
  return children;
}

export function mergeJsonAndData(json, data) {
  if (!json) {
    return json;
  }
  const clonedJson = reactive(cloneDeep(json));

  function traverseJson(obj, path) {
    const cur = path.concat(obj.name);
    
    const propPathArr = cur.slice(1);
    if (propPathArr.length) {
      const value = get(data, propPathArr);
      if (obj.type === 'array') {
        obj.children = rebuildArrayValue2ReactiveChildren(obj, value);
      }
      obj.value = value;
    } else {
      obj.value = data;
    }
    
    if (obj.type != 'array') {
      obj.properties.forEach(child => {
        traverseJson(child, cur);
      });  
    }
  }
  traverseJson(clonedJson, []);

  return clonedJson;
}

export function fallbackEditorDataToNormal(myJson) {
  myJson = tryToRaw(myJson);

  function task(properties, obj) {
    properties.forEach(prop => {
      switch (prop.type) {
        case 'number':
        case 'boolean':
        case 'string':
          obj[prop.name] = tryToRaw(prop.value);
          break;
        case 'object':
          obj[prop.name] = {};
          task(prop.properties, obj[prop.name]);
          break;
        case 'array':
          {
            obj[prop.name] = prop.children.map(child => {
              return task(child.properties, {});
            });  
          }
          break;
      }
    });
    return obj;
  }
  const result = {};
  task(myJson.properties, result);
  return result;
}

const DataConfigForm = createComponent((() => {
  function DataConfigForm({ json, test, onChange }) {
    
    if(test) {
      window.DataConfigFormTopJson = json;        
    }

    return (
      <dataConfigForm block block-width="100%" block-box-sizing="border-box" >
        {() => json.properties.map(item => {
          const isSimple = ['string', 'number', 'boolean'].includes(item.type);
          const isHigher = ['array', 'object'].includes(item.type);
          if (isSimple) {
            return (
              <SimpleFormField item={item} onChange={onChange} />
            );
          }
          if (isHigher) {
            return (
              <HigherFormField item={item} onChange={onChange} />
            );
          }
        })}
      </dataConfigForm>
    );
  }
  DataConfigForm.Style = frag => {
    const el = frag.root.elements;
    el.dataConfigForm.style({
      backgroundColor: '#fff',
    });
  }
  return DataConfigForm
})());

/**
 * layout模式
 * 默认不指定的情况下是根据node.x.y的绝对定位
 * 指定的情况下可以是根据相关Layout（这让我想起了安卓的xml
 */
function DataConfig({ jsonWithData, onChange, onSave }) {
  console.log('[DataConfig] Render: ');

  const myJson = reactive((jsonWithData));
  window.myJson = myJson;

  function clickOnSave() {
    const rawData = fallbackEditorDataToNormal(myJson);
    onSave && onSave(rawData);
  }

  useViewEffect(() => {
    // watch(() => traverse(myJson), () => {
    //   console.log('<DataConfig> myJson changed');
    //     const rawData = fallbackEditorDataToNormal(myJson);
    //     onChange && onChange(rawData);
    // });
  });

  function dataChanged(v) {
    setTimeout(() => {
      const rawData = fallbackEditorDataToNormal(myJson);      
      onChange && onChange(rawData);
  });
  }

  return (
    <dataCofnig block block-margin="16px" block-width="400px" style={{ backgroundColor: '#fff' }}>
      <content block block-padding="16px">
        <DataConfigForm
          json={myJson}
          test
          onChange={dataChanged}
        />
        <actions block flex-display flex-justify-content="right" block-padding-right="0">
          <Button layout:block-margin-top="8px" primary onClick={clickOnSave}>保存</Button>
        </actions>
      </content>
    </dataCofnig>
  );
}

export default createComponent(DataConfig);