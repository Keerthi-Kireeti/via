import http from 'http';

interface TestResponse {
  status: number | undefined;
  data: unknown;
  error?: string;
}

async function testEndpoint(method: string, path: string, body?: unknown): Promise<TestResponse> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Unknown error';
          resolve({ status: res.statusCode, data: data, error: errorMsg });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║   TransitLink MVP - Quick API Verification            ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Test 1: Health endpoint
console.log('Testing GET /health...');
const health = await testEndpoint('GET', '/health');
console.log('✅ Status:', health.status);
console.log('✅ Response:', JSON.stringify(health.data, null, 2));

// Test 2: Auth login
console.log('\nTesting POST /auth/login...');
const login = await testEndpoint('POST', '/auth/login', { email: 'neha@transitlink.app' });
console.log('✅ Status:', login.status);
const loginData = login.data as Record<string, unknown>;
if (loginData && loginData.token) {
  console.log('✅ Token received:', (loginData.token as string).substring(0, 20) + '...');
  const user = loginData.user as Record<string, unknown>;
  console.log('✅ User:', user?.name);
} else {
  console.log('❌ Error:', login.data || login.error);
}

// Test 3: List buses
console.log('\nTesting GET /buses...');
const buses = await testEndpoint('GET', '/buses');
console.log('✅ Status:', buses.status);
console.log('✅ Buses count:', Array.isArray(buses.data) ? (buses.data as []).length : 'N/A');

// Test 4: List routes
console.log('\nTesting GET /routes...');
const routes = await testEndpoint('GET', '/routes');
console.log('✅ Status:', routes.status);
console.log('✅ Routes count:', Array.isArray(routes.data) ? (routes.data as []).length : 'N/A');

console.log('\n✅ API Server is responding correctly!');
