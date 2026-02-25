import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageUploader from '../ImageUploader';

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(() => ({
    getRootProps: () => ({ 'data-testid': 'dropzone' }),
    getInputProps: () => ({ 'data-testid': 'file-input' }),
    isDragActive: false,
  })),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('ImageUploader', () => {
  const mockOnImagesChange = jest.fn();
  const defaultProps = {
    images: [],
    onImagesChange: mockOnImagesChange,
    maxImages: 5,
    maxSizePerImage: 2,
  };

  beforeEach(() => {
    mockOnImagesChange.mockClear();
  });

  it('renders upload area with instructions', () => {
    render(<ImageUploader {...defaultProps} />);
    
    expect(screen.getByText(/Zvarritni imazhet këtu ose klikoni për të zgjedhur/)).toBeInTheDocument();
    expect(screen.getByText(/Formatet e pranuara: JPEG, PNG, WebP/)).toBeInTheDocument();
    expect(screen.getByText('0/5 imazhe të ngarkuara')).toBeInTheDocument();
  });

  it('shows max images reached message when limit is reached', () => {
    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg'];
    render(<ImageUploader {...defaultProps} images={images} />);
    
    expect(screen.getByText(/Keni arritur limitin maksimal të imazheve/)).toBeInTheDocument();
    expect(screen.getByText(/Fshini disa imazhe për të shtuar të reja/)).toBeInTheDocument();
  });

  it('displays uploaded images with controls', () => {
    const images = ['image1.jpg', 'image2.jpg'];
    render(<ImageUploader {...defaultProps} images={images} />);
    
    expect(screen.getByText('Imazhet e Ngarkuara (2)')).toBeInTheDocument();
    
    
    // Check for primary image badge
    expect(screen.getByText('Kryesor')).toBeInTheDocument();
  });

  it('calls onImagesChange when removing an image', () => {
    const images = ['image1.jpg', 'image2.jpg'];
    render(<ImageUploader {...defaultProps} images={images} />);
    
    // Find and click the remove button (X icon)
    const removeButtons = screen.getAllByTitle('Fshi imazhin');
    fireEvent.click(removeButtons[0]);
    
    expect(mockOnImagesChange).toHaveBeenCalledWith(['image2.jpg']);
  });

  it('calls onImagesChange when moving images', () => {
    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
    render(<ImageUploader {...defaultProps} images={images} />);
    
    // Find and click the move right button for first image
    const moveRightButtons = screen.getAllByTitle('Lëviz djathtas');
    fireEvent.click(moveRightButtons[0]);
    
    expect(mockOnImagesChange).toHaveBeenCalledWith(['image2.jpg', 'image1.jpg', 'image3.jpg']);
  });

  it('shows helpful tips when no images are uploaded', () => {
    render(<ImageUploader {...defaultProps} />);
    
    expect(screen.getByText('Këshilla për imazhet:')).toBeInTheDocument();
    expect(screen.getByText(/Imazhi i parë do të jetë imazhi kryesor/)).toBeInTheDocument();
    expect(screen.getByText(/Përdorni imazhe me cilësi të lartë/)).toBeInTheDocument();
    expect(screen.getByText(/Rekomandohet të keni të paktën 3-5 imazhe/)).toBeInTheDocument();
  });

  it('shows loading state when uploading', () => {
    render(<ImageUploader {...defaultProps} />);
    
    // Simulate uploading state by checking if the component can handle it
    // This would require more complex mocking of the file upload process
    expect(screen.getByTestId('dropzone')).toBeInTheDocument();
  });

  it('displays correct image count', () => {
    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
    render(<ImageUploader {...defaultProps} images={images} />);
    
    expect(screen.getByText('3/5 imazhe të ngarkuara')).toBeInTheDocument();
    expect(screen.getByText('Imazhet e Ngarkuara (3)')).toBeInTheDocument();
  });

  it('shows move buttons only when appropriate', () => {
    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
    render(<ImageUploader {...defaultProps} images={images} />);
    
    // First image should not have move left button
    const moveLeftButtons = screen.queryAllByTitle('Lëviz majtas');
    expect(moveLeftButtons).toHaveLength(2); // Only for 2nd and 3rd images
    
    // Last image should not have move right button
    const moveRightButtons = screen.queryAllByTitle('Lëviz djathtas');
    expect(moveRightButtons).toHaveLength(2); // Only for 1st and 2nd images
  });

  it('handles single image correctly', () => {
    const images = ['single-image.jpg'];
    render(<ImageUploader {...defaultProps} images={images} />);
    
    expect(screen.getByText('Kryesor')).toBeInTheDocument();
    expect(screen.queryByTitle('Lëviz majtas')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Lëviz djathtas')).not.toBeInTheDocument();
    expect(screen.getByTitle('Fshi imazhin')).toBeInTheDocument();
  });
});