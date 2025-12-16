export interface PreviewProps {
  fileUrl: string | null;
  title?: string;
  courseCode?: string;
  showPreviewButton?: boolean;
  layoutVariant?: 'default' | 'overlay';
  onClose?: () => void;
  onFullscreen?: () => void;
}

export interface PreviewState {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  loadingProgress: number;
}

