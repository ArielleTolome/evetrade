# Industry Profits API Endpoint

## Overview

The Industry Profits API endpoint (`/api/industry`) analyzes a character's blueprints and calculates their profitability based on current market prices. This endpoint is designed to help EVE Online players identify which blueprints are most valuable and potentially profitable for manufacturing.

## Authentication

This endpoint requires ESI (EVE Swagger Interface) authentication. You must provide a valid access token with the following scopes:

- `esi-characters.read_blueprints.v1` (required)
- `esi-industry.read_character_jobs.v1` (optional, for active jobs data)

## Endpoint

```
GET /api/industry
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `character_id` | integer | Yes | - | EVE Online character ID |
| `region_id` | integer | No | 10000002 | Market region for price lookups (default: The Forge/Jita) |
| `min_profit` | float | No | 0 | Minimum profit threshold |
| `min_roi` | float | No | 0 | Minimum ROI percentage (0-100) |
| `activity` | string | No | - | Filter by industry activity type |
| `me_level` | integer | No | - | Filter by material efficiency level (0-10) |

### Industry Activity Types

- `manufacturing` - Manufacturing jobs
- `researching_time_efficiency` - Time efficiency research
- `researching_material_efficiency` - Material efficiency research
- `copying` - Blueprint copying
- `invention` - Tech 2 invention
- `reaction` - Reaction jobs

## Headers

```
Authorization: Bearer {access_token}
```

The access token must be obtained from ESI OAuth flow.

## Response Format

### Success Response (200 OK)

```json
{
  "blueprints": [
    {
      "Blueprint ID": 1001,
      "Blueprint Type ID": 689,
      "Blueprint Name": "Rifter Blueprint",
      "Material Efficiency": 10,
      "Time Efficiency": 20,
      "Runs": "Original",
      "Market Price": 5000000,
      "Location ID": 60003760,
      "Location Flag": "Hangar",
      "Quantity": 1
    }
  ],
  "total": 50,
  "totalOwned": 125,
  "activeJobs": 5,
  "requestId": "abc123"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `blueprints` | array | Array of blueprint objects with profitability data |
| `total` | integer | Number of blueprints returned (after filters) |
| `totalOwned` | integer | Total number of blueprints owned by character |
| `activeJobs` | integer | Number of active industry jobs |
| `requestId` | string | Unique request ID for debugging |

### Blueprint Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `Blueprint ID` | integer | Unique item ID of the blueprint |
| `Blueprint Type ID` | integer | Type ID of the blueprint |
| `Blueprint Name` | string | Name of the blueprint |
| `Material Efficiency` | integer | Material efficiency level (0-10) |
| `Time Efficiency` | integer | Time efficiency level (0-20) |
| `Runs` | string/integer | "Original" for BPOs, number for BPCs |
| `Market Price` | float | Current market sell price in ISK |
| `Location ID` | integer | Location where blueprint is stored |
| `Location Flag` | string | Storage location (Hangar, Deliveries, etc.) |
| `Quantity` | integer | Quantity of blueprints (usually 1) |

### Error Responses

#### 400 Bad Request
```json
{
  "error": "character_id is required"
}
```

#### 401 Unauthorized
```json
{
  "error": "Authentication failed",
  "message": "Your access token may have expired. Please re-authenticate with ESI.",
  "requestId": "abc123"
}
```

#### 403 Forbidden
```json
{
  "error": "Access forbidden",
  "message": "You do not have the required ESI scopes. Please ensure you have authorized: esi-characters.read_blueprints.v1",
  "requestId": "abc123"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to fetch industry data",
  "requestId": "abc123"
}
```

## Example Usage

### Basic Request

```bash
curl -X GET "https://yourdomain.com/api/industry?character_id=123456" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Filtered Request

```bash
curl -X GET "https://yourdomain.com/api/industry?character_id=123456&region_id=10000043&min_profit=1000000&me_level=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### JavaScript Example

```javascript
const response = await fetch(
  '/api/industry?character_id=123456&region_id=10000002&me_level=10',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const data = await response.json();
console.log(`Found ${data.total} blueprints`);
```

## Caching

The endpoint uses HTTP caching headers:

```
Cache-Control: public, max-age=300, s-maxage=600
```

- Client cache: 5 minutes
- CDN cache: 10 minutes

Blueprint data changes infrequently, so caching helps reduce API load.

## Rate Limiting

This endpoint calls multiple ESI endpoints and may be subject to ESI rate limits:

- Character blueprints: ~1-5 pages
- Industry jobs: ~1-3 pages
- Type names: 1-2 requests (batch)
- Market orders: Up to 50 requests (one per blueprint processed)

To avoid timeouts, the endpoint limits processing to the first 50 blueprints.

## Implementation Notes

### Current Limitations

1. **Simplified Profit Calculation**: The current implementation returns blueprint market prices rather than full manufacturing profit calculations. A complete implementation would require:
   - Blueprint details from SDE (Static Data Export)
   - Material costs from market
   - Job installation costs
   - Output product market value

2. **Processing Limit**: Limited to 50 blueprints to avoid timeout

3. **Market Data**: Only fetches from specified region, doesn't compare across regions

### Future Enhancements

Planned improvements:

1. **Full Manufacturing Profit**: Calculate actual manufacturing costs vs output value
2. **Material Breakdown**: Show required materials and their costs
3. **Job Cost Estimation**: Include installation fees and taxes
4. **Multi-Region Comparison**: Compare profitability across regions
5. **Historical Analysis**: Track profit trends over time
6. **Blueprint Recommendations**: AI-powered suggestions for most profitable blueprints

## Related Endpoints

- `/api/station` - Station trading analysis
- `/api/hauling` - Hauling profit analysis
- `/api/orders` - Market order depth analysis

## ESI Dependencies

This endpoint relies on the following ESI endpoints:

- `GET /characters/{character_id}/blueprints/`
- `GET /characters/{character_id}/industry/jobs/`
- `GET /markets/{region_id}/orders/`
- `GET /universe/types/{type_id}/`
- `POST /universe/names/`

## Support

For issues or questions:

1. Check the request ID in error responses for debugging
2. Verify your access token has required scopes
3. Ensure character_id is valid and belongs to authenticated character
4. Check ESI status: https://status.eveonline.com/

## Version

- API Version: 1.0.0
- ESI Version: latest
- Last Updated: 2025-12-02
