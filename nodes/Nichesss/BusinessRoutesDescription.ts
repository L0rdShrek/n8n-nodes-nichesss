import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-core';

import { createDocumentUsingTemplatePreSend } from './DocumentsTemplateDescription';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const businessRoutesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['businessRoutes'],
			},
		},
		options: [
			{
				name: 'Create Document From Template',
				value: 'create-document-from-template',
				action: 'Creates a document using a template and optionally waits for the result',
				routing: {
					request: {
						method: 'POST',
						url: '/documents/push-to-queue',
					},
					send: {
						preSend: [createDocumentUsingTemplatePreSend],
					},
					output: {
						postReceive: [createDocumentFromTemplatePostReceive],
					},
				},
			},
		],
		default: 'create-document-from-template',
	},
];

export const businessRoutesFields: INodeProperties[] = [
	{
		displayName: 'JSON Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
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
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
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
		default: {},
		displayOptions: {
			show: {
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
				jsonParameters: [false],
			},
		},
		typeOptions: {
			multipleValues: true,
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
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
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
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
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
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
				jsonParameters: [true],
			},
		},
		placeholder:
			'{"template_id":"nSw3cz9E3","title":"The Beauty of Jamaica","about":"The beautiful things Jamaica has to offer for tourists and locals.","TOPIC":"Swimming and other activities in Jamaica","OUTLINE_ITEM_1":"Jamaica\'s beaches","OUTLINE_ITEM_2":"Jamaica\'s nature trails","OUTLINE_ITEM_3":"Jamaica\'s waterfalls and hiking trails","webhook_url":"https://a-cool-webhook.com","language":{"id":"deepl_PT-BR","formality":"more"}}',
	},
	{
		displayName: 'Wait For Result',
		name: 'waitForResult',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
			},
		},
		description: 'Whether to poll the queue until the document is ready',
	},
	{
		displayName: 'Poll Interval',
		name: 'pollInterval',
		type: 'number',
		default: 2,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
				waitForResult: [true],
			},
		},
		description: 'Seconds to wait between queue polls',
	},
	{
		displayName: 'Max Poll Attempts',
		name: 'maxAttempts',
		type: 'number',
		default: 30,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
				waitForResult: [true],
			},
		},
		description: 'Maximum number of polls before giving up',
	},
	{
		displayName: 'Return',
		name: 'returnData',
		type: 'options',
		options: [
			{
				name: 'Queue Response',
				value: 'queue',
				description: 'Return the queue response once it succeeds',
			},
			{
				name: 'Generated Content Only',
				value: 'contentOnly',
				description: 'Return just the generated content entries',
			},
		],
		default: 'queue',
		displayOptions: {
			show: {
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
				waitForResult: [true],
			},
		},
	},
	{
		displayName: 'Include Initial Response',
		name: 'includeInitialResponse',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: ['create-document-from-template'],
				resource: ['businessRoutes'],
				waitForResult: [true],
				returnData: ['queue'],
			},
		},
		description: 'Whether to include the initial push-to-queue response in the output',
	},
];

export const createDocumentFromTemplatePostReceive = async function (
	this: IExecuteFunctions,
	items: IDataObject[],
) {
	const results: IDataObject[] = [];

	for (let index = 0; index < items.length; index++) {
		const item = items[index] ?? {};
		const response = (item.json ?? {}) as IDataObject;
		const waitForResult = this.getNodeParameter('waitForResult', index, true) as boolean;

		if (!waitForResult) {
			results.push(item);
			continue;
		}

		const queueId = (response.queue_id ?? '') as string;
		if (!queueId) {
			throw new NodeOperationError(
				this.getNode(),
				'Nichesss did not return a queue_id. Unable to follow up the request.',
				{ itemIndex: index },
			);
		}

		const pollInterval = this.getNodeParameter('pollInterval', index, 2) as number;
		const maxAttempts = this.getNodeParameter('maxAttempts', index, 30) as number;
		const returnMode = this.getNodeParameter('returnData', index, 'queue') as string;
		const includeInitialResponse = this.getNodeParameter('includeInitialResponse', index, false) as boolean;

		let attempt = 0;
		let queueResponse: IDataObject | undefined;

		const requestOptions = {
			method: 'GET',
			url: `/documents/queue/${queueId}`,
		};

		do {
			queueResponse = (await this.helpers.httpRequestWithAuthentication.call(
				this,
				'nichesssApi',
				requestOptions,
			)) as IDataObject;
			attempt += 1;

			const success = queueResponse?.success === true;
			const hasContent = queueResponse?.content !== undefined && queueResponse?.content !== null;

			if (success && (returnMode !== 'contentOnly' || hasContent)) {
				break;
			}

			if (attempt >= maxAttempts) {
				break;
			}

			await wait(pollInterval * 1000);
		} while (attempt < maxAttempts);

		if (!queueResponse || queueResponse.success !== true) {
			throw new NodeOperationError(
				this.getNode(),
				'Nichesss queue did not return a successful response within the configured limit.',
				{ itemIndex: index },
			);
		}

		if (returnMode === 'contentOnly') {
			const content = queueResponse.content;
			if (content === undefined || content === null) {
				throw new NodeOperationError(
					this.getNode(),
					'Nichesss queue response did not include any content yet.',
					{ itemIndex: index },
				);
			}

			if (Array.isArray(content)) {
				for (const entry of content) {
					results.push({ json: (entry ?? {}) as IDataObject });
				}
			} else {
				results.push({ json: { content } });
			}
			continue;
		}

		const result: IDataObject = {
			...queueResponse,
			queue_id: queueId,
		};

		if (includeInitialResponse) {
			result.initialResponse = response;
		}

		results.push({ json: result });
	}

	return results;
};

