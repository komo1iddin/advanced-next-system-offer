import { 
  QueryKey, 
  UseQueryOptions, 
  UseQueryResult, 
  useQuery 
} from '@tanstack/react-query';

/**
 * Hook for creating a query that depends on the result of another query
 * 
 * This hook simplifies the pattern of dependent queries by automatically
 * handling the enabled flag and properly typing the dependencies
 * 
 * @param parentQuery - The result of the parent query (useQuery result)
 * @param queryConfig - The configuration for the dependent query
 * @returns UseQueryResult for the dependent query
 */
export function useDependentQuery<
  TParentData,
  TParentError,
  TChildData,
  TChildError = TParentError
>(
  parentQuery: UseQueryResult<TParentData, TParentError>,
  queryConfig: Omit<UseQueryOptions<TChildData, TChildError, TChildData, QueryKey>, 'enabled'> & {
    enabled?: boolean;
  }
): UseQueryResult<TChildData, TChildError> {
  const { data: parentData, isSuccess: parentIsSuccess } = parentQuery;

  // Enable the child query only if the parent query is successful and the parent data exists
  const enabled = queryConfig.enabled !== false && parentIsSuccess && !!parentData;

  return useQuery<TChildData, TChildError>({
    ...queryConfig,
    enabled,
  });
}

/**
 * Hook for creating a multi-step dependent query chain (parent -> middle -> child)
 * 
 * This hook simplifies the pattern of nested dependent queries by handling
 * the enabled flags and properly typing the dependencies
 * 
 * @param parentQuery - The result of the parent query
 * @param middleQueryConfig - The configuration for the middle query which depends on parent
 * @param childQueryConfigFn - Function to generate the config for the child query which depends on middle
 * @returns Object containing both the middle and child query results
 */
export function useMultiDependentQuery<
  TParentData,
  TParentError,
  TMiddleData,
  TMiddleError,
  TChildData,
  TChildError = TMiddleError
>(
  parentQuery: UseQueryResult<TParentData, TParentError>,
  middleQueryConfig: Omit<UseQueryOptions<TMiddleData, TMiddleError, TMiddleData, QueryKey>, 'enabled'> & {
    enabled?: boolean;
  },
  childQueryConfigFn: (
    middleData: TMiddleData
  ) => Omit<UseQueryOptions<TChildData, TChildError, TChildData, QueryKey>, 'enabled'> & {
    enabled?: boolean;
  }
): {
  middleQuery: UseQueryResult<TMiddleData, TMiddleError>;
  childQuery: UseQueryResult<TChildData, TChildError>;
} {
  // Setup the middle query that depends on parent
  const middleQuery = useDependentQuery<TParentData, TParentError, TMiddleData, TMiddleError>(
    parentQuery,
    middleQueryConfig
  );

  // Setup the child query that depends on middle
  const { data: middleData, isSuccess: middleIsSuccess } = middleQuery;

  // Only get the child config if middle query succeeded
  const childQueryConfig = middleIsSuccess && middleData 
    ? childQueryConfigFn(middleData) 
    : null;
  
  // Enable the child query only if config exists and not explicitly disabled
  const childEnabled = 
    !!childQueryConfig && 
    childQueryConfig.enabled !== false && 
    middleIsSuccess && 
    !!middleData;

  const childQuery = useQuery<TChildData, TChildError>({
    ...(childQueryConfig || { queryKey: ['placeholder'] }),
    enabled: childEnabled,
  });

  return {
    middleQuery,
    childQuery,
  };
}

/**
 * Hook for creating a dependent query that uses a specific value from the parent result
 * 
 * @param parentQuery - The result of the parent query
 * @param selectorFn - Function to extract the required value from parent data
 * @param queryConfig - The configuration for the dependent query
 * @returns UseQueryResult for the dependent query
 */
export function useSelectorDependentQuery<
  TParentData,
  TParentError,
  TSelected,
  TChildData,
  TChildError = TParentError
>(
  parentQuery: UseQueryResult<TParentData, TParentError>,
  selectorFn: (data: TParentData) => TSelected | undefined | null,
  queryConfig: (
    selected: TSelected
  ) => Omit<UseQueryOptions<TChildData, TChildError, TChildData, QueryKey>, 'enabled'> & {
    enabled?: boolean;
  }
): UseQueryResult<TChildData, TChildError> {
  const { data: parentData, isSuccess: parentIsSuccess } = parentQuery;
  
  // Extract the selected value from parent data if available
  const selectedValue = parentIsSuccess && parentData ? selectorFn(parentData) : null;
  
  // Generate query config if we have a selected value
  const generatedConfig = selectedValue ? queryConfig(selectedValue as TSelected) : null;
  
  // Enable only if we have config and selected value
  const enabled = 
    !!generatedConfig && 
    generatedConfig.enabled !== false && 
    parentIsSuccess && 
    !!selectedValue;

  return useQuery<TChildData, TChildError>({
    ...(generatedConfig || { queryKey: ['placeholder'] }),
    enabled,
  });
} 