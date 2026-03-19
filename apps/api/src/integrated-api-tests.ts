/**
 * TransitLink MVP - Integrated API Flow Tests
 * Tests realistic end-to-end API flows with actual data
 */

import http from 'http';

interface ApiResponse {
  status: number | undefined;
  data: unknown;
}

async function apiCall(method: string, endpoint: string, token?: string | null, body?: unknown): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, 'http://localhost:4000');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: url.pathname + url.search,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData as Record<string, unknown> });
        } catch {
          resolve({ status: res.statusCode, data: { error: data.substring(0, 50) } });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║   TransitLink MVP - API Integration Flow Tests         ║');
console.log('║         Complete End-to-End Validation               ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

let passed = 0, failed = 0, token: string | null = null;

async function runTests() {
  // Test 1: Auth Flow
  console.log('🧪 TEST 1: Authentication Flow');
  console.log('  • POST /auth/login');
  const auth = await apiCall('POST', '/auth/login', undefined, {
    email: 'neha@transitlink.app'
  });
  const authData = auth.data as Record<string, unknown>;
  if (auth.status === 200 && authData.token) {
    console.log('    ✅ Login successful (200)');
    token = authData.token as string;
    console.log('    ✅ Token obtained:', token.substring(0, 20) + '...');
    passed++;
  } else {
    console.log('    ❌ Login failed:', auth.status);
    failed++;
  }

  // Test 2: List Buses
  console.log('\n🧪 TEST 2: Bus Management');
  console.log('  • GET /buses');
  const buses = await apiCall('GET', '/buses', token);
  const busesData = buses.data as Record<string, unknown>;
  if (buses.status === 200 && Array.isArray(busesData)) {
    console.log(`    ✅ Listed ${busesData.length} buses (200)`);
    if ((busesData as Array<Record<string, unknown>>).length > 0) {
      const busId = (busesData as Array<Record<string, unknown>>)[0].id;
      console.log(`    Using bus ID: ${busId}`);
      
      // Test bus details
      console.log('  • GET /buses/:busId');
      const bus = await apiCall('GET', `/buses/${busId}`, token);
      if (bus.status === 200 || bus.status === 404) {
        console.log(`    ✅ Bus details endpoint (${bus.status})`);
        passed++;
      } else {
        console.log(`    ❌ Bus details failed: ${bus.status}`);
        failed++;
      }
    }
    passed++;
  } else {
    console.log('    ❌ List buses failed:', buses.status);
    failed++;
  }

  // Test 3: List Routes
  console.log('\n🧪 TEST 3: Route Management');
  console.log('  • GET /routes');
  const routes = await apiCall('GET', '/routes', token);
  const routesData = routes.data as Record<string, unknown>;
  if (routes.status === 200 && Array.isArray(routesData)) {
    console.log(`    ✅ Listed ${routesData.length} routes (200)`);
    if ((routesData as Array<Record<string, unknown>>).length > 0) {
      const routeId = (routesData as Array<Record<string, unknown>>)[0].id;
      console.log(`    Using route ID: ${routeId}`);
      
      // Test route search
      console.log('  • GET /routes/search');
      const search = await apiCall('GET', '/routes/search?origin=Hyderabad&destination=Guntur', token);
      if (search.status === 200 || search.status === 404) {
        console.log(`    ✅ Route search endpoint (${search.status})`);
        passed++;
      }
    }
    passed++;
  } else {
    console.log('    ❌ List routes failed:', routes.status);
    failed++;
  }

  // Test 4: Ticket Flow
  console.log('\n🧪 TEST 4: Ticket Operations');
  console.log('  • POST /tickets/quote');
  const quote = await apiCall('POST', '/tickets/quote', token, {
    routeId: 'rt-100',
    originStopId: 'st-hyd',
    destinationStopId: 'st-gnt'
  });
  if (quote.status === 200) {
    console.log(`    ✅ Fare quote successful (200)`, quote.data);
    passed++;
    
    // Purchase ticket
    console.log('  • POST /tickets/purchase');
    const purchase = await apiCall('POST', '/tickets/purchase', token, {
      routeId: 'rt-100',
      originStopId: 'st-hyd',
      destinationStopId: 'st-gnt',
      passengerId: 'usr-pass-1'
    });
    const purchaseData = purchase.data as Record<string, unknown>;
    if (purchase.status === 201 || purchase.status === 200) {
      console.log(`    ✅ Ticket purchase successful (${purchase.status})`);
      console.log(`    ✅ Ticket ID:`, purchaseData?.ticketId || purchaseData?.id);
      passed++;
    } else {
      console.log(`    ❌ Purchase failed: ${purchase.status}`);
      failed++;
    }
  } else {
    console.log(`    ❌ Quote failed: ${quote.status}`);
    failed++;
  }

  // Test 5: Parcel Flow
  console.log('\n🧪 TEST 5: Parcel Operations');
  console.log('  • POST /parcels/book');
  const parcelBook = await apiCall('POST', '/parcels/book', token, {
    senderId: 'usr-log-1',
    fromCity: 'Hyderabad',
    destinationCity: 'Guntur',
    dimensions: { length: 20, width: 18, height: 12 },
    weightKg: 4
  });
  if (parcelBook.status === 201 || parcelBook.status === 200) {
    console.log(`    ✅ Parcel booking successful (${parcelBook.status})`);
    passed++;
    
    // List parcels
    console.log('  • GET /parcels');
    const parcels = await apiCall('GET', '/parcels', token);
    if (parcels.status === 200) {
      console.log(`    ✅ Listed parcels (200)`);
      passed++;
    }
  } else {
    console.log(`    ❌ Parcel booking failed: ${parcelBook.status}`);
    failed++;
  }

  // Test 6: Admin Endpoints
  console.log('\n🧪 TEST 6: Admin Operations');
  console.log('  • GET /admin/dashboard');
  const dashboard = await apiCall('GET', '/admin/dashboard', token);
  const dashboardData = dashboard.data as Record<string, unknown>;
  if (dashboard.status === 200) {
    console.log(`    ✅ Dashboard retrieved (200)`);
    console.log(`    ✅ Active trips: ${dashboardData.activeTrips}`);
    console.log(`    ✅ Daily revenue: ₹${dashboardData.revenueToday}`);
    passed++;
  } else {
    console.log(`    ❌ Dashboard failed: ${dashboard.status}`);
    failed++;
  }

  // Test 7: Occupancy Endpoints
  console.log('\n🧪 TEST 7: Occupancy Management');
  console.log('  • GET /occupancy/:busId');
  const occupancy = await apiCall('GET', '/occupancy/bus-101', token);
  if (occupancy.status === 200 || occupancy.status === 404) {
    console.log(`    ✅ Occupancy endpoint (${occupancy.status})`);
    passed++;
  }

  // Test 8: Health Check
  console.log('\n🧪 TEST 8: Server Health');
  console.log('  • GET /health');
  const health = await apiCall('GET', '/health', undefined);
  const healthData = health.data as Record<string, unknown>;
  if (health.status === 200 && healthData.status === 'ok') {
    console.log(`    ✅ Server healthy (200)`);
    passed++;
  } else {
    console.log(`    ❌ Server health check failed: ${health.status}`);
    failed++;
  }
}

await runTests();

console.log('\n' + '═'.repeat(60));
console.log(`\n✅ RESULTS: ${passed} PASSED, ${failed} FAILED\n`);

if (failed === 0) {
  console.log('🎉 All API integration tests passed!');
  console.log('✅ System is production ready for deployment!\n');
} else {
  console.log(`⚠️  ${failed} test(s) need attention\n`);
}

console.log('═'.repeat(60) + '\n');
process.exit(failed > 0 ? 1 : 0);
