# CampusRide Privacy Policy (Draft)

> [!IMPORTANT]
> **DISCLAIMER**: This document is a draft privacy policy prepared for technical architecture alignment and institutional diligence. It requires formal review and customization by qualified legal counsel before public publication.

**Effective Date:** September 21, 2026

## 1. Information We Collect
- **Student Verification Data**: Name, university email (`.edu`), university name, graduation year, and optional student ID photos used exclusively for identity verification.
- **Trip Information**: Commute origin and destination hubs, departure times, route itineraries, and live GPS coordinates during active trips only.
- **In Case of Emergency (ICE)**: Emergency contact names and telephone numbers provided by students.
- **Device & Usage Data**: IP addresses, browser types, and log telemetry collected for security, rate-limiting, and error diagnosis.

## 2. How We Use Information
- To match student drivers with classmates traveling the same campus corridors.
- To verify that participants belong to legitimate, accredited universities.
- To detect route deviations and transmit emergency alerts to campus security desks and student-designated ICE contacts when the SOS button is triggered.

## 3. Emergency SOS Feature Disclosure
When a student activates the in-app SOS feature:
- An SMS notification with live GPS coordinates is dispatched to the student's designated In Case of Emergency (ICE) contacts.
- An alert is logged on the university campus security dashboard.
- **CampusRide is not a replacement for official local emergency services (e.g. 911 / 112).** Users in life-threatening distress are advised to call national emergency dispatchers directly.

## 4. Zero Commercial Data Selling
CampusRide **never sells, rents, or commercializes personal data, student locations, or commute patterns** to data brokers, advertising networks, or third-party marketing companies.

## 5. Account & Data Deletion
Users may delete their account at any time via the in-app profile settings or by sending an authenticated request to `DELETE /api/auth/me/account`. Personal profile information, contact numbers, and registered vehicles are immediately deleted or anonymized.
