import {
  reactive,
} from 'axii';
import EventEmiter from 'eventemitter3';
import { IBBox, IX6Cell, IX6Node, IX6Edge } from '../basicTypes';
import { K6Edge, K6EdgeChild, INodeEdge } from '../Edge';
import { IK6DataConfig, K6Node, K6NodeChild, INodeComponent } from '../Node';
import { K6Port, K6PortChild, IRegisterPortConfigProps, INodePort } from '../Port';
import { cloneDeep } from 'lodash';

type IDataNode = IX6Node & {
  edges: IEdgeData[];
};
type IEdgeData = IX6Edge & {
  data: {
    [key: string]: any;
  };
  view?:{
    sourcePortSide: 'right' | 'left';
    targetPortSide: 'left' | 'right';
  }
};

type Group = [INodeComponent, INodePort, INodeEdge];

type ShapeComponent = [INodeComponent, INodePort, INodeEdge];

interface ITopState {
  [key: string]: any;
}

type INodeComponentEvent = 'change' | 'save' | 'remove';

export interface IInsideState {
  selectedCellId: string;
  selectedConfigJSON: IK6DataConfig | null;
  selectedConfigData: { [k: string]: any };
  cacheSelected: {
    configData: { [k: string]: any }; // 镜像版本
  },
  graph: {
    zoom: number,
  }
}

