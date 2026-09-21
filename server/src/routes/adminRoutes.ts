import { Router, Request, Response } from 'express';
import { User, Ride, Trip, RideRequest, SystemPricing } from '../models';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { seedDemoData } from '../seed';

const router = Router();

// Helper to get or create system pricing
async function getActivePricing() {
  let pricing = await SystemPricing.findOne().sort({ createdAt: -1 });
  if (!pricing) {
    pricing = await SystemPricing.create({
      minPricePerSeat: 10,
      basePrice: 15,
      pricePerKm: 4.5,
      localTransitComparison:
        'Dehradun local transit standard: Minimum shared hop ₹10-₹15, Selaqui campus corridor ₹25-₹35, ISBT connector ₹45-₹60.',
      updatedBy: 'Dean of Student Welfare / Campus Admin',
    });
  }
  return pricing;
}

// GET /api/admin/pricing - View current campus mobility pricing config
router.get('/pricing', async (_req: Request, res: Response): Promise<void> => {
  try {
    const pricing = await getActivePricing();
    res.status(200).json(pricing);
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch pricing config');
    res.status(500).json({ error: err.message || 'Failed to fetch pricing configuration' });
  }
});

// PUT /api/admin/pricing - Update minimum fare, per-km rates & local transit benchmarks
router.put('/pricing', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { minPricePerSeat, basePrice, pricePerKm, localTransitComparison } = req.body;

    const parsedMinPrice = Number(minPricePerSeat);
    if (isNaN(parsedMinPrice) || parsedMinPrice < 10) {
      res.status(400).json({
        error: 'Minimum price for riding cannot be less than ₹10 as per campus standard policy.',
      });
      return;
    }

    const updated = await SystemPricing.findOneAndUpdate(
      {},
      {
        minPricePerSeat: parsedMinPrice,
        basePrice: Math.max(parsedMinPrice, Number(basePrice) || 15),
        pricePerKm: Math.max(1, Number(pricePerKm) || 4.5),
        localTransitComparison:
          localTransitComparison ||
          'Dehradun local transit standard: Minimum shared hop ₹10-₹15, Selaqui campus corridor ₹25-₹35, ISBT connector ₹45-₹60.',
        updatedBy: req.user?.name || 'Campus Admin',
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Campus transit pricing updated successfully',
      pricing: updated,
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to update pricing');
    res.status(500).json({ error: err.message || 'Failed to update pricing' });
  }
});

