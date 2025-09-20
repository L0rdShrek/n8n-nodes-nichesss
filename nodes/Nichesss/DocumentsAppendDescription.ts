import { IDataObject, INodeProperties, NodeOperationError } from 'n8n-workflow';

export const appendToDocumentPreSend = async function (this: any, requestOptions: IDataObject) {
	const itemIndex = this.getItemIndex();
	const jsonParameters = this.getNodeParameter('jsonParameters', itemIndex, false) as boolean;

	if (jsonParameters) {
		let body = this.getNodeParameter('json_content', itemIndex) as IDataObject | string;

		if (typeof body === 'string') {
			if (!body.trim()) {
				throw new NodeOperationError(this.getNode(), 'Content must be provided when using JSON parameters.');
			}

			try {
				body = JSON.parse(body);
			} catch (error) {
				throw new NodeOperationError(this.getNode(), 'Content is not valid JSON.');
			}
		}

		requestOptions.body = body;
		return requestOptions;
	}

	const command = this.getNodeParameter('command', itemIndex) as string;
	const body: IDataObject = { command };

	const before = this.getNodeParameter('before', itemIndex, '') as string;
	if (before) body.before = before;

	const after = this.getNodeParameter('after', itemIndex, '') as string;
	if (after) body.after = after;

	const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex, '') as string;
	if (webhookUrl) body.webhook_url = webhookUrl;

	const language = this.getNodeParameter('languageOptions', itemIndex, {}) as IDataObject;
	const languagePayload: IDataObject = {};
	if (language.id) languagePayload.id = language.id;
	if (language.formality) languagePayload.formality = language.formality;
	if (Object.keys(languagePayload).length) body.language = languagePayload;

	requestOptions.body = body;
	return requestOptions;
};

export const appendToDocumentFields: INodeProperties[] = [
	{
		displayName: 'JSON Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: ['add-to-document'],
				resource: ['documents'],
			},
		},
		description: 'Whether to send the request body as raw JSON',
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
				jsonParameters: [false],
			},
		},
		description: 'Command to execute',
		placeholder: '[Billy\'s parents spoke with him and told him never to leave the house without permission again. | storyteller]',
	},
	{
		displayName: 'Before',
		name: 'before',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['add-to-document'],
				resource: ['documents'],
				jsonParameters: [false],
			},
		},
		description: 'Optional text to insert before the generated output',
		placeholder: "Billy felt really bad about running away from home.",
	},
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['add-to-document'],
				resource: ['documents'],
				jsonParameters: [false],
			},
		},
		description: 'Optional text to append after the generated output',
		placeholder: 'Billy finally learned his lesson.',
	},
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['add-to-document'],
				resource: ['documents'],
				jsonParameters: [false],
			},
		},
		description: 'Optional webhook that receives the generated text',
		placeholder: 'https://a-cool-webhook.com',
	},
	{
		displayName: 'Language',
		name: 'languageOptions',
		type: 'collection',
		placeholder: 'Add Language',
		default: {},
		displayOptions: {
			show: {
				operation: ['add-to-document'],
				resource: ['documents'],
				jsonParameters: [false],
			},
		},
		description: 'Override language and formality for the generated text',
		options: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				placeholder: 'deepl_PT-BR',
			},
			{
				displayName: 'Formality',
				name: 'formality',
				type: 'string',
				default: '',
				placeholder: 'more',
			},
		],
	},
	{
		displayName: 'Content (JSON)',
		name: 'json_content',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['add-to-document'],
				resource: ['documents'],
				jsonParameters: [true],
			},
		},
		placeholder:
			'{"command":"[Billy\'s parents spoke with him and told him never to leave the house without permission again. | storyteller]","before":"Billy felt really bad about running away from home.","after":"Billy finally learned his lesson.","language":{"id":"deepl_PT-BR","formality":"more"}}',
	},
];
