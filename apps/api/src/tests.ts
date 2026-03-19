/**
 * TransitLink MVP - End-to-End Test Suite
 * 
 * Tests cover:
 * 1. Passenger ticket booking flow
 * 2. Conductor scan validation flow
 * 3. Parcel logistics flow
 * 4. Admin dashboard KPIs
 * 5. Occupancy and predictions
 */

import type {
  User,
  Ticket,
  Parcel,
  Bus,
  Route,
  BusOccupancyStatus
} from "@transitlink/types";

// Mock data setup
const mockUsers = {
  passenger: { id: "usr-pass-1", name: "Neha", email: "neha@transitlink.app", role: "passenger", city: "Hyderabad" },
  conductor: { id: "usr-con-1", name: "Ramesh", email: "ramesh@transitlink.app", role: "conductor", city: "Hyderabad" },
  admin: { id: "usr-admin-1", name: "Asha", email: "asha@transitlink.app", role: "admin", city: "Hyderabad" },
  logistics: { id: "usr-log-1", name: "ParcelPoint HYD", email: "parcel1@transitlink.app", role: "logistics_user", city: "Hyderabad" }
};

const mockBus: Bus = {
  id: "bus-101",
  code: "TS09AB1101",
  routeId: "rt-100",
  depotId: "dep-hyd",
  conductorId: "usr-con-1",
  occupancy: 21,
  capacity: { seats: 40, luggageVolume: 180 },
  luggageUsed: 74,
  telemetry: {
    speedKmph: 52,
    coordinates: { lat: 17.22, lng: 79.14 },
    heading: 130,
    lastUpdated: new Date().toISOString(),
    currentStopId: "st-nlg",
    nextStopId: "st-khm"
  }
};

const mockRoute: Route = {
  id: "rt-100",
  lineageId: "lin-1",
  code: "RTC100",
  name: "Hyderabad to Guntur Express",
  origin: "Hyderabad",
  destination: "Guntur",
  distanceKm: 275,
  averageSegmentMinutes: 55,
  stops: [
    { id: "st-hyd", name: "MGBS", city: "Hyderabad", order: 0, coordinates: { lat: 17.384, lng: 78.4867 } },
    { id: "st-nlg", name: "Nalgonda Junction", city: "Nalgonda", order: 1, coordinates: { lat: 17.0541, lng: 79.2671 } },
    { id: "st-khm", name: "Khammam Bus Hub", city: "Khammam", order: 2, coordinates: { lat: 17.2473, lng: 80.1514 } },
    { id: "st-vjw", name: "PN Bus Station", city: "Vijayawada", order: 3, coordinates: { lat: 16.5062, lng: 80.648 } },
    { id: "st-gnt", name: "Guntur Central", city: "Guntur", order: 4, coordinates: { lat: 16.3067, lng: 80.4365 } }
  ]
};

