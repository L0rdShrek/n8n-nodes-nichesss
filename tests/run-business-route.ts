import { createServer, IncomingMessage } from 'http';
import type { Server } from 'http';
import { AddressInfo } from 'net';
import { strict as assert } from 'assert';
import type { IDataObject } from 'n8n-workflow';

import { createDocumentUsingTemplatePreSend } from '../nodes/Nichesss/DocumentsTemplateDescription';
import { createDocumentFromTemplatePostReceive } from '../nodes/Nichesss/BusinessRoutesDescription';

const queueId = 'queue-test-123';

interface TestParameters extends IDataObject {
	resource: string;
	operation: string;
	jsonParameters: boolean;
	templateId: string;
	templateFields: IDataObject;
	languageOptions: IDataObject;
	waitForResult: boolean;
	pollInterval: number;
	maxAttempts: number;
	returnData: string;
}

interface CredentialData {
	token: string;
	domain: string;
}

const readJsonBody = async (req: IncomingMessage) => {
	const chunks: Buffer[] = [];
	for await (const chunk of req) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	}
	const raw = Buffer.concat(chunks).toString('utf8');
	return raw ? JSON.parse(raw) : {};
};

class PreSendContext {
	constructor(private readonly parameters: TestParameters) {}

	getItemIndex(): number {
		return 0;
	}

	getNodeParameter<T>(name: string, _itemIndex: number, defaultValue?: T): T {
		return (this.parameters[name] as T) ?? (defaultValue as T);
	}

	getNode() {
		return { name: 'NichesssBusinessRoutePreSend' };
	}
}

class PostReceiveContext extends PreSendContext {
	private pollCount = 0;

	constructor(parameters: TestParameters, private readonly credential: CredentialData) {
		super(parameters);
		this.helpers = {
			httpRequestWithAuthentication: async (credentialType: string, requestOptions: IDataObject) => {
				if (credentialType !== 'nichesssApi') {
					throw new Error(`Unexpected credential type ${credentialType}`);
				}

				const domain = this.credential.domain.replace(/\/$/, '');
				const urlPath = String(requestOptions.url ?? '');
				const url = `${domain}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
				const method = String(requestOptions.method ?? 'GET').toUpperCase();
				const headers: Record<string, string> = {
					Accept: 'application/json',
					Authorization: `Bearer ${this.credential.token}`,
					'Content-Type': 'application/json',
					...(requestOptions.headers as IDataObject),
				};

				const body = requestOptions.body ? JSON.stringify(requestOptions.body) : undefined;

				const response = await fetch(url, {
					headers,
					method,
					body,
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${await response.text()}`);
				}

				this.pollCount += 1;
				const text = await response.text();
				return text ? (JSON.parse(text) as IDataObject) : {};
			},
		};
	}

	helpers: {
		httpRequestWithAuthentication: (credentialType: string, requestOptions: IDataObject) => Promise<IDataObject>;
	};

	getPollCount(): number {
		return this.pollCount;
	}
}

const buildParameters = (): TestParameters => ({
	resource: 'businessRoutes',
	operation: 'create-document-from-template',
	jsonParameters: false,
	templateId: 'template_123',
	templateFields: {
		field: [
			{ key: 'title', value: 'The Beauty of Jamaica', valueType: 'string' },
			{ key: 'outline', value: '["intro", "body"]', valueType: 'json' },
		],
	},
	languageOptions: {
		id: 'deepl_PT-BR',
		formality: 'more',
	},
	waitForResult: true,
	pollInterval: 0.01,
	maxAttempts: 5,
	returnData: 'contentOnly',
});

const startMockServer = async () => {
	let baseUrl = '';
	let receivedBody: IDataObject | undefined;
	let lastAuthHeader: string | undefined;

	const server: Server = createServer(async (req, res) => {
		const { method = 'GET', url = '' } = req;
		if (method === 'POST' && url === '/documents/push-to-queue') {
			const body = await readJsonBody(req);
			receivedBody = body;
			lastAuthHeader = req.headers.authorization;
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(
				JSON.stringify({
					success: true,
					message: 'Queued',
					queue_id: queueId,
					queue_uri: `${baseUrl}/documents/queue/${queueId}`,
				}),
			);
			return;
		}

		if (method === 'GET' && url === `/documents/queue/${queueId}`) {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(
				JSON.stringify({
					success: true,
					content: [
						{
							command: 'Generated content block',
							after: 'Closing line',
						},
					],
				}),
			);
			return;
		}

		res.writeHead(404, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'not-found' }));
	});

	await new Promise<void>((resolve) => {
		server.listen(0, '127.0.0.1', () => resolve());
	});

	const address = server.address() as AddressInfo;
	baseUrl = `http://127.0.0.1:${address.port}`;

	return {
		server,
		baseUrl,
		getReceivedBody: () => receivedBody,
		getAuthHeader: () => lastAuthHeader,
	};
};

const run = async () => {
	const parameters = buildParameters();
	const { server, baseUrl, getReceivedBody, getAuthHeader } = await startMockServer();

	const credential: CredentialData = {
		token: 'test-token',
		domain: `${baseUrl}`,
	};

	try {
		const preSendContext = new PreSendContext(parameters);
		const requestOptions: IDataObject = {};
		await createDocumentUsingTemplatePreSend.call(preSendContext as any, requestOptions);

		assert.ok(requestOptions.body, 'Pre-send hook should populate a request body');
		const response = await fetch(`${baseUrl}/documents/push-to-queue`, {
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${credential.token}`,
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify(requestOptions.body),
		});
		const initialJson = (await response.json()) as IDataObject;

		const postReceiveContext = new PostReceiveContext(parameters, credential);
		const items = (await createDocumentFromTemplatePostReceive.call(postReceiveContext as any, [
			{ json: initialJson },
		])) as IDataObject[];

		assert.equal(getAuthHeader(), 'Bearer test-token', 'Authorization header should be forwarded');
		const postedBody = getReceivedBody();
		assert.ok(postedBody, 'Body should be sent to push-to-queue endpoint');
		assert.equal(postedBody?.template_id, parameters.templateId);
		assert.equal(postedBody?.title, 'The Beauty of Jamaica');
		assert.deepEqual(postedBody?.language, parameters.languageOptions);

		assert.equal(items.length, 1, 'Business route should emit a single item in contentOnly mode');
		const firstItem = items[0] as IDataObject;
		const json = (firstItem.json ?? {}) as IDataObject;
		assert.equal(json.command, 'Generated content block');
		assert.equal(postReceiveContext.getPollCount() >= 1, true, 'Queue endpoint should be polled at least once');

		console.log('✅ Business route test passed');
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => (error ? reject(error) : resolve()));
		});
	}
};

run().catch((error) => {
	console.error('❌ Business route test failed');
	console.error(error);
	process.exitCode = 1;
});
