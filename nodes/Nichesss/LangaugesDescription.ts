import { INodeProperties } from 'n8n-workflow';

// When the resource `contentPlans` is selected, this `operation` parameter will be shown.
export const langaugesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,

		displayOptions: {
			show: {
				resource: ['languages'],
			},
		},
		options: [
			{
				name: 'List All Langauges',
				value: 'list-all-langauges',
				action: 'Lists all the languages',
				routing: {
					request: {
						method: 'GET',
						url: '/languages',
					},
				},
			}
		],
		default: 'list-all-langauges',
	},
];




export const langaugesFields: INodeProperties[] = [

];
