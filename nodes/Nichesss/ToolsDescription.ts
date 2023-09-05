import { INodeProperties } from 'n8n-workflow';

// When the resource `contentPlans` is selected, this `operation` parameter will be shown.
export const toolsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,

		displayOptions: {
			show: {
				resource: ['tools'],
			},
		},
		options: [
			{
				name: 'List All Tools',
				value: 'list-all-tools',
				action: 'Lists all the tools you can use',
				routing: {
					request: {
						method: 'GET',
						url: '/tools',
					},
				},
			},
			{
				name: 'Get One Tool',
				value: 'get-one-tool',
				action: 'Gets information for a tool',
				routing: {
					request: {
						method: 'GET',
						url: '={{ "/tools/" + $parameter["tool_id"] }}'
					},
				},
			}

		],
		default: 'list-all-tools',
	},
];




export const toolsFields: INodeProperties[] = [
	{
		displayName: 'Tool ID',
		name: 'tool_id',
		required: true,
		type: 'string',
		default: '1NPiQNf4e',
		displayOptions: {
			show: {
				operation: ['get-one-tool'],
				resource: ['tools'],
			},
		},
		placeholder: 'LT0zIlJJk',
	}

];
