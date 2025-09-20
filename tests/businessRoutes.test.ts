import { NodeOperationError } from 'n8n-workflow';

import { createDocumentFromTemplatePostReceive } from '../nodes/Nichesss/BusinessRoutesDescription';

interface ParameterMap {
	[key: string]: unknown;
}

const createContext = (parameters: ParameterMap, queueResponses: unknown[]) => {
	let pollIndex = 0;

	const context = {
		getNodeParameter: jest.fn((name: string) => parameters[name]),
		helpers: {
			httpRequestWithAuthentication: jest.fn(async () => {
				if (pollIndex >= queueResponses.length) {
					throw new Error('Unexpected poll');
				}
				const response = queueResponses[pollIndex];
				pollIndex += 1;
				return response as any;
			}),
		},
		getNode: () => ({ name: 'NichesssBusinessRouteTest' }),
	} as any;

	return { context, pollIndexRef: () => pollIndex };
};

describe('BusinessRoutesDescription.createDocumentFromTemplatePostReceive', () => {
	test('returns generated content when queue resolves', async () => {
		const queueResponses = [
			{ success: true, content: [{ command: 'Story part', after: 'END' }] },
		];
		const params: ParameterMap = {
			waitForResult: true,
			pollInterval: 0,
			maxAttempts: 1,
			returnData: 'contentOnly',
		};
		const { context } = createContext(params, queueResponses);

		const items = await createDocumentFromTemplatePostReceive.call(context, [
			{ json: { queue_id: 'abc123' } },
		]);

		expect(items).toHaveLength(1);
		expect(items[0].json).toEqual({ command: 'Story part', after: 'END' });
	});

	test('passes through initial item when waitForResult is disabled', async () => {
		const params: ParameterMap = { waitForResult: false };
		const { context, pollIndexRef } = createContext(params, []);

		const initialItem = { json: { queue_id: 'xyz' } };
		const items = await createDocumentFromTemplatePostReceive.call(context, [initialItem]);

		expect(items).toEqual([initialItem]);
		expect(pollIndexRef()).toBe(0);
	});

	test('throws when queue id is missing', async () => {
		const params: ParameterMap = { waitForResult: true };
		const { context } = createContext(params, []);

		await expect(
			createDocumentFromTemplatePostReceive.call(context, [{ json: {} }]),
		).rejects.toBeInstanceOf(NodeOperationError);
	});

	test('throws when queue never returns success', async () => {
		const queueResponses = [{ success: false }];
		const params: ParameterMap = {
			waitForResult: true,
			pollInterval: 0,
			maxAttempts: 1,
			returnData: 'queue',
		};
		const { context } = createContext(params, queueResponses);

		await expect(
			createDocumentFromTemplatePostReceive.call(context, [
				{ json: { queue_id: 'abc' } },
			]),
		).rejects.toBeInstanceOf(NodeOperationError);
	});
});