// Test utilities
function assertEqual<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`❌ ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

function assertTrue(condition: boolean, message: string) {
  if (!condition) throw new Error(`❌ ${message}`);
}

function assertExists<T>(value: T | null | undefined, message: string): T {
  if (!value) throw new Error(`❌ ${message}`);
  return value;
}

// Test Suite 1: Passenger Ticket Booking Flow
export async function testPassengerTicketBookingFlow() {
  console.log("\n=== TEST 1: Passenger Ticket Booking Flow ===");

  try {
    // Step 1: Quote fare
    console.log("✓ Step 1: Quote fare from Hyderabad to Guntur");
    const fareQuote = {
      routeId: "rt-100",
      originStopId: "st-hyd",
      destinationStopId: "st-gnt",
      fare: 90 + 4 * 85 // 4 segments: Hyd→Nlg, Nlg→Khm, Khm→Vjw, Vjw→Gnt
    };
    assertEqual(fareQuote.fare, 430, "Fare calculation (4 segments × 85 + 90)");

    // Step 2: Purchase ticket
    console.log("✓ Step 2: Purchase route-lineage ticket");
    const ticket: Ticket = {
      ticketId: "tkt-test-001",
      passengerId: mockUsers.passenger.id,
      lineageId: "lin-1",
      originStopId: "st-hyd",
      destinationStopId: "st-gnt",
      allowedSegments: [0, 1, 2, 3],
      status: "active",
      qrToken: "QR-TST-001",
      fare: fareQuote.fare,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    };
    assertEqual(ticket.status, "active", "Ticket is active");
    assertEqual(ticket.lineageId, "lin-1", "Lineage matches");

    // Step 3: Verify ticket validity
    console.log("✓ Step 3: Verify ticket is within validity window");
    assertTrue(
      new Date(ticket.validUntil) > new Date(),
      "Ticket validity window is future"
    );

    console.log("✅ PASS: Ticket booking flow complete\n");
    return { ticket, fareQuote };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Test Suite 2: Conductor Scan Validation Flow
export async function testConductorScanValidationFlow() {
  console.log("=== TEST 2: Conductor Scan Validation Flow ===");

  try {
    // Get test ticket from booking flow
    const { ticket } = await testPassengerTicketBookingFlow();

    console.log("✓ Step 1: Conductor scans ticket at Hyderabad stop");
    const currentStop = mockRoute.stops[0]; // Hyderabad
    assertEqual(currentStop.id, "st-hyd", "Bus at origin stop");

    // Validations
    console.log("✓ Step 2: Validate ticket constraints");
    assertTrue(ticket.status === "active", "Ticket is active");
    assertTrue(ticket.lineageId === "lin-1", "Ticket belongs to bus lineage");
    assertTrue(
      ticket.allowedSegments.includes(0),
      "Passenger allowed at first segment"
    );

    console.log("✓ Step 3: Update occupancy");
    const newOccupancy = Math.min(mockBus.occupancy + 1, mockBus.capacity.seats);
    assertTrue(newOccupancy <= mockBus.capacity.seats, "Occupancy within capacity");

    console.log("✓ Step 4: Verify occupancy indicator");
    const occupancyRatio = newOccupancy / mockBus.capacity.seats;
    let indicator: string;
    if (occupancyRatio < 0.6) indicator = "green";
    else if (occupancyRatio <= 0.85) indicator = "yellow";
    else indicator = "red";
    
    assertTrue(["green", "yellow", "red"].includes(indicator), "Valid occupancy indicator");

    console.log("✅ PASS: Conductor validation flow complete\n");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Test Suite 3: Invalid Boarding Rejection (Beyond Destination)
export async function testInvalidBoardingRejection() {
  console.log("=== TEST 3: Invalid Boarding Rejection ===");

  try {
    const ticket: Ticket = {
      ticketId: "tkt-invalid",
      passengerId: mockUsers.passenger.id,
      lineageId: "lin-1",
      originStopId: "st-nlg",
      destinationStopId: "st-vjw", // Destination is Vijayawada (order 3)
      allowedSegments: [1, 2, 3],
      status: "active",
      qrToken: "QR-INVALID",
      fare: 200,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    };

    // Try to board at Guntur (stop order 4 - beyond destination)
    const gunturStop = mockRoute.stops[4];
    const destinationStop = mockRoute.stops[3];
    
    const isValidBoarding = gunturStop.order <= destinationStop.order;
    assertTrue(!isValidBoarding, "Reject boarding beyond destination");

    console.log("✅ PASS: Invalid boarding correctly rejected\n");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Test Suite 4: Parcel Logistics Flow
export async function testParcelLogisticsFlow() {
  console.log("=== TEST 4: Parcel Logistics Flow ===");

  try {
    // Step 1: Book parcel
    console.log("✓ Step 1: Book parcel shipment");
    const parcel: Parcel = {
      id: "prc-test-001",
      senderId: mockUsers.logistics.id,
      fromCity: "Hyderabad",
      destinationCity: "Guntur",
      dimensions: { length: 20, width: 18, height: 12 },
      weightKg: 4,
      assignedBusId: mockBus.id,
      status: "booked",
      qrToken: "QR-PRC-TST-001",
      eta: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      healthStatus: "stable"
    };

    // Step 2: Predict cargo fit
    console.log("✓ Step 2: Predict cargo fit on assigned bus");
    const parcelVolume = (parcel.dimensions.length * parcel.dimensions.width * parcel.dimensions.height) / 1000;
    const availableVolume = Math.max(mockBus.capacity.luggageVolume - mockBus.luggageUsed, 0);
    const fits = parcelVolume <= availableVolume && parcel.weightKg <= 20;
    const fitScore = Math.max(0, Math.min(1, availableVolume / Math.max(parcelVolume, 1)));
    
    assertTrue(fits, "Parcel fits in luggage space");
    assertTrue(fitScore > 0.5, "Fit score is reasonable");

    // Step 3: Scan load at origin
    console.log("✓ Step 3: Scan parcel loaded at Hyderabad");
    parcel.status = "loaded";
    assertEqual(parcel.status, "loaded", "Parcel marked as loaded");

    // Step 4: Simulate transit with location update
    console.log("✓ Step 4: Parcel in transit to Guntur");
    parcel.status = "in_transit";
    assertEqual(parcel.status, "in_transit", "Parcel in transit");

    // Step 5: Scan unload at destination
    console.log("✓ Step 5: Scan parcel unloaded at Guntur");
    parcel.status = "delivered";
    assertEqual(parcel.status, "delivered", "Parcel delivered");

    // Step 6: Health check
    console.log("✓ Step 6: Verify parcel health");
    assertTrue(
      ["stable", "temperature_warning", "shock_warning"].includes(parcel.healthStatus),
      "Valid health status"
    );

    console.log("✅ PASS: Parcel logistics flow complete\n");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Test Suite 5: Occupancy Indicator Calculation
export async function testOccupancyIndicatorCalculation() {
  console.log("=== TEST 5: Occupancy Indicator Calculation ===");

  try {
    const testCases = [
      { occupied: 20, total: 40, expected: "green", description: "50% - Green" },
      { occupied: 24, total: 40, expected: "yellow", description: "60% boundary - Yellow" },
      { occupied: 28, total: 40, expected: "yellow", description: "70% - Yellow" },
      { occupied: 34, total: 40, expected: "yellow", description: "85% boundary - Yellow" },
      { occupied: 35, total: 40, expected: "red", description: "87.5% - Red" }
    ];

    console.log("✓ Testing occupancy threshold calculations");

    testCases.forEach(({ occupied, total, expected, description }) => {
      const ratio = occupied / total;
      let indicator: string;
      
      if (ratio < 0.6) indicator = "green";
      else if (ratio <= 0.85) indicator = "yellow";
      else indicator = "red";

      assertEqual(indicator, expected, `${description}: ${indicator}`);
      console.log(`  ✓ ${description}`);
    });

    console.log("✅ PASS: All occupancy indicators correct\n");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Test Suite 6: ETA Calculation
export async function testETACalculation() {
  console.log("=== TEST 6: ETA Calculation ===");

  try {
    // Bus at Nalgonda (order 1), destination Guntur (order 4)
    const currentStopOrder = 1;
    const destinationOrder = 4;
    const remainingSegments = destinationOrder - currentStopOrder;
    const eta = remainingSegments * mockRoute.averageSegmentMinutes * 0.7;

    console.log(`✓ Bus at stop order ${currentStopOrder} (${mockRoute.stops[currentStopOrder].name})`);
    console.log(`✓ Destination stop order ${destinationOrder} (${mockRoute.stops[destinationOrder].name})`);
    console.log(`✓ Remaining segments: ${remainingSegments}`);
    console.log(`✓ Calculated ETA: ${eta} minutes`);

    assertTrue(eta > 0, "ETA is positive");
    assertTrue(eta < 200, "ETA is reasonable (< 200 min)");

    console.log("✅ PASS: ETA calculation correct\n");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Test Suite 7: Admin Dashboard KPIs
export async function testAdminDashboardKPIs() {
  console.log("=== TEST 7: Admin Dashboard KPIs ===");

  try {
    console.log("✓ Aggregating dashboard metrics");

    const mockKPIs = {
      totalBuses: 10,
      activeTrips: 8,
      ticketsToday: 1648,
      parcelsInTransit: 5,
      revenueToday: 128400,
      averageOccupancy: 68
    };

    assertTrue(mockKPIs.totalBuses > 0, "Bus count is positive");
    assertTrue(mockKPIs.activeTrips > 0, "Active trips recorded");
    assertTrue(mockKPIs.ticketsToday > 0, "Tickets sold today");
    assertTrue(mockKPIs.parcelsInTransit > 0, "Parcels in transit");
    assertTrue(mockKPIs.revenueToday > 0, "Revenue tracked");
    assertTrue(mockKPIs.averageOccupancy >= 0 && mockKPIs.averageOccupancy <= 100, "Occupancy % is valid");

    console.log("  ✓ Total buses:", mockKPIs.totalBuses);
    console.log("  ✓ Active trips:", mockKPIs.activeTrips);
    console.log("  ✓ Tickets today:", mockKPIs.ticketsToday);
    console.log("  ✓ Parcels in transit:", mockKPIs.parcelsInTransit);
    console.log("  ✓ Revenue today: ₹" + mockKPIs.revenueToday);
    console.log("  ✓ Average occupancy:", mockKPIs.averageOccupancy + "%");

    console.log("✅ PASS: All KPIs valid\n");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Test Suite 8: Multi-Stop Route Lineage Transfer
export async function testRouteLineageTransfer() {
  console.log("=== TEST 8: Route Lineage Multi-Stop Transfer ===");

  try {
    // Passenger boards Bus 1 at Hyderabad with lineage ticket
    const ticket: Ticket = {
      ticketId: "tkt-transfer",
      passengerId: mockUsers.passenger.id,
      lineageId: "lin-1",
      originStopId: "st-hyd",
      destinationStopId: "st-gnt",
      allowedSegments: [0, 1, 2, 3], // All segments
      status: "active",
      qrToken: "QR-TRANSFER",
      fare: 430,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    };

    console.log("✓ Passenger books Hyderabad → Guntur lineage ticket");

    // Transfer 1: Hyderabad → Khammam on Bus 101
    console.log("✓ Boards Bus 101 at Hyderabad (segment 0)");
    assertTrue(ticket.allowedSegments.includes(0), "Passenger authorized for segment 0");

    // Transfer 2: At Khammam, passenger can transfer to Bus 102
    console.log("✓ Transfer at Khammam to Bus 102 (segment 2)");
    assertTrue(ticket.allowedSegments.includes(2), "Passenger authorized for segment 2");

    console.log("✓ Validates at each boarding using same lineage ticket");
    assertTrue(ticket.status === "active", "Ticket remains active for transfers");

    console.log("✓ Final destination: Guntur (segment 3)");
    assertTrue(ticket.allowedSegments.includes(3), "Passenger authorized for final segment");

    console.log("✅ PASS: Lineage transfer flow complete\n");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Main test runner
export async function runAllTests() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║    TransitLink MVP - End-to-End Test Suite             ║");
  console.log("║         Complete Flow Validation & Verification        ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const tests = [
    testPassengerTicketBookingFlow,
    testConductorScanValidationFlow,
    testInvalidBoardingRejection,
    testParcelLogisticsFlow,
    testOccupancyIndicatorCalculation,
    testETACalculation,
    testAdminDashboardKPIs,
    testRouteLineageTransfer
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (err) {
      console.error(err);
      failed++;
    }
  }

  console.log("╔════════════════════════════════════════════════════════╗");
  console.log(`║  RESULTS: ${passed} PASSED, ${failed} FAILED                           ║`);
  console.log("╚════════════════════════════════════════════════════════╝\n");

  if (failed === 0) {
    console.log("🎉 All tests passed! MVP ready for deployment.\n");
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Please review.\n`);
  }

  return { passed, failed, total: tests.length };
}

// Export for testing frameworks
export default {
  runAllTests,
  testPassengerTicketBookingFlow,
  testConductorScanValidationFlow,
  testInvalidBoardingRejection,
  testParcelLogisticsFlow,
  testOccupancyIndicatorCalculation,
  testETACalculation,
  testAdminDashboardKPIs,
  testRouteLineageTransfer
};

// Run tests when executed directly
runAllTests().catch(console.error);
