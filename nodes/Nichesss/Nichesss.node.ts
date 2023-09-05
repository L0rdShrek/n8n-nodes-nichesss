import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { contentPlansFields, contentPlansOperations } from './ContentPlansDescription';
import { documentsFields, documentsOperations } from './DocumentsDescription';
import { toolsFields, toolsOperations } from './ToolsDescription';
import { langaugesFields, langaugesOperations } from './LangaugesDescription';
import { generationsFields, generationsOperations } from './GenerationsDescription';

export class Nichesss implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Nichesss',
		name: 'Nichesss',
		icon: 'file:Nichesss.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Nichesss.com',
		defaults: {
			name: 'Nichesss',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'nichesssApi',
				required: false,
			},
		],
		requestDefaults: {
			baseURL: 'https://nichesss.com/api',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		/**
		 * In the properties array we have two mandatory options objects required
		 *
		 * [Resource & Operation]
		 *
		 * https://docs.n8n.io/integrations/creating-nodes/code/create-first-node/#resources-and-operations
		 *
		 * In our example, the operations are separated into their own file (HTTPVerbDescription.ts)
		 * to keep this class easy to read.
		 *
		 */
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Content Plan',
						value: 'contentPlans',
					},
					{
						name: 'Document',
						value: 'documents',
					},
					{
						name: 'Generation',
						value: 'generations',
					},
					{
						name: 'Language',
						value: 'languages',
					},
					{
						name: 'Tool',
						value: 'tools',
					},
				],
				default: 'contentPlans',
			},

			...contentPlansOperations,
			...contentPlansFields,

			...generationsOperations,
			...generationsFields,

			...langaugesOperations,
			...langaugesFields,

			...toolsOperations,
			...toolsFields,

			...documentsOperations,
			...documentsFields
		],
	};
}
