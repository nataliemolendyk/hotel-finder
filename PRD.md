# Hotel Finder - Product Requirements Document

## 1. Overview

**Product Name:** Hotel Finder

**Description:** A web application that helps users find and compare hotels in a specified city. Users search by entering a city name and receive a curated list of hotels with detailed information, which they can filter by price and rating, sort by price or ratings, and save favorites.

**Target Users:** Travelers planning trips who want an easy way to explore hotel options in their destination city.

## 2. Goals & Success Metrics

- Provide users with quick access to hotel options in their destination city
- Enable users to easily compare hotels based on their preferences (price, ratings, amenities)
- Offer a mobile-friendly, intuitive interface
- Successfully integrate Google Hotels API to retrieve real hotel data with a fallback to curated mock data

## 3. User Stories

### Primary User Flow
**As a** traveler planning a trip  
**I want to** enter a city name and receive a list of hotels  
**So that** I can quickly compare options and find a hotel in that city

### Filtering & Sorting Flow
**As a** user viewing hotel results  
**I want to** filter by max price and minimum rating, and sort by price or ratings
**So that** I can find hotels that match my budget and quality preferences

### Details & Booking Flow
**As a** user interested in a hotel  
**I want to** view room types and pricing details
**So that** I can decide which hotel fits my needs and then book it

### Favorites Flow
**As a** user comparing hotels
**I want to** save hotels to a favorites list and view them later in a popup
**So that** I can keep track of options I'm considering
## 4. Core Features

### 4.1 Search Input Form
**Description:** Users enter a city name to search for hotels

**Inputs:**
- Destination city (text input, required)
**Functionality:**
- Press Enter or click Search button to submit
- Auto-loads all hotels on page load when input is empty
- Falls back to mock data if the API call fails
### 4.2 Hotel Results Display
**Description:** Display hotel results matching the search criteria

**Information Displayed per Hotel:**
1. Hotel name
2. Price per night
3. Rating/review score
4. Address
5. Room offerings (room types, prices, features) — shown in detail modal

**Layout:**
- Responsive grid of hotel cards
- Cards show name, rating, price, address, and action buttons

### 4.3 Filtering & Sorting Options
**Description:** Allow users to filter and sort results

**Available Filters:**
1. **Max Price** — number input, filters out hotels above the entered price
2. **Min Rating** — dropdown selector (4.5, 4.0, 3.5, 3.0, Any)
**Available Sort Options:**
1. **Price: Low → High**
2. **Price: High → Low**
3. **Rating: High → Low**
**Functionality:**
- Filter changes apply immediately as values are updated
- Clear Filters button resets all filters
- Sort dropdown re-orders results on change
- Filtered/sorted results display count header

### 4.4 Hotel Details Modal
**Description:** View detailed hotel information

**Modal Contents:**
- Hotel name, rating, and price
- Full address
- Room types list with individual prices and features
- "Add to Favorites" button
- "Book Now" button (opens Google Travel search in a new tab)

### 4.5 Book Now Button
**Description:** Enable users to book hotels

**Functionality:**
- Each hotel card has a "Book Now" button
- Each detail modal has a "Book Now" button
- Clicking opens a Google Travel search for the hotel in a new tab

### 4.6 Favorites
**Description:** Save and manage favorite hotels
**Functionality:**
- Add favorites from the detail modal via "♡ Add to Favorites" button
- View all favorites by clicking "Favorites" button in the header
- Favorites popup shows hotel names with ratings and prices
- Remove individual favorites from the popup via × button
- Favorites persist in localStorage across sessions
- Toast notifications confirm add/remove actions

### 4.7 Loading States
**Description:** Show user that data is being fetched

**Functionality:**
- Display a loading spinner while API is fetching data
- Spinner appears after user clicks Search
- Spinner is replaced with results once data loads

### 4.8 Error Handling
**Description:** Handle edge cases gracefully

**Scenarios:**

| Scenario | Behavior |
|----------|----------|
| No hotels found | Display message: "No hotels match your filters. Try adjusting them." |
| API failure | Falls back to curated mock data covering 8 cities |
| Empty search | Returns all available hotels |

### 4.9 Mock Data Fallback
**Description:** Curated hotel data used when the API is unavailable

**Cities Covered:** Las Vegas, New York, San Francisco, Miami, Chicago, London, Paris, Tokyo

**Data Provided per Hotel:**
- Name, rating, price, address
- 2 room types with prices and features
- Each city has 3-5 hotels
## 5. Technical Specifications

### 5.1 APIs Used
- **Google Hotels API** (via SearchAPI): Retrieve hotel information, pricing, ratings, and amenities based on city input

### 5.2 Technology Stack
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **API Calls:** Fetch API with async/await
- **Backend:** Vercel serverless function for API proxy
- **Hosting:** GitHub Pages + Vercel
- **Data Persistence:** localStorage for favorites
- **Design:** Mobile-responsive layout

### 5.3 Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 6. User Interface

### 6.1 Page Layout
1. **Header** — App title and Favorites button
2. **Filter Bar** — City search, max price, min rating, sort dropdown, clear filters
3. **Results Container** — Grid of hotel cards
4. **Detail Modal** — Room types, favorites, book now
5. **Favorites Popup** — Saved hotels with remove capability
6. **Loading Indicator** — Centered spinner while fetching data
7. **Toast Notifications** — Feedback for favorites actions
8. **Error Messages** — Empty state for no matching results
### 6.2 Responsiveness
- Layout adjusts for mobile screens (< 768px width)
- Header stacks vertically on mobile
- Filter bar becomes single column on mobile
- Hotel cards go to single-column layout on small screens
- Touch-friendly buttons and inputs
## 7. Scope

### In Scope
- Search by city name
- API integration for hotel data retrieval with mock data fallback
- Display hotel name, price, rating, address, room offerings
- Filter by max price and minimum rating
- Sort by price (asc/desc) and rating (desc)
- View Details modal with room types
- Favorites system with popup and localStorage persistence
- Book Now button linking to Google Travel
- Loading spinner
- Clear filters functionality
- Mobile-responsive design
- Toast notifications

### Out of Scope
- Date pickers, guest count, room count inputs
- Sort by surroundings and features
- Display review counts, distance from airport, hotel images
- User accounts and saved searches
- Pagination (all results shown at once)
- Integration with booking APIs (uses Google Travel search link)
## 8. Success Criteria

- [x] Users can search for hotels by entering a destination city
- [x] API calls complete within reasonable time (~5-10 seconds)
- [x] Users can filter by max price and minimum rating
- [x] Users can sort results by price and ratings
- [x] Book Now links function and open Google Travel in a new tab
- [x] Favorites persist in localStorage across sessions
- [x] Favorites popup allows viewing and removing saved hotels
- [x] App is fully functional on mobile devices
- [x] Loading spinner displays during API calls
- [x] Mock data fallback works when API is unavailable
- [x] No critical console errors

## 9. Assumptions & Constraints

### Assumptions
- Users have internet access
- Users know the name of the city they want to visit
- APIs (SearchAPI) remain available and responsive (with mock fallback)
- Hotel pricing and availability data updates reasonably frequently

### Constraints
- Dependent on third-party APIs for data accuracy and uptime
- Limited to hotels available through Google Hotels data
- May face rate limits from APIs if traffic is high
- Mock data is static and may become outdated
- No actual booking integration — links to Google Travel search
## 10. Open Questions / Considerations

- Should the app cache results to reduce API calls?
- How should the app handle very large result sets?
- Should favorites sync across devices?