export function fallbackEditorDataToNormal(myJson: IK6DataConfig) {
  function task(properties: IK6DataConfig['properties'], obj: any) {
    properties.forEach(prop => {
      switch (prop.type) {
        case 'number':
          obj[prop.name] = undefined;
          break;
        case 'boolean':
          obj[prop.name] = false;
          break;
        case 'string':
          obj[prop.name] = '';
          break;
        case 'object':
          obj[prop.name] = {};
          task(prop.properties, obj[prop.name]);
          break;
        case 'array':
          {
            obj[prop.name] = [];
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

function generateNodeByConfig(k6Node: INodeComponent) {
  const data: any = fallbackEditorDataToNormal(k6Node.configJSON);

  const newNode = {
    id: Math.floor(((Math.random() * 10000))).toString(),
    shape: k6Node.shape,
    name: 'Page',
    data,
    x:30,
    y:30,
    edges: [],
  };

  return newNode;
}

class DataManager extends EventEmiter{
  nodes: IDataNode[] = [];
  nodeShapeComponentMap: Map<string, ShapeComponent> = new Map();
  data: ITopState | null = null;
  insideState:IInsideState = reactive({
    selectedCellId: '', // 包含节点和边
    selectedConfigJSON: null,
    selectedConfigData: null,
    cacheSelected: {
      dataConfig: null,
    },
    graph: {
      zoom: 1,
    },
  });
  // x6/index.jsx
  dmx6: any;
  constructor() {
    super();
    // @ts-ignore
    window.dm = this;
  }
  setX6(x6: any) {
    this.dmx6 = x6;
  }
  readState(obj: object) {
    this.data = reactive(obj);
  }
  readNodesData(nodes: IDataNode[]) {
    this.nodes = (nodes.map(n => ({
      ...n,
      data: n.data ? reactive(n.data) : n.data,
      edges: [],
    })));
  }
  readEdgesData(edges: IEdgeData[]) {
    this.nodes.forEach(node => {
      const id = node.id;
      edges.forEach(edge => {
        const cell = edge.source.cell || edge.source.entity;
        if (cell === id) {          
          node.edges.push({
            ...edge,
            data: reactive(edge.data || {}),
          });
        }
      });
    });
  }
  addNode() {
    // 先默认只支持一种
    if (1) {
      const nodeComponent: ShapeComponent = this.nodeShapeComponentMap.values().next().value;
      const n = generateNodeByConfig(nodeComponent[0]);
      const newNode = {
        ...n,
        data: reactive(n.data),
      };
      this.nodes.push(newNode);
      this.emit('addNode', newNode);
      this.notifyShapeComponent(n, null, 'change', newNode.data);
    }
  }
  addNewEdge(nodeId: string, edgeId: string) {
    const node = this.findNode(nodeId);
    node.edges.push({
      id: edgeId,
      data: reactive({}),
    });
  }
  findNode(id: string) {
    const n = this.nodes.find(n => n.id === id);
    return n ? {
      ...n,
    } : null;
  }
  findNodeAndEdge(id: string): [IDataNode?, IEdgeData?] {
    let edge: IEdgeData;
    const n = this.nodes.find(n => {      
      edge = n.edges.find(e => e.id === id);
      return !!edge || n.id === id;
    });
    return n ? [n, edge] : [];
  }
  readComponents(groups: Group[]) {
    groups.forEach(group => {
      const [NodeCpt, PortCpt, EdgeFunc] = group;

      this.nodeShapeComponentMap.set(NodeCpt.shape, [
        NodeCpt,
        PortCpt,
        EdgeFunc,
      ]);
    });
  }

  getAllShapeComponents(): ShapeComponent[] {
    return [
      ...this.nodeShapeComponentMap.values(),
    ];
  }
  
  getShapeComponentByNodeId(id: string): ShapeComponent {
    const { shape } = this.findNode(id);
    return this.getShapeComponent(shape);
  }

  getShapeComponent(shapeName: string): ShapeComponent {
    let sc = this.nodeShapeComponentMap.get(shapeName);
    if (!sc) {
      sc = this.nodeShapeComponentMap.values().next().value;
    }
    return sc;  
  }
  selectNode (id: string) {
    if (!id || this.insideState.selectedCellId === id) {
      Object.assign(this.insideState, {
        selectedConfigJSON: null,
        selectedConfigData: null,
        selectedCellId: '',
        cacheSelected: {
          configData: null
        }
      });
      return;
    }
    const node = this.findNode(id);
    const [nodeComponent] = this.getShapeComponent(node.shape);
    Object.assign(this.insideState, {
      selectedConfigJSON: nodeComponent.configJSON,
      selectedConfigData: node.data,
      selectedCellId: id,
      cacheSelected: {
        configData: cloneDeep(node.data),
      },
  });
  }
  selectEdge(id: string) {
    if (!id || this.insideState.selectedCellId === id) {
      Object.assign(this.insideState, {
        selectedConfigJSON: null,
        selectedConfigData: null,
        selectedCellId: '',
        cacheSelected: {
          configData: null,
        }
      });
      return;
    }

    const [node, edge] = this.findNodeAndEdge(id);
    if (node) {
      const [ _1, _2, edgeComponent ] = this.getShapeComponent(node.shape);
      Object.assign(this.insideState, {
        selectedConfigJSON: edgeComponent.configJSON,
        selectedConfigData: edge.data,
        selectedCellId: id,
        cacheSelected: {
          configData: cloneDeep(edge.data),
        },
      });
    }
  }
  triggerCurrentEvent(event: INodeComponentEvent, data: any) {
    this.triggerEvent(this.insideState.selectedCellId, event, data);      
  }

  notifyShapeComponent(node: IDataNode, edge: IEdgeData, event: INodeComponentEvent, data: IK6DataConfig) {
    const [nodeComponent, _, edgeComponent] = this.getShapeComponent(node.shape);

    if (edge) {
      const newEdgeConfig = edgeComponent(node, edge);
      const model = this.dmx6.Graph.updateEdge(edge, newEdgeConfig);
      Object.assign(edge, model, {
        data: edge.data,
      });
    }
    
    const oldConfigData = this.insideState.cacheSelected.configData;

    // 有edge，说明仅仅是针对边的修改
    if (edge) {
      switch (event) {
        case 'change':
          edgeComponent.onChange && edgeComponent.onChange(node, edge, data, oldConfigData);
          break;
        case 'save':
          edgeComponent.onSave && edgeComponent.onSave(node, edge, data, oldConfigData);
          break;
        }
    } else {
      switch (event) {
        case 'change':
          nodeComponent.onChange && nodeComponent.onChange(node, data, oldConfigData);
          break;
        case 'save':
          nodeComponent.onSave && nodeComponent.onSave(node, data, oldConfigData);
          break;
        }
    }
  }

  triggerEvent(cellId: string, event: INodeComponentEvent, data: any) {
    if (!cellId) {
      return;
    }
    const [node, edge] = this.findNodeAndEdge(cellId);

    if (node) {
      // @TODO: 更新节点的画布属性    
      const position = this.dmx6.Graph.getNodePosition(cellId);
      if (position) {
        Object.assign(node, {
          x: position.x,
          y: position.y,
        });
      }
    }
    this.notifyShapeComponent(node, edge, event, data);
  }
  removeCurrent() {
    const currentCellId = this.insideState.selectedCellId;
    const [node, edge] = this.findNodeAndEdge(currentCellId);
    const [nodeComponent, _, edgeComponent] = this.getShapeComponent(node.shape);

    if (edge) {
      const i = node.edges.indexOf(edge);
      if (i >= 0) {
        node.edges.splice(i, 1);
        edgeComponent && edgeComponent.onRemove(node, edge);
      }
    } else {
      const i = this.nodes.indexOf(node);
      if (i >= 0) {
        this.nodes.splice(i, 1);
        nodeComponent && nodeComponent.onRemove(node);
      }  
    }
    this.emit('remove', currentCellId);
    this.selectNode(null);
  }
  zoomIn() {
    this.insideState.graph.zoom += 0.2
    this.emit('zoom-in', 0.2);
  }
  zoomOut(){
    this.insideState.graph.zoom -= 0.2
    this.emit('zoom-out', 0.2);
  }
}

export default DataManager;


