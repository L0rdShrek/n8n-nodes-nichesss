import { INodeProperties } from 'n8n-workflow';

// When the resource `contentPlans` is selected, this `operation` parameter will be shown.
export const contentPlansOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,

		displayOptions: {
			show: {
				resource: ['contentPlans'],
			},
		},
		options: [
			{
				name: 'Add to Content Plan',
				value: 'add-to-content-plan',
				action: 'Generates new copy in an existing content plan',
				routing: {
					request: {
						method: 'POST',
						url: '=/content-plans/{{$parameter.content_plan_id}}/append',
						body: '={{$parameter.json_content}}',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								if (!requestOptions.body) requestOptions.body = {};

								const body = this.getNodeParameter('json_content') as string;

								requestOptions.body = body;

								return requestOptions;
							}
						]
					},
					output: {
						postReceive: [
							async function (this, items, responseData) {
								//console.log(items, responseData);
								return items;
							}
						]
					}
				},
		},
			{
				name: 'Create Content Plan',
				value: 'create-content-plan',
				action: 'Creates an empty content plan',
				routing: {
					request: {
						method: 'POST',
						url: '/content-plans',
						body: {
							name: '={{$parameter.name}}',
							description: '={{$parameter.description}}',
							keywords: '={{$parameter.keywords}}',
						},
					},
				},
			},
			{
				name: 'Delete Content in Plan',
				value: 'delete-in-content-plan',
				action: 'Deletes a piece of content from a content plan',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{"/content-plans/" + $parameter["content_plan_id"] + "/" + $parameter["content_id"]}}',
					},
				},
			},
			{
				name: 'Delete Content Plan',
				value: 'delete-content-plan',
				action: 'Deletes a content plan',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{ "/content-plans/" + $parameter["content_plan_id"] }}',
					},
				},
			},
			{
				name: 'Edit Content in Plan',
				value: 'edit-in-content-plan',
				action: 'Updates a piece of copy in a content plan',
				routing: {
					request: {
						method: 'PUT',
						url: '={{"/content-plans/" + $parameter["content_plan_id"] + "/" + $parameter["content_id"]}}',
						body: {
							line1: '={{$parameter.line1}}',
							line2: '={{$parameter.line2}}',
						},
					},
				},
			},
			{
				name: 'Get Content Plan Content',
				value: 'get-content-plan',
				action: 'Fetches all the content in a content plan',
				routing: {
					request: {
						method: 'GET',
						url: '={{ "/content-plans/" + $parameter["content_plan_id"] }}',
					},
				},
			},
			{
				name: 'Get Queued Content Plan Item',
				value: 'get-queued-content-plan-item',
				action: 'Polls the queue for a completion',
				routing: {
					request: {
						method: 'GET',
						url: '={{ "/content-plans/" + $parameter["queue_id"] }}',
					},
				},
			},
			{
				name: 'List Content Plans',
				value: 'content-plans',
				action: 'Fetches all the content plans',
				routing: {
					request: {
						method: 'GET',
						url: '/content-plans',
						qs: {
							p: '={{$parameter.page}}',
						},
					},
				},
			},
		],
		default: 'content-plans',
	},
];

export const contentPlansFields: INodeProperties[] = [
	{
		displayName: 'Page',
		name: 'page',
		required: true,
		type: 'string',
		default: '1',
		displayOptions: {
			show: {
				operation: ['content-plans'],
				resource: ['contentPlans'],
			},
		},
		description:
			'The query parameters for this endpoint control what page of content plans you want to see',
		placeholder: '1',
	},
	{
		displayName: 'Content Plan ID',
		name: 'content_plan_id',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [
					'get-content-plan',
					'edit-in-content-plan',
					'add-to-content-plan',
					'delete-content-plan',
					'delete-in-content-plan',
				],
				resource: ['contentPlans'],
			},
		},
		description: '&lt;CONTENT_PLAN_ID&gt;',
		placeholder: 'yxz',
	},
	{
		displayName: 'Content ID',
		name: 'content_id',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['edit-in-content-plan', 'delete-in-content-plan'],
				resource: ['contentPlans'],
			},
		},
		description: '&lt;CONTENT_ID&gt;',
		placeholder: 'yxz',
	},

	{
		displayName: 'Name',
		name: 'name',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create-content-plan'],
				resource: ['contentPlans'],
			},
		},
		description: 'Name of Content Plan',
		placeholder: 'Awesome Content Ideas',
	},

	{
		displayName: 'QUEUE ID',
		name: 'queue_id',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['get-queued-content-plan-item'],
				resource: ['contentPlans'],
			},
		},
		description: '&lt;QUEUE_ID&gt;',
		placeholder: 'yxz',
	},
	{
		displayName: 'Description',
		name: 'description',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create-content-plan'],
				resource: ['contentPlans'],
			},
		},
		description: 'Description of Content Plan',
		placeholder: 'A few ideas for content to put on the blog.',
	},
	{
		displayName: 'Keywords',
		name: 'keywords',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create-content-plan'],
				resource: ['contentPlans'],
			},
		},
		placeholder: 'travel, paris, europe',
	},
	{
		displayName: 'Content',
		name: 'json_content',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['add-to-content-plan'],
				resource: ['contentPlans'],
			},
		},
		placeholder:
			'{"tool_id":"ZVJReZgVn","post_title":"Whats the cheapest way to get to Brazil?","tone":"helpful and professional","webhook_url":"https://a-cool-webhook.com","language":{"ID":"deepl_PT-BR","formality":"more"}}',
	},
	{
		displayName: 'Line 1',
		name: 'line1',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['edit-in-content-plan'],
				resource: ['contentPlans'],
			},
		},
		placeholder: "I'm changing the copy now",
	},

	{
		displayName: 'Line 2',
		name: 'line2',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['edit-in-content-plan'],
				resource: ['contentPlans'],
			},
		},
		placeholder: "It's so easy!",
	},
];
