# CampusRide Data Handling & Privacy Architecture

> [!CAUTION]
> **LEGAL NOTICE**: This document represents technical implementation documentation and draft policy guidelines. It does not constitute legal advice and must be formally reviewed by qualified legal counsel prior to institutional deployment.

---

## 1. Personal Data Inventory

| Model | Data Elements Stored | Purpose | Retention Period | Automated Cleanup Mechanism |
|---|---|---|---|---|
| `User` | Name, `.edu` email address, phone, college, graduation year, avatar URL, verification status | Student identity & safety verification | Life of account | Cascading anonymization upon `DELETE /api/auth/me/account` |
| `User.emergencyContacts` | ICE Contact name, phone number, relationship | Emergency SOS SMS notification | Life of account | Deleted upon account deletion or profile update |
| `Vehicle` | Model, plate number (last 4 digits only), capacity, type | Ride identification & seat availability | Life of vehicle record | Cascading delete with user |
| `TripLocation` | Latitude, longitude, speed, heading, accuracy, deviation flags | Real-time active trip tracking & route safety | **30 Days post-trip** | **MongoDB TTL Index (`expires: 30 * 86400`)** |
| `EmergencyIncident` | Trip ID, GPS coordinates, trigger timestamp, status | Security team dispatch & audit trail | 1 Year (statutory compliance) | Manual administrative archiving |
| `Conversation` | Text messages, timestamps, participant IDs | In-app ride pickup coordination | 90 Days post-ride | Scheduled retention archive |
| `Review` | 5-star rating, textual peer feedback, reviewer ID | Peer trust & driver reliability scoring | Indefinite (anonymized if user deletes account) | User ID updated to anonymous identifier |

---

## 2. Right to Erasure / Account Deletion

CampusRide technically enforces GDPR/CCPA "Right to be Forgotten" via the `DELETE /api/auth/me/account` endpoint:
1. **Immediate Cancellation**: Cancels all active ride offers and pending seat requests.
2. **Vehicle Deletion**: Permanently purges registered vehicles.
3. **Anonymization for Historical Integrity**: Completed trips and peer reviews preserve historical auditability by replacing the user's name with `"Former Student"` and zeroing out emails, phone numbers, avatars, and emergency contacts.
4. **Audit Log Record**: Generates an immutable `ACCOUNT_DELETED` security audit entry.

---

## 3. Student Privacy & FERPA Considerations

In higher education environments (particularly in the United States under FERPA, or equivalent state student privacy laws):
- **Directory Information**: Student names and `.edu` affiliations are treated as campus directory information.
- **Grades / Educational Records**: CampusRide collects **zero academic records**, transcripts, or GPA data.
- **Location Telemetry Privacy**: GPS telemetry is only captured while a trip is active. Continuous background location tracking when outside an active trip is **strictly forbidden**.
