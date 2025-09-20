import { IDataObject, INodeProperties, NodeOperationError } from 'n8n-workflow';

export const addToContentPlanPreSend = async function (this: any, requestOptions: IDataObject) {
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

	const toolId = this.getNodeParameter('toolId', itemIndex) as string;
	const body: IDataObject = { tool_id: toolId };

	const toolFieldsParam = this.getNodeParameter('toolFields', itemIndex, {}) as IDataObject;
	const toolFields = Array.isArray(toolFieldsParam.field)
		? (toolFieldsParam.field as IDataObject[])
		: [];

	for (const field of toolFields) {
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

export const addToContentPlanPostReceive = async function (this: any, items: IDataObject[]) {
	return items;
};

export const addToContentPlanFields: INodeProperties[] = [
	{
		displayName: 'JSON Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: ['add-to-content-plan'],
				resource: ['contentPlans'],
			},
		},
		description: 'Whether to send the request body as raw JSON',
	},
	{
		displayName: 'Tool ID',
		name: 'toolId',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['add-to-content-plan'],
				resource: ['contentPlans'],
				jsonParameters: [false],
			},
		},
		description: 'ID of the tool to run within the content plan',
		placeholder: 'ZVJReZgVn',
	},
	{
		displayName: 'Tool Fields',
		name: 'toolFields',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				operation: ['add-to-content-plan'],
				resource: ['contentPlans'],
				jsonParameters: [false],
			},
		},
		placeholder: 'Add Field',
		description:
			'Add the tool-specific inputs (for example title, tone or outline entries)',
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
						placeholder: 'post_title',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						placeholder: 'Whats the cheapest way to get to Brazil?',
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
						description: 'Choose how the value should be sent to the API',
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
				operation: ['add-to-content-plan'],
				resource: ['contentPlans'],
				jsonParameters: [false],
			},
		},
		description: 'Optional webhook that receives the generated copy',
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
				operation: ['add-to-content-plan'],
				resource: ['contentPlans'],
				jsonParameters: [false],
			},
		},
		description: 'Override the default language for the generated output',
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
				operation: ['add-to-content-plan'],
				resource: ['contentPlans'],
				jsonParameters: [true],
			},
		},
		placeholder:
			'{"tool_id":"ZVJReZgVn","post_title":"Whats the cheapest way to get to Brazil?","tone":"helpful and professional","webhook_url":"https://a-cool-webhook.com","language":{"ID":"deepl_PT-BR","formality":"more"}}',
	},
];
