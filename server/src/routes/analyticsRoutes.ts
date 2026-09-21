import { Router, Request, Response } from 'express';
import { User, Ride, Trip, Review } from '../models';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/analytics/mobility
router.get('/mobility', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      activeRidesCount,
      completedTripsCount,
      completedTrips,
      allRides,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ verificationStatus: 'verified' }),
      Ride.countDocuments({ status: 'active' }),
      Trip.countDocuments({ status: 'completed' }),
      Trip.find({ status: 'completed' }).select('distance passengerIds startTime'),
      Ride.find().select('origin destination departureTime'),
    ]);

    // Aggregate total passenger kilometers shared
    let totalPassengerKm = 0;
    completedTrips.forEach((trip) => {
      const passengerCount = trip.passengerIds ? trip.passengerIds.length : 1;
      totalPassengerKm += (trip.distance || 10) * Math.max(1, passengerCount);
    });

    // Approximate CO2 emissions saved: ~171 grams CO2 saved per passenger-km
    const co2SavedKg = Math.round(totalPassengerKm * 0.171 * 10) / 10;

    // Peak commute hours distribution
    const hourlyDistribution: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourlyDistribution[i] = 0;

    allRides.forEach((ride) => {
      if (ride.departureTime) {
        const hour = new Date(ride.departureTime).getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      }
    });

    // Popular campus routes
    const routeCounts: Record<string, number> = {};
    allRides.forEach((ride) => {
      const key = `${ride.origin.text} → ${ride.destination.text}`;
      routeCounts[key] = (routeCounts[key] || 0) + 1;
    });

    const popularRoutes = Object.entries(routeCounts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      summary: {
        totalUsers,
        verifiedStudents: verifiedUsers,
        verificationRate: totalUsers ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
        activeRides: activeRidesCount,
        completedTrips: completedTripsCount,
        totalKmShared: Math.round(totalPassengerKm * 10) / 10,
        co2SavedKg,
      },
      peakHours: Object.entries(hourlyDistribution).map(([hour, count]) => ({
        hour: `${hour}:00`,
        rides: count,
      })),
      popularRoutes,
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    logger.error({ err }, 'Analytics error');
    res.status(500).json({ error: err.message || 'Failed to fetch mobility analytics' });
  }
});

export default router;
