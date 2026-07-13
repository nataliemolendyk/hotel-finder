# Hotel Finder - Product Requirements Document

## 1. Overview

**Product Name:** Hotel Finder

**Description:** A web application that helps users find and compare hotels in a specified city. Users search by entering a city name and receive a curated list of hotels with detailed information, which they can sort by price, ratings, surroundings, and features.

**Target Users:** Travelers planning trips who want an easy way to find hotels in their destination city.

## 2. Goals & Success Metrics

- Provide users with quick access to hotel options in their destination city
- Enable users to easily compare hotels based on their preferences (price, ratings, amenities, location)
- Offer a mobile-friendly, intuitive interface
- Successfully integrate Google Hotels API to retrieve real hotel data

## 3. User Stories

### Primary User Flow
**As a** traveler planning a trip  
**I want to** enter a city name and receive a list of hotels  
**So that** I can quickly compare options and book a hotel in that city

### Sorting User Flow
**As a** user viewing hotel results  
**I want to** sort hotels by price, ratings, surroundings, and features  
**So that** I can find hotels that match my priorities

### Booking User Flow
**As a** user interested in a hotel  
**I want to** click a "Book Now" button  
**So that** I can proceed to book the hotel on an external booking site

## 4. Core Features

### 4.1 Search Input Form
**Description:** Users input search parameters to find hotels

**Required Inputs:**
- Destination city (required)
- Check-in date (required)
- Check-out date (required)
- Number of guests (required)
- Number of rooms (required)

**Functionality:**
- Form validation to ensure all fields are filled before search
- User-friendly date pickers
- Clear "Search" button to submit the form

### 4.2 Hotel Results Display
**Description:** Display paginated results of hotels matching the search criteria

**Information Displayed per Hotel (MVP):**
1. Hotel name
2. Price per night
3. Rating/review score
4. Address
5. Detailed room offerings (amenities, room types, etc.)

**Future Enhancements (Post-MVP):**
- Number of reviews
- Distance from airport
- Room features/amenities summary
- Places surrounding the hotel

**Pagination:**
- 10 hotels per page
- "Previous" and "Next" buttons for navigation
- Page number indicator

### 4.3 Sorting Options
**Description:** Allow users to sort results by preference

**Available Sort Options:**
1. **Price** - Ascending (lowest to highest)
2. **Ratings** - Descending (highest to lowest)
3. **Hotel Surroundings** - Sorted by proximity/quality of surrounding areas
4. **Features** - Sorted by amenities/room offerings

**Functionality:**
- Sorting buttons displayed above results
- Clicking a sort button re-orders the current page
- Clear indication of which sort is currently active

### 4.4 Hotel Details & Booking
**Description:** Enable users to book hotels

**Functionality:**
- Each hotel result has a "Book Now" button
- Clicking "Book Now" opens an external link to the booking site (Booking.com or other appropriate platform)
- Link opens in a new tab/window

### 4.5 Loading States
**Description:** Show user that data is being fetched

**Functionality:**
- Display a loading spinner while APIs are fetching data
- Spinner appears after user clicks "Search"
- Spinner is replaced with results once data loads

### 4.6 Error Handling
**Description:** Handle edge cases gracefully

**Scenarios:**

| Scenario | Behavior |
|----------|----------|
| No hotels found | Display message: "No hotels found for this destination" |
| API failure | Display error message and "Retry" button; user can retry the search |
| Invalid input | Show validation error messages below relevant form fields |

## 5. Technical Specifications

### 5.1 APIs Used
- **Booking Scraper** (via SearchAPI): Retrieve hotel information, pricing, ratings, and amenities based on city input

### 5.2 Technology Stack
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **API Calls:** Fetch API with async/await
- **Design:** Mobile-responsive layout

### 5.3 Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 6. User Interface

### 6.1 Page Layout
1. **Header** - App title and branding
2. **Search Form** - Destination city, check-in/out dates, guests, rooms
3. **Sort Controls** - Buttons to sort by price, ratings, surroundings, features
4. **Results Container** - Paginated hotel cards (10 per page)
5. **Pagination Controls** - Previous/Next buttons and page indicator
6. **Loading Indicator** - Centered spinner while fetching data
7. **Error Messages** - Prominent display of errors with retry option

### 6.2 Responsiveness
- Layout adjusts for mobile screens (< 768px width)
- Touch-friendly buttons and inputs
- Readable font sizes on all devices
- Optimized card layout for mobile viewing

## 7. MVP Scope

### In Scope (MVP)
- Search form with destination city, dates, guests, rooms
- API integration for hotel data retrieval
- Display 5 hotel data points: name, price, rating, address, room offerings
- Sort by price and ratings
- Paginated results (10 per page)
- "Book Now" functionality
- Loading spinner
- Basic error handling (no results, API errors)
- Mobile-responsive design

### Out of Scope (Future Enhancements)
- Sort by surroundings and features (Phase 2)
- Display review counts and distance from airport
- Wishlist/favorites functionality
- Advanced filters (price range, star rating range, specific amenities)
- User accounts and saved searches
- Integration with flight booking (separate step currently)

## 8. Success Criteria

- [ ] Users can search for hotels by entering a destination city
- [x] API calls complete within reasonable time (~5-10 seconds)
- [x] Users can sort results by price and ratings
- [x] Pagination works correctly across pages
- [x] "Book Now" links function and open external booking site
- [x] App is fully functional on mobile devices
- [x] Loading spinner displays during API calls
- [x] Error messages appear when APIs fail or no results found
- [x] No critical console errors

## 9. Assumptions & Constraints

### Assumptions
- Users have internet access
- Users know the name of the city they want to visit
- APIs (SearchAPI) remain available and responsive
- Hotel pricing and availability data updates reasonably frequently

### Constraints
- Dependent on third-party APIs for data accuracy and uptime
- Limited to hotels available through Google Hotels data
- May face rate limits from APIs if traffic is high
- Async/fetch complexity requires careful error handling

## 10. Open Questions / Considerations

- What is the expected API response time, and what timeout should be set?
- Should the app cache results to reduce API calls?
- How should the app handle very large result sets (100+ hotels)?
- Should users be able to save/bookmark searches?
- Will there be a backend server, or is this a client-side only app?
