import React from 'react';
import { render, act } from '@testing-library/react';
import { Profiler } from 'react';
import { usePermission } from '../../../hooks/common/usePermission';
import { useDeleteConfirm } from '../../../hooks/common/useDeleteConfirm';
import { useFilterPanel } from '../../../hooks/common/useFilterPanel';
import { TestWrapper } from '../../TestWrapper';
import { FilterValues } from '../../../types/filterPanel';

// Performance measurement callback
const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  console.log(`${id} - ${phase}:`);
  console.log(`Actual duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Commit time: ${commitTime}ms\n`);
};

// Helper function to measure hook performance
const measureHookPerformance = (useHook: Function, props: any = {}) => {
  let duration = 0;

  const TestComponent = () => {
    const result = useHook(props);
    return null;
  };

  render(
    <TestWrapper>
      <Profiler id={useHook.name} onRender={(id, phase, actualDuration) => {
        duration = actualDuration;
      }}>
        <TestComponent />
      </Profiler>
    </TestWrapper>
  );

  return duration;
};

describe('Common Hooks Performance Tests', () => {
  describe('usePermission Performance Tests', () => {
    test('usePermission initial render performance', () => {
      const renderTime = measureHookPerformance(usePermission, 'test.permission');
      expect(renderTime).toBeLessThan(100); // Expect render to take less than 100ms
    });

    test('usePermission update performance', async () => {
      let updateTime = 0;
      const TestComponent = () => {
        const { hasPermission } = usePermission('test.permission');
        return <div>{hasPermission.toString()}</div>;
      };

      render(
        <TestWrapper>
          <Profiler
            id="usePermissionUpdate"
            onRender={(id, phase, actualDuration) => {
              if (phase === 'update') {
                updateTime = actualDuration;
              }
            }}
          >
            <TestComponent />
          </Profiler>
        </TestWrapper>
      );

      await act(async () => {
        // Trigger a permission check update
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(updateTime).toBeLessThan(50); // Expect updates to be faster than initial render
    });
  });

  describe('useFilterPanel Performance Tests', () => {
    const mockFilters: FilterValues = {};
    const mockOnFilterChange = jest.fn();

    test('useFilterPanel initial render performance', () => {
      const renderTime = measureHookPerformance(useFilterPanel, [mockFilters, mockOnFilterChange]);
      expect(renderTime).toBeLessThan(100);
    });

    test('useFilterPanel state update performance', () => {
      let updateTime = 0;
      const TestComponent = () => {
        const { expanded, setExpanded, handleFilterChange } = useFilterPanel(mockFilters, mockOnFilterChange);
        React.useEffect(() => {
          setExpanded(true);
          handleFilterChange('status_id', 1);
        }, []);
        return null;
      };

      render(
        <TestWrapper>
          <Profiler
            id="useFilterPanelUpdate"
            onRender={(id, phase, actualDuration) => {
              if (phase === 'update') {
                updateTime = actualDuration;
              }
            }}
          >
            <TestComponent />
          </Profiler>
        </TestWrapper>
      );

      expect(updateTime).toBeLessThan(50);
    });
  });

  describe('useDeleteConfirm Performance Tests', () => {
    const mockOnConfirm = jest.fn();
    const mockOnClose = jest.fn();

    test('useDeleteConfirm initial render performance', () => {
      const renderTime = measureHookPerformance(useDeleteConfirm, [mockOnConfirm, mockOnClose]);
      expect(renderTime).toBeLessThan(100);
    });

    test('useDeleteConfirm state update performance', () => {
      let updateTime = 0;
      const TestComponent = () => {
        const { isDeleting, handleConfirm } = useDeleteConfirm(mockOnConfirm, mockOnClose);
        React.useEffect(() => {
          handleConfirm();
        }, []);
        return null;
      };

      render(
        <TestWrapper>
          <Profiler
            id="useDeleteConfirmUpdate"
            onRender={(id, phase, actualDuration) => {
              if (phase === 'update') {
                updateTime = actualDuration;
              }
            }}
          >
            <TestComponent />
          </Profiler>
        </TestWrapper>
      );

      expect(updateTime).toBeLessThan(50);
    });
  });
});
