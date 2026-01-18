import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import FileList from '../../../components/Files/FileList';
import FileUpload from '../../../components/Files/FileUpload';
import { TestWrapper } from '../../TestWrapper';
import { TaskFile } from '../../../types/file';

// Mock data
const mockFiles: TaskFile[] = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  task_id: 1,
  user_id: 1,
  name: `test-file-${index + 1}.txt`,
  original_name: `test-file-${index + 1}.txt`,
  mime_type: 'text/plain',
  size: 1024 * (index + 1), // Different sizes in KB
  url: `/files/${index + 1}/download?taskId=1`,
  uploaded_on: new Date().toISOString(),
  created_by: 1,
  created_by_name: 'Test User',
  uploaded_by: 'Test User',
  user_avatar: undefined
}));

// Performance measurement callback
const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  // Log performance metrics
  console.log(`${id} - ${phase}:`);
  console.log(`Actual duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Commit time: ${commitTime}ms\n`);
};

// Helper function to measure render performance
const measurePerformance = (Component: React.ComponentType<any>, props = {}) => {
  let duration = 0;

  render(
    <TestWrapper>
      <Profiler id={Component.name} onRender={(id, phase, actualDuration) => {
        duration = actualDuration;
      }}>
        <Component {...props} />
      </Profiler>
    </TestWrapper>
  );

  return duration;
};

describe('Files Components Performance Tests', () => {
  // FileList Performance Tests
  describe('FileList Performance Tests', () => {
    test('FileList initial render performance with empty list', () => {
      const renderTime = measurePerformance(FileList, {
        files: [],
        taskId: 1,
        onFileDeleted: jest.fn()
      });

      expect(renderTime).toBeLessThan(100); // Adjust threshold as needed
    });

    test('FileList render performance with 10 files', () => {
      const renderTime = measurePerformance(FileList, {
        files: mockFiles,
        taskId: 1,
        onFileDeleted: jest.fn()
      });

      expect(renderTime).toBeLessThan(500); // Adjust threshold as needed
    });

    test('FileList render performance with large file list', () => {
      const largeFileList = Array.from({ length: 50 }, (_, index) => ({
        ...mockFiles[0],
        id: index + 1,
        name: `test-file-${index + 1}.txt`
      }));

      const renderTime = measurePerformance(FileList, {
        files: largeFileList,
        taskId: 1,
        onFileDeleted: jest.fn()
      });

      expect(renderTime).toBeLessThan(1000); // Adjust threshold as needed
    });
  });

  // FileUpload Performance Tests
  describe('FileUpload Performance Tests', () => {
    test('FileUpload initial render performance', () => {
      const renderTime = measurePerformance(FileUpload, {
        taskId: 1,
        onFileUploaded: jest.fn()
      });

      expect(renderTime).toBeLessThan(100); // Adjust threshold as needed
    });

    test('FileUpload render performance during upload state', () => {
      // Mock the useFileUpload hook
      jest.mock('../../../hooks/file/useFileUpload', () => ({
        useFileUpload: () => ({
          uploading: true,
          progress: 50,
          error: null,
          handleFileChange: jest.fn(),
          setError: jest.fn()
        })
      }));

      const renderTime = measurePerformance(FileUpload, {
        taskId: 1,
        onFileUploaded: jest.fn()
      });

      expect(renderTime).toBeLessThan(120); // Adjust threshold as needed
    });

    test('FileUpload render performance with error state', () => {
      // Mock the useFileUpload hook
      jest.mock('../../../hooks/file/useFileUpload', () => ({
        useFileUpload: () => ({
          uploading: false,
          progress: 0,
          error: 'Test error message',
          handleFileChange: jest.fn(),
          setError: jest.fn()
        })
      }));

      const renderTime = measurePerformance(FileUpload, {
        taskId: 1,
        onFileUploaded: jest.fn()
      });

      expect(renderTime).toBeLessThan(120); // Adjust threshold as needed
    });
  });
});
