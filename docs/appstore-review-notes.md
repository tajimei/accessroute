# App Store Review Notes

## App Description

AccessRoute is a barrier-free navigation app designed for users with diverse mobility needs, including wheelchair users, stroller users, cane walkers, and elderly individuals. The app provides personalized accessible route suggestions and displays barrier-free facility information along the route.

### Core Features

1. **Personalized Route Search**: Users register their mobility type (wheelchair, stroller, cane, walking, other), companions, maximum travel distance, avoidance conditions (stairs, steep slopes, crowds, dark paths), and preferred facilities (restrooms, rest areas, covered paths). Routes are scored and ranked based on these preferences.

2. **Accessibility Score**: Each route and spot is rated 0-100 for accessibility, calculated based on the user's profile and route characteristics.

3. **Route Details**: Step-by-step directions with barrier-free information including stair presence, slope grade, and surface type (paved, gravel, dirt).

4. **Nearby Spot Search**: Search for barrier-free facilities (accessible restrooms, rest areas, elevators, nursing rooms, kids spaces, etc.) near a given location.

5. **AI Chat (Concierge)**: Users can describe their travel needs in natural language. The AI extracts structured accessibility needs and suggests optimal routes and spots.

6. **Full VoiceOver Support**: All screens are fully accessible via VoiceOver with proper accessibility labels, hints, and minimum 44x44pt tap targets.

---

## Test Account

| Field | Value |
|-------|-------|
| Email | `review@accessroute.example.com` |
| Password | `[REPLACE_WITH_TEST_PASSWORD]` |

The test account has a pre-configured profile (wheelchair user, avoids stairs and steep slopes, prefers restrooms nearby).

---

## Demo Steps

### 1. Onboarding Flow

1. Launch the app
2. Complete the 5-step onboarding:
   - Step 1: Select mobility type (e.g., "Wheelchair")
   - Step 2: Select companions (e.g., "Elderly")
   - Step 3: Set maximum travel distance using the slider (e.g., 1.5km)
   - Step 4: Select avoidance conditions (e.g., "Stairs", "Steep slopes")
   - Step 5: Select preferred facilities (e.g., "Restroom", "Rest area")
3. Tap "Done" to save the profile

### 2. Route Search

1. On the home screen, tap the search bar
2. Enter a destination (e.g., "Tokyo Station") or tap a location on the map
3. View the route candidates list showing accessibility score, distance, duration, and warnings
4. Select a route to view step-by-step details with barrier-free annotations
5. Review nearby barrier-free spots along the route

### 3. Nearby Spot Search

1. From the home screen, tap a location on the map
2. View nearby barrier-free spots with category, accessibility score, and distance
3. Tap a spot to view detailed barrier-free information (wheelchair access, elevator, accessible restroom, baby changing station, etc.)

### 4. AI Chat

1. Navigate to the Chat screen
2. Type a message such as: "I want to go from Tokyo Station to Shibuya Station by wheelchair. I want to avoid stairs."
3. The AI responds as a travel concierge, asks follow-up questions, and suggests routes
4. The AI automatically extracts mobility needs from the conversation

### 5. Profile Editing

1. Tap the profile card at the bottom of the home screen
2. Modify any profile settings
3. Tap "Save" to update
4. Perform a new route search to verify updated results

### 6. VoiceOver Verification

1. Enable VoiceOver in device Settings > Accessibility
2. Navigate through all screens using swipe gestures
3. Verify that all interactive elements are properly labeled and operable

---

## Location Usage

- **When in Use**: The app requests location permission to determine the starting point for route searches and to display nearby spots
- **Background**: The app does NOT use background location access
- Location permission prompt message: "AccessRoute uses your location to find barrier-free routes and nearby accessible facilities."

---

## Privacy Considerations

- No third-party advertising or tracking SDKs are used
- User data is stored in Firebase (Firestore, Authentication) and is accessible only to the authenticated user
- Location data is not stored persistently on the server; it is used only during route/spot search processing
- The app complies with Japan's Act on the Protection of Personal Information

---

## Third-Party Services

| Service | Usage |
|---------|-------|
| Google Maps SDK for iOS | Map display |
| Google Directions API | Route calculation |
| Google Places API | Location search |
| Firebase Authentication | User authentication |
| Firebase Firestore | User profile and chat history storage |
| Firebase Cloud Functions | Backend API |
| Custom AI inference server (self-hosted) | AI chat and needs extraction |

---

## Technical Notes

- Minimum iOS version: 17.0
- Supported devices: iPhone and iPad
- Primary language: Japanese
- App category: Navigation
