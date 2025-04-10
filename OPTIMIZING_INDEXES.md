# MongoDB Index Optimization for Study Offers

## Overview
This document outlines the index optimization strategies implemented for the `StudyOffer` collection to improve query performance and reduce database load. Proper indexing is crucial for efficient queries, especially as the dataset grows.

## Index Strategy

### Text Search Indexes
```javascript
StudyOfferSchema.index(
  { 
    title: 'text', 
    description: 'text', 
    universityName: 'text', 
    programs: 'text', 
    location: 'text' 
  }, 
  { 
    weights: { 
      title: 10, 
      universityName: 5, 
      programs: 3,
      location: 2,
      description: 1
    },
    name: 'text_search_idx'
  }
);
```

**Purpose**: Optimizes full-text search across multiple fields with weighted relevance.
**When used**: For search queries when users search for programs, titles, or universities.
**Benefits**: 
- Prioritizes title matches (weight 10) over description matches (weight 1)
- Enables relevant search results by giving more importance to key fields
- Supports partial word matches for better search experience

### Basic Filter Indexes
```javascript
StudyOfferSchema.index({ degreeLevel: 1, category: 1 }, { name: 'degree_category_idx' });
StudyOfferSchema.index({ degreeLevel: 1, scholarshipAvailable: 1 }, { name: 'degree_scholarship_idx' });
StudyOfferSchema.index({ featured: 1, createdAt: -1 }, { name: 'featured_created_idx' });
StudyOfferSchema.index({ 'tuitionFees.amount': 1 }, { name: 'tuition_amount_idx' });
StudyOfferSchema.index({ durationInYears: 1 }, { name: 'duration_idx' });
StudyOfferSchema.index({ tags: 1, createdAt: -1 }, { name: 'tags_created_idx' });
StudyOfferSchema.index({ location: 1, degreeLevel: 1 }, { name: 'location_degree_idx' });
```

**Purpose**: Supports common filter combinations used in the application.
**When used**: For filtering study offers by degree level, category, scholarship availability, etc.
**Benefits**:
- Speeds up common filter operations
- Eliminates need to scan entire collection for filtered queries
- Optimizes sorting when combined with filtering

### Range Query Indexes
```javascript
StudyOfferSchema.index({ 'tuitionFees.amount': 1, createdAt: -1 }, { name: 'tuition_created_idx' });
StudyOfferSchema.index({ durationInYears: 1, createdAt: -1 }, { name: 'duration_created_idx' });
```

**Purpose**: Optimizes range-based queries (min/max values).
**When used**: For filtering by tuition fee range or program duration range.
**Benefits**:
- Improves performance for range queries
- Enables efficient sorting within range results
- Avoids expensive collection scans for range-based filters

### Multi-Criteria Indexes
```javascript
StudyOfferSchema.index({ 
  degreeLevel: 1, 
  scholarshipAvailable: 1, 
  featured: 1, 
  createdAt: -1 
}, { name: 'multi_criteria_idx' });
```

**Purpose**: Supports complex queries with multiple filter criteria.
**When used**: For advanced filtering with multiple parameters.
**Benefits**:
- Dramatically improves performance for complex queries
- Reduces need for in-memory filtering
- Enables efficient sorting within multi-filtered results

## Index Hint Strategy

The application now uses index hints based on query patterns to ensure the MongoDB query optimizer uses the most efficient index:

```javascript
// Example of index hint strategy
if (searchStage) {
  query$ = query$.hint('text_search_idx');
} else if (filters.degreeLevel && filters.category) {
  query$ = query$.hint('degree_category_idx');
} else if (filters.degreeLevel && (filters.minTuition || filters.maxTuition)) {
  query$ = query$.hint('degree_tuition_idx');
}
```

## Monitoring and Analysis

To monitor the effectiveness of indexes, we've added:

1. **Index Analysis Script**: `scripts/analyze-indexes.ts` helps analyze index usage statistics.
2. **Performance Logging**: Query times are logged to identify slow queries.
3. **Index Usage Tracking**: Tracks which indexes are being used and which are not.

## Best Practices

1. **Avoid Over-Indexing**: Too many indexes increase write operation overhead and storage requirements.
2. **Monitor Unused Indexes**: Regularly check for and consider removing unused indexes.
3. **Compound Indexes**: Use compound indexes for multi-field queries to improve performance.
4. **Explain Plan Analysis**: Periodically analyze query explain plans to ensure indexes are being used effectively.

## Future Considerations

1. **Index Rotation**: For time-series data, consider implementing index rotation for older data.
2. **Partial Indexes**: Implement partial indexes for queries that filter on a specific condition.
3. **Wildcard Indexes**: Consider wildcard indexes for dynamic query patterns if needed.
4. **Performance Benchmarking**: Regularly benchmark query performance to ensure optimizations are effective.

## Conclusion

The implemented index strategy significantly improves query performance by ensuring efficient use of indexes for common query patterns. This reduces response times, decreases server load, and improves overall application performance, especially as the dataset grows. 