import { INodeProperties } from 'n8n-workflow';

// When the resource `contentPlans` is selected, this `operation` parameter will be shown.
export const generationsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,

		displayOptions: {
			show: {
				resource: ['generations'],
			},
		},
		options: [
			{
				name: 'Get Generations Left',
				value: 'get-generations-left',
				action: 'Returns how many generations left',
				routing: {
					request: {
						method: 'GET',
						url: '/generations',
					},
				},
			}
		],
		default: 'get-generations-left',
	},
];




export const generationsFields: INodeProperties[] = [

];
