/**
 * Format number to display with k/m suffix
 * @param num Number to format
 * @returns Formatted string
 */
export const formatNumber = (num: number | string): string => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(n)) return '0';
    
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'm';
    }
    
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'k';
    }
    
    return n.toString();
  };
  
  /**
   * Format date to display in user-friendly format
   * @param date Date to format
   * @returns Formatted date string
   */
  export const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return 'Invalid date';
    }
    
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  /**
   * Capitalize first letter of string
   * @param str String to capitalize
   * @returns Capitalized string
   */
  export const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  /**
   * Truncate text to specific length with ellipsis
   * @param text Text to truncate
   * @param length Maximum length
   * @returns Truncated text
   */
  export const truncateText = (text: string, length: number): string => {
    if (!text) return '';
    if (text.length <= length) return text;
    
    return text.substring(0, length) + '...';
  };
  
  /**
   * Get initials from name
   * @param name Full name
   * @returns Initials (up to 2 characters)
   */
  export const getInitials = (name: string): string => {
    if (!name) return '';
    
    const parts = name.split(' ');
    
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  /**
   * Generate random ID
   * @returns Random ID string
   */
  export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };