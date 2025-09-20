import { IDataObject, INodeProperties, NodeOperationError } from 'n8n-workflow';

export const createDocumentUsingTemplatePreSend = async function (this: any, requestOptions: IDataObject) {
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
				throw new NodeOperationError(this.getNode(), 'Content is not valid JSON.', { cause: error as Error });
			}
		}

		requestOptions.body = body;
		return requestOptions;
	}

	const templateId = this.getNodeParameter('templateId', itemIndex) as string;
	const body: IDataObject = { template_id: templateId };

	const templateFieldsParam = this.getNodeParameter('templateFields', itemIndex, {}) as IDataObject;
	const templateFields = Array.isArray(templateFieldsParam.field)
		? (templateFieldsParam.field as IDataObject[])
		: [];

	for (const field of templateFields) {
		const key = (field.key as string)?.trim();
		if (!key) continue;

		const valueType = (field.valueType as string) || 'string';
		const rawValue = field.value as string;

		let value: unknown = rawValue;
		if (valueType === 'number') {
			const parsed = Number(rawValue);
			if (Number.isNaN(parsed)) {
				throw new NodeOperationError(this.getNode(), `Field "${key}" must be a valid number.`);
			}
			value = parsed;
		} else if (valueType === 'boolean') {
			const normalized = String(rawValue).toLowerCase();
			if (!['true', 'false'].includes(normalized)) {
				throw new NodeOperationError(this.getNode(), `Field "${key}" must be either "true" or "false".`);
			}
			value = normalized === 'true';
		} else if (valueType === 'json') {
			try {
				value = JSON.parse(rawValue);
			} catch (error) {
				throw new NodeOperationError(this.getNode(), `Field "${key}" contains invalid JSON.`, { cause: error as Error });
			}
		}

		body[key] = value;
	}

	const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex, '') as string;
	if (webhookUrl) {
		body.webhook_url = webhookUrl;
	}

	const language = this.getNodeParameter('languageOptions', itemIndex, {}) as IDataObject;
	const languagePayload: IDataObject = {};
	if (language.id) languagePayload.id = language.id;
	if (language.formality) languagePayload.formality = language.formality;
	if (Object.keys(languagePayload).length) {
		body.language = languagePayload;
	}

	requestOptions.body = body;
	return requestOptions;
};

export const createDocumentUsingTemplatePostReceive = async function (this: any, items: IDataObject[]) {
	return items;
};

export const createDocumentUsingTemplateFields: INodeProperties[] = [
	{
		displayName: 'JSON Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: ['create-document-using-template'],
				resource: ['documents'],
			},
		},
		description: 'Whether to send the request body as raw JSON',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create-document-using-template'],
				resource: ['documents'],
				jsonParameters: [false],
			},
		},
		description: 'ID of the template; fetch available templates via List All Templates',
		placeholder: 'nSw3cz9E3',
	},
	{
		displayName: 'Template Fields',
		name: 'templateFields',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				operation: ['create-document-using-template'],
				resource: ['documents'],
				jsonParameters: [false],
			},
		},
		placeholder: 'Add Field',
		description: 'Add the variables required by the chosen template',
		options: [
			{
				name: 'field',
				displayName: 'Field',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						placeholder: 'title',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						placeholder: 'The Beauty of Jamaica',
					},
					{
						displayName: 'Value Type',
						name: 'valueType',
						type: 'options',
						options: [
							{
								name: 'String',
								value: 'string',
							},
							{
								name: 'Number',
								value: 'number',
							},
							{
								name: 'Boolean',
								value: 'boolean',
							},
							{
								name: 'JSON',
								value: 'json',
							},
						],
						default: 'string',
						description: 'Choose how the value should be serialized',
					},
				],
			},
		],
	},
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create-document-using-template'],
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
				operation: ['create-document-using-template'],
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
				operation: ['create-document-using-template'],
				resource: ['documents'],
				jsonParameters: [true],
			},
		},
		placeholder:
			'{"template_id":"nSw3cz9E3","title":"The Beauty of Jamaica","about":"The beautiful things Jamaica has to offer for tourists and locals.","TOPIC":"Swimming and other activities in Jamaica","OUTLINE_ITEM_1":"Jamaica\'s beaches","OUTLINE_ITEM_2":"Jamaica\'s nature trails","OUTLINE_ITEM_3":"Jamaica\'s waterfalls and hiking trails","webhook_url":"https://a-cool-webhook.com","language":{"ID":"deepl_PT-BR","formality":"more"}}',
	},
];
