import React, { useState, useMemo, useCallback } from "react";
import { Box, FormField, MultiSelect, Loader, Text } from "@wix/design-system";
import { useSitePages } from "../../../../hooks/useSitePages";
import { debugLogger } from "../../../../utils/debug-logger";

interface PageSelectorProps {
    selectedPaths: string[];
    onPathsChange: (paths: string[]) => void;
    disabled?: boolean;
    maxPaths?: number; // optional limit (defaults to 10)
}

const SLUG_REGEX = /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/i; // supports nested segments

const PageSelector: React.FC<PageSelectorProps> = ({
    selectedPaths,
    onPathsChange,
    disabled = false,
    maxPaths = 10,
}) => {
    const [inputValue, setInputValue] = useState("");

    const normalizePath = useCallback((raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return "";
        return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    }, []);

    // Derived validation states
    const hasLeadingSlash = inputValue.length <= 1 || inputValue.startsWith("/");
    const isDuplicate = selectedPaths.some(
        (p) => p.toLowerCase() === inputValue.toLowerCase()
    );
    const slugFormatInvalid =
        inputValue.length > 1 && hasLeadingSlash && !SLUG_REGEX.test(normalizePath(inputValue));
    const maxReached = selectedPaths.length >= maxPaths;
    const isEmptySet = selectedPaths.length === 0 && inputValue.length === 0;

    // Removed verbose props change logging

    // Fetch site pages using the same pattern as other components
    const { data: pages = [], isLoading, error } = useSitePages({
        enabled: true,
        onSuccess: () => { },
        onError: (err) => {
            debugLogger.error("page-selector", "Failed to load site pages", err);
        },
    });

    // Convert site pages to MultiSelect options format
    const sitePageOptions = useMemo(() => {
        if (!pages || pages.length === 0) return [];
        return pages.map((page) => ({ id: page.url, value: page.url, label: page.name }));
    }, [pages]);

    // Clean and prepare current selections - be more conservative with cleaning
    const cleanedPaths = useMemo(() => {
        const filtered = selectedPaths.filter((path) => path && path.trim());
        const unique = filtered.length !== new Set(filtered).size ? [...new Set(filtered)] : filtered;
        return unique;
    }, [selectedPaths]);

    // Filter out options that are already selected (case-insensitive)
    const availableOptions = useMemo(() => {
        if (!sitePageOptions.length) return sitePageOptions;
        if (!cleanedPaths.length) return sitePageOptions;
        const selectedSet = new Set(cleanedPaths.map(p => p.toLowerCase()));
        return sitePageOptions.filter(opt => !selectedSet.has(opt.value.toLowerCase()));
    }, [sitePageOptions, cleanedPaths]);

    // Convert cleaned paths to MultiSelect tags format
    const currentTags = useMemo(
        () =>
            cleanedPaths.map((path, index) => ({
                id: `path-${index}`,
                value: path,
                label: path,
            })),
        [cleanedPaths]
    );

    // Handle selecting from predefined options
    const handleOnSelect = (option: any) => {
        if (maxReached) return;
        const normalized = normalizePath(option.value);
        const exists = cleanedPaths.some((p) => p.toLowerCase() === normalized.toLowerCase());
        if (!exists) onPathsChange([...cleanedPaths, normalized]);
    };

    // Handle manual input of custom paths
    const handleManualInput = (tags: string[]) => {
        const raw = tags[0];
        if (!raw) return;
        const normalized = normalizePath(raw);
        if (
            !normalized ||
            isDuplicate ||
            maxReached ||
            !hasLeadingSlash ||
            slugFormatInvalid
        ) {
            setInputValue("");
            return;
        }
        onPathsChange([...cleanedPaths, normalized]);
        setInputValue("");
    };

    // Handle removing tags - FIXED: Use the tag ID correctly with fallback and verification
    const handleOnRemoveTag = (tagId: string) => {
        // Extract index from tag ID
        const tagIndex = parseInt(tagId.replace("path-", ""));

        // Primary method: Remove by index
        if (!isNaN(tagIndex) && tagIndex >= 0 && tagIndex < cleanedPaths.length) {
            const pathToRemove = cleanedPaths[tagIndex];
            const newPaths = cleanedPaths.filter((_, index) => index !== tagIndex);

            // Verify the change was meaningful, then propagate
            if (newPaths.length === cleanedPaths.length - 1) {
                onPathsChange(newPaths);
            } else {
                debugLogger.error("page-selector", "Removal failed - array length didn't decrease", {
                    expectedLength: cleanedPaths.length - 1,
                    actualLength: newPaths.length
                });
            }
            return;
        }

        // Fallback method: Find and remove by matching tag value
        const matchingTag = currentTags.find(tag => tag.id === tagId);
        if (matchingTag) {
            const pathToRemove = matchingTag.value;
            const newPaths = cleanedPaths.filter(path => path !== pathToRemove);

            if (newPaths.length < cleanedPaths.length) {
                onPathsChange(newPaths);
            }
            return;
        }

        // If neither method works, log error
        debugLogger.error("page-selector", "Failed to remove tag - no matching path found", {
            tagId,
            tagIndex,
            cleanedPathsLength: cleanedPaths.length,
            cleanedPaths,
            currentTags: currentTags.map(t => ({ id: t.id, value: t.value }))
        });
    };

    // Handle input change for autocomplete
    const handleOnChange = (event: any) => {
        const value = event.target.value;
        setInputValue(value);
    };

    // Predicate for filtering options based on input
    const predicate = (option: any) =>
        inputValue ? option.value.toLowerCase().includes(inputValue.toLowerCase()) : true;


    const helperMessage = (() => {
        if (maxReached) return `Maximum ${maxPaths} paths allowed.`;
        if (!hasLeadingSlash && inputValue.length > 1) return 'Path must start with "/" (e.g., /pricing)';
        if (isDuplicate && inputValue) return 'This path is already added.';
        if (slugFormatInvalid) return 'Use only letters, numbers, and dashes (e.g., /summer-sale)';
        if (isEmptySet) return 'Select pages where your widget should appear.';
        return 'Press Enter to add. Supports nested paths like /blog/posts.';
    })();

    // Derive status for FormField / MultiSelect following design system guidelines
    const hasError = slugFormatInvalid || (inputValue.length > 1 && !hasLeadingSlash) || (isDuplicate && !!inputValue);
    const hasWarning = !hasError && (maxReached || isEmptySet);
    const status: 'error' | 'warning' | undefined = hasError ? 'error' : hasWarning ? 'warning' : undefined;
    const statusMessage = (() => {
        if (hasError) {
            if (slugFormatInvalid) return 'Invalid path format. Use letters, numbers, and dashes only.';
            if (isDuplicate) return 'This path has already been added';
            if (!hasLeadingSlash) return 'Path must start with "/" (e.g., /pricing)';
        }
        if (hasWarning) {
            if (maxReached) return `You've reached the maximum of ${maxPaths} paths.`;
            if (isEmptySet) return 'Your widget needs at least one page to appear on.';
        }
        return undefined;
    })();

    return (
        <FormField
            label="Specific Pages"
            infoContent={
                isLoading
                    ? "Loading your site pages..."
                    : error
                        ? "Could not load site pages. You can still type custom paths."
                        : sitePageOptions.length > 0
                            ? "Select site pages or type custom paths."
                            : "Type page paths (e.g., /about, /contact)."
            }
            status={status}
            statusMessage={statusMessage || helperMessage}
            suffix={
                <Text size="tiny" skin="disabled">{`${selectedPaths.length} / ${maxPaths}`}</Text>
            }
        >
            {isLoading ? (
                <Box align="center" paddingTop="12px" paddingBottom="12px">
                    <Loader size="small" text="Loading site pages..." />
                </Box>
            ) : (

                <MultiSelect
                    size="medium"
                    placeholder={
                        maxReached
                            ? "Limit reached"
                            : sitePageOptions.length > 0
                                ? "Select or type path"
                                : "Type path (/about)"
                    }
                    options={availableOptions}
                    tags={currentTags}
                    value={inputValue}
                    onChange={handleOnChange}
                    onSelect={handleOnSelect}
                    onRemoveTag={handleOnRemoveTag}
                    onManuallyInput={handleManualInput}
                    predicate={predicate}
                    clearOnBlur={false}
                    acceptOnBlur={true}
                    delimiters={[",", ";"]}
                    disabled={disabled || maxReached}
                    status={status}
                />

            )}
        </FormField>
    );
};

export default PageSelector;
