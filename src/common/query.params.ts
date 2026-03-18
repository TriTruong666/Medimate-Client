export function cleanQueryParams<T extends Record<string, unknown>>(params: T) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== null),
    );
}