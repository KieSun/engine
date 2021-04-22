/** @jsx createElement */
import { createElement, render, reactive, atom } from 'axii'
import Tree from '../src/tree/Tree.jsx'

const data = reactive([
	{
		title: 'title1',
		key: 'title1',
		children: [
			{
				title: 'sub1',
				key: 'sub1',
				children : [{
					title: 'sub1 of sub1'
				}]
			}
		]
	}, {
		title: 'title2',
		key: 'title2',
		children: [{
			title: 'sub1 of title2',
			key: 'sub1 of title2'
		}]
	}, {
		title: 'title3',
		key: 'title3',
	}
])

const activeKey = atom('sub1')



render(<Tree data={data} activeKey={activeKey}/>, document.getElementById('root'))
