import { Tag } from './tag-service';

// Interface for tag row in table
export interface TagRow {
  id: string;
  name: string;
  category: string;
  active: boolean;
  createdAt: Date;
}

// Process tags for table display
export function processTagsForTable(tags: Tag[]): TagRow[] {
  return tags.map(tag => ({
    id: tag._id,
    name: tag.name,
    category: tag.category || 'General',
    active: tag.active,
    createdAt: new Date(tag.createdAt)
  }));
}

// Get unique categories from tags
export function getUniqueCategories(tags: Tag[]): string[] {
  const categories = new Set<string>();
  
  // Add 'General' as a default category
  categories.add('General');
  
  // Add all categories from tags
  tags.forEach(tag => {
    if (tag.category) {
      categories.add(tag.category);
    }
  });
  
  // Convert to array and sort
  return Array.from(categories).sort();
}

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
} 