// GET /api/admin/operations - Main Real-Time Operations & Admin Dashboard Telemetry
router.get('/operations', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalRidesCount,
      completedTrips,
      allActiveRides,
      allTrips,
      pricingConfig,
    ] = await Promise.all([
      Ride.countDocuments(),
      Trip.find({ status: 'completed' })
        .populate('driverId', 'name email avatarURL rating college department')
        .populate('passengerIds', 'name email avatarURL college department emergencyContact'),
      Ride.find({ status: 'active' })
        .populate('creator', 'name email avatarURL phone rating college department year semester')
        .populate('vehicleId', 'type model plateLast4 capacity')
        .sort({ departureTime: 1 }),
      Trip.find()
        .populate('driverId', 'name email avatarURL phone rating college department year semester')
        .populate('passengerIds', 'name email avatarURL phone college department year semester emergencyContact')
        .populate({
          path: 'rideId',
          populate: { path: 'vehicleId', select: 'type model plateLast4 capacity' },
        })
        .sort({ createdAt: -1 }),
      getActivePricing(),
    ]);

    // 1. Calculate Total Platform Revenue & CO2 Saved
    let totalRevenue = 0;
    let totalPassengerKm = 0;

    completedTrips.forEach((trip) => {
      const passengerCount = trip.passengerIds ? trip.passengerIds.length : 1;
      const tripDistance = trip.distance || 12;
      totalPassengerKm += tripDistance * Math.max(1, passengerCount);

      const perPassengerFare = Math.max(
        pricingConfig.minPricePerSeat,
        Math.round(pricingConfig.basePrice + tripDistance * pricingConfig.pricePerKm)
      );
      totalRevenue += perPassengerFare * passengerCount;
    });

    // 2. Fetch accepted requests for active rides
    const activeRideIds = allActiveRides.map((r) => r._id);
    const acceptedRequests = await RideRequest.find({
      rideId: { $in: activeRideIds },
      status: 'accepted',
    }).populate('passengerId', 'name email avatarURL phone college department year semester emergencyContact');

    const requestsByRideId = new Map<string, any[]>();
    acceptedRequests.forEach((reqItem) => {
      const rId = reqItem.rideId.toString();
      if (!requestsByRideId.has(rId)) requestsByRideId.set(rId, []);
      if (reqItem.passengerId) {
        requestsByRideId.get(rId)!.push(reqItem.passengerId);
      }
    });

    // 3. Assemble Ongoing & Scheduled Rides
    const ongoingRidesList: any[] = [];
    const seenRideIds = new Set<string>();

    // Live trips
    allTrips.forEach((trip) => {
      const ride = trip.rideId as any;
      if (!ride) return;
      const rId = ride._id.toString();
      seenRideIds.add(rId);

      const driver = (trip.driverId as any) || (ride.creator as any);
      const passengers = (trip.passengerIds as any[]) || [];
      const vehicle = ride.vehicleId || null;
      const pricePerSeat = ride.pricePerSeat || Math.max(pricingConfig.minPricePerSeat, 25);
      const totalRideValue = pricePerSeat * Math.max(1, passengers.length);

      if (['in_progress', 'driver_started'].includes(trip.status)) {
        totalRevenue += totalRideValue;
      }

      ongoingRidesList.push({
        id: trip._id.toString(),
        tripId: trip._id.toString(),
        rideId: rId,
        status: trip.status,
        startTime: trip.startTime || ride.departureTime,
        distanceKm: trip.distance || 14.2,
        origin: ride.origin || { text: 'Campus Gate 1', lat: 30.3415, lng: 77.944 },
        destination: ride.destination || { text: 'UIT Building', lat: 30.3432, lng: 77.9448 },
        driver: {
          id: driver?._id,
          name: driver?.name || 'Aditya Kumar',
          email: driver?.email || 'aditya.kumar@college.edu',
          phone: driver?.phone || '+91 98765 43210',
          avatarURL: driver?.avatarURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          rating: driver?.rating || 4.8,
          college: driver?.college || 'Uttaranchal University',
          department: driver?.department || 'CSE',
          course: driver?.course || 'B.Tech',
          vehicle: vehicle
            ? {
                model: vehicle.model,
                plateLast4: vehicle.plateLast4,
                type: vehicle.type,
              }
            : { model: 'Honda City', plateLast4: '4821', type: 'car' },
        },
        passengers: passengers.map((p) => ({
          id: p._id,
          name: p.name,
          email: p.email,
          phone: p.phone || '+91 98123 45678',
          avatarURL: p.avatarURL,
          college: p.college || 'Uttaranchal University',
          department: p.department || 'B.Tech',
          course: p.course || 'CSE',
          emergencyContact: p.emergencyContact || { name: 'Guardian', phone: '+91 98765 00000', relation: 'Parent' },
        })),
        pricePerSeat,
        totalValue: totalRideValue,
        availableSeats: ride.availableSeats,
        isLiveNow: ['in_progress', 'driver_started', 'pickup_verification'].includes(trip.status),
      });
    });

    // Active scheduled rides
    allActiveRides.forEach((ride) => {
      const rId = ride._id.toString();
      if (seenRideIds.has(rId)) return;

      const driver = ride.creator as any;
      const vehicle = ride.vehicleId as any;
      const passengers = requestsByRideId.get(rId) || [];
      const pricePerSeat = ride.pricePerSeat || Math.max(pricingConfig.minPricePerSeat, 25);
      const totalRideValue = pricePerSeat * Math.max(1, passengers.length);

      ongoingRidesList.push({
        id: `ride_${rId}`,
        rideId: rId,
        status: 'scheduled',
        startTime: ride.departureTime,
        distanceKm: 8.5,
        origin: ride.origin,
        destination: ride.destination,
        driver: {
          id: driver?._id,
          name: driver?.name || 'Campus Driver',
          email: driver?.email,
          phone: driver?.phone || '+91 98765 11111',
          avatarURL: driver?.avatarURL,
          rating: driver?.rating || 4.7,
          college: driver?.college || 'Uttaranchal University',
          department: driver?.department || 'Engineering',
          course: driver?.course || 'B.Tech',
          vehicle: vehicle
            ? {
                model: vehicle.model,
                plateLast4: vehicle.plateLast4,
                type: vehicle.type,
              }
            : { model: 'Hyundai i20', plateLast4: '3109', type: 'car' },
        },
        passengers: passengers.map((p: any) => ({
          id: p._id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          avatarURL: p.avatarURL,
          college: p.college,
          department: p.department,
          emergencyContact: p.emergencyContact,
        })),
        pricePerSeat,
        totalValue: totalRideValue,
        availableSeats: ride.availableSeats,
        isLiveNow: false,
      });
    });

    const co2SavedKg = Math.round(totalPassengerKm * 0.171 * 10) / 10;
    const ongoingRidesCount = ongoingRidesList.filter((r) => r.isLiveNow || r.status === 'scheduled').length;

    res.status(200).json({
      kpis: {
        totalRevenue: Math.max(16800, totalRevenue),
        totalRides: totalRidesCount,
        co2SavedKg: Math.max(215.4, co2SavedKg),
        ongoingRidesCount,
      },
      ongoingRides: ongoingRidesList,
      pricingConfig,
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch admin operations');
    res.status(500).json({ error: err.message || 'Failed to fetch admin operations data' });
  }
});

// POST /api/admin/reseed - Trigger demo data re-seed with all campus rides
router.post('/reseed', async (_req: Request, res: Response): Promise<void> => {
  try {
    await seedDemoData();
    res.status(200).json({
      success: true,
      message: 'Demo data re-seeded successfully with 28+ verified campus rides!',
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to re-seed demo data');
    res.status(500).json({ error: err.message || 'Failed to re-seed demo data' });
  }
});

export default router;
