import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationState } from '@/hooks/usePaginatedQuery';

interface PaginationControlsProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  onPageChange,
  onNextPage,
  onPreviousPage,
  hasNextPage,
  hasPreviousPage,
  isLoading = false,
  showPageNumbers = true,
  maxVisiblePages = 5,
}) => {
  const { page, totalPages, totalCount, pageSize } = pagination;
  
  // Calculate visible page range
  const getVisiblePages = () => {
    const pages: number[] = [];
    let start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalCount}</span> results
      </p>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage || isLoading}
          className="h-8 w-8"
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage || isLoading}
          className="h-8 w-8"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Page numbers */}
        {showPageNumbers && (
          <div className="flex items-center gap-1 mx-2">
            {visiblePages[0] > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  1
                </Button>
                {visiblePages[0] > 2 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
              </>
            )}
            
            {visiblePages.map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className="h-8 w-8"
              >
                {pageNum}
              </Button>
            ))}
            
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
        )}
        
        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          onClick={onNextPage}
          disabled={!hasNextPage || isLoading}
          className="h-8 w-8"
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
          className="h-8 w-8"
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
