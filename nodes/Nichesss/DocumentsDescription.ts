import { INodeProperties } from 'n8n-workflow';

// When the resource `documents` is selected, this `operation` parameter will be shown.
export const documentsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,

		displayOptions: {
			show: {
				resource: ['documents'],
			},
		},
		options: [
			{
				name: 'Create Blank Document',
				value: 'create-blank-document',
				action: 'Creates an empty document',
				routing: {
					request: {
						method: 'POST',
						url: '=/documents',
						body: {
							name: '={{$parameter.name}}',
							about: '={{$parameter.about}}',
						},
					},
				},
			},
			{
				name: 'Edit Document',
				value: 'edit-document',
				action: 'Updates the text in a document',
				routing: {
					request: {
						method: 'PUT',
						url: '={{ "/documents/" + $parameter["document_id"] }}',
						body: {
							text: '={{$parameter.text}}',
						},
					},
				},
			},
			{
				name: 'List All Documents',
				value: 'list-all-documents',
				action: 'Lists all the documents',
				routing: {
					request: {
						method: 'GET',
						url: '=/documents',
						qs: {
							p: '={{$parameter.page}}',
						},
					},
				},
			},
			{
				name: 'List All Templates',
				value: 'list-all-templates',
				action: 'Lists all the document templates',
				routing: {
					request: {
						method: 'GET',
						url: '=/documents/templates',
						qs: {
							p: '={{$parameter.page}}',
						},
					},
				},
			},
			{
				name: 'View Document',
				value: 'view-document',
				action: 'Returns the content in one document',
				routing: {
					request: {
						method: 'GET',
						url: '={{ "/documents/" + $parameter["document_id"] }}',
					},
				},
			},
			{
				name: 'Create Document Using Template',
				value: 'create-document-using-template',
				action: 'Creates a document using a template',
				routing: {
					request: {
						method: 'POST',
						url: 'documents/push-to-queue',
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
				name: 'Add to Document',
				value: 'add-to-document',
				action: 'Adds text to a document',
				routing: {
					request: {
						method: 'POST',
						url: '=/documents/{{$parameter.document_id}}/append',
						body: {
							command: '={{$parameter.command}}'
						},
					},
				},
		},



		{
			name: 'Get Queued Document Addition',
			value: 'get-queued-document-addition',
			action: 'Polls the queue for a document addition',
			routing: {
				request: {
					method: 'GET',
					url: '={{ "/documents/queue/" + $parameter["queue_id"] }}',
				},
			},
		},
		{
			name: 'Delete Document',
			value: 'delete-document',
			action: 'Deletes a document or template',
			routing: {
				request: {
					method: 'DELETE',
					url: '={{ "/documents/" + $parameter["document_id"] }}',
				},
			},
		},
		],
		default: 'list-all-documents',
	},
];

export const documentsFields: INodeProperties[] = [
	{
		displayName: 'Page',
		name: 'page',
		required: true,
		type: 'string',
		default: '1',
		displayOptions: {
			show: {
				operation: ['list-all-documents', 'list-all-templates'],
				resource: ['documents'],
			},
		},
		description:
			'The query parameters for this endpoint control what page of documents you want to see',
		placeholder: '1',
	},
	{
		displayName: 'DOCUMENT ID',
		name: 'document_id',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['view-document', 'edit-document', 'delete-document', 'add-to-document'],
				resource: ['documents'],
			},
		},
		description: '&lt;DOCUMENTS_ID&gt;',
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
				operation: ['create-blank-document'],
				resource: ['documents'],
			},
		},
		description: 'Name of document',
		placeholder: 'Going to the Movies',
	},
	{
		displayName: 'About',
		name: 'about',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create-blank-document'],
				resource: ['documents'],
			},
		},
		description: "Description of the document; what it's about",
		placeholder: 'Everything you need to know about going to the movies in 2023',
	},
	{
		displayName: 'Text',
		name: 'text',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['edit-document'],
				resource: ['documents'],
			},
		},
		description: "Document text",
		placeholder: 'This will override the document and become the entire text of the document. Try it out and see what happens!',
	},
	{
		displayName: 'Content',
		name: 'json_content',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create-document-using-template'],
				resource: ['documents'],
			},
		},
		placeholder: '{"template_id":"nSw3cz9E3","title":"The Beauty of Jamaica","about":"The beautiful things Jamaica has to offer for tourists and locals.","TOPIC":"Swimming and other activities in Jamaica","OUTLINE_ITEM_1":"Jamaica\'s beaches","OUTLINE_ITEM_2":"Jamaica\'s nature trails","OUTLINE_ITEM_3":"Jamaica\'s waterfalls and hiking trails","webhook_url":"https://a-cool-webhook.com","language":{"ID":"deepl_PT-BR","formality":"more"}}',
	},
	{
		displayName: 'QUEUE ID',
		name: 'queue_id',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['get-queued-document-addition'],
				resource: ['documents'],
			},
		},
		description: '&lt;QUEUE_ID&gt;',
		placeholder: 'yxz',
	},



	{
		displayName: 'Command',
		name: 'command',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['add-to-document'],
				resource: ['documents'],
			},
		},
		description: 'Command to execute',
		placeholder: '[Billy\'s parents spoke with him and told him never to leave the house without permission again. | storyteller]',
	},

];